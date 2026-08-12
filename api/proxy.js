const FORWARDED_HEADERS = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "x-requested-with",
  "x-user-id",
];

export const config = {
  api: {
    bodyParser: false,
  },
};

function setCors(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization,content-type,accept-language,x-user-id,x-requested-with",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD");
  res.setHeader("Access-Control-Max-Age", "600");
}

function requestPath(req) {
  const raw = req.query?.path;
  const value = Array.isArray(raw) ? raw.join("/") : String(raw || "/");
  return value.startsWith("/") ? value : `/${value}`;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    if (req.readableEnded) {
      resolve(Buffer.alloc(0));
      return;
    }
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function requestBody(req) {
  if (["GET", "HEAD"].includes(req.method)) return undefined;
  if (req.body != null && req.body !== "") {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") return req.body;
    if (typeof req.body === "object") return JSON.stringify(req.body);
  }
  const raw = await readRawBody(req);
  return raw.length > 0 ? raw : undefined;
}

export default async function handler(req, res) {
  const requestOrigin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  setCors(res, requestOrigin);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const origin = String(process.env.HOSTINGER_API_ORIGIN || "").replace(/\/+$/, "");
  const apiKey = String(process.env.HOSTINGER_API_KEY || "");
  if (!origin || !apiKey) {
    res.status(500).json({
      error: { code: "PROXY_NOT_CONFIGURED", message: "Proxy serveur غير مهيأ." },
    });
    return;
  }

  const target = new URL(`${origin}${requestPath(req)}`);
  const incomingUrl = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
  incomingUrl.searchParams.delete("path");
  incomingUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers[name];
    if (typeof value === "string" && value) headers.set(name, value);
  }
  headers.set("x-api-key", apiKey);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: await requestBody(req),
    });
    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.status(upstream.status).send(Buffer.from(body));
  } catch (error) {
    console.error("Hostinger proxy failure", error);
    res.status(502).json({
      error: { code: "UPSTREAM_UNAVAILABLE", message: "خادم Tissint غير متاح حاليا." },
    });
  }
}
