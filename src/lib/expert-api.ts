export type ExpertRole = "guest" | "free" | "premium" | "expert" | "admin";
export type ExpertTopLabel =
  | "meteorite"
  | "terrestrial_rock"
  | "uncertain"
  | "unusable"
  | "non_rock";
export type ExpertConfidence = "high" | "medium" | "low" | "not_assessed";
export type ExpertAnnotationAction = "label" | "skip" | "unusable" | "review";

export interface ExpertSession {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  role: ExpertRole;
  name?: string;
  email?: string;
}

export interface ExpertDataset {
  id: string;
  name: string;
  description?: string;
  status: string;
  taxonomyVersion: string;
  annotationPolicyVersion: string;
}

export interface ExpertPrediction {
  modelVersion?: string;
  meteoriteProbability?: number;
  decisionBand?: string;
  dominantClass?: string;
  classConfidence?: number;
  models: Record<
    string,
    {
      meteoriteProbability?: number;
      dominantClass?: string;
      classConfidence?: number;
    }
  >;
}

export interface ExpertQueueItem {
  itemId: string;
  datasetId: string;
  status: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  originalFilename?: string;
  specimenId?: string;
  contentType?: string;
  qualityReport?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  prediction?: ExpertPrediction;
}

export interface ExpertDatasetStats {
  datasetId: string;
  counts: Record<string, number>;
  labelCounts: Record<string, number>;
  qualityCounts: Record<string, number>;
  lastAuditId?: string;
}

export interface ExpertAnnotationInput {
  clientUuid: string;
  action: ExpertAnnotationAction;
  topLabel?: ExpertTopLabel;
  meteoriteSubclass?: string;
  terrestrialFamily?: string;
  confidence?: ExpertConfidence;
  comment?: string;
  specimenId?: string;
  metadata?: Record<string, unknown>;
}

export interface ExpertAnnotationResult {
  annotationId: string;
  consensusStatus: string;
  reviewRequired: boolean;
  nextItemAvailable: boolean;
}

const SESSION_KEY = "tissint.expert.session";
const API_BASE = "/api/proxy";

function apiPath(path: string) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function expertMediaUrl(path?: string) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith(API_BASE)) return path;
  return apiPath(path);
}

function valueString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function valueNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeRole(role: unknown): ExpertRole {
  return role === "guest" ||
    role === "free" ||
    role === "premium" ||
    role === "expert" ||
    role === "admin"
    ? role
    : "free";
}

function normalizeSession(payload: any): ExpertSession {
  const user = payload?.user ?? payload;
  const tokens = payload?.tokens ?? payload;
  return {
    accessToken: valueString(tokens?.access_token ?? tokens?.accessToken),
    refreshToken: valueString(tokens?.refresh_token ?? tokens?.refreshToken, undefined),
    userId: valueString(user?.id, undefined),
    role: normalizeRole(user?.role),
    name: [user?.first_name ?? user?.firstName, user?.last_name ?? user?.lastName]
      .filter(Boolean)
      .join(" "),
    email: valueString(user?.email, undefined),
  };
}

function normalizePrediction(payload: any): ExpertPrediction | undefined {
  if (!payload) return undefined;
  const models: ExpertPrediction["models"] = {};
  for (const [name, model] of Object.entries(payload.models ?? {})) {
    const value = model as any;
    models[name] = {
      meteoriteProbability: valueNumber(
        value?.meteorite_probability ?? value?.meteoriteProbability,
      ),
      dominantClass: valueString(value?.dominant_class ?? value?.dominantClass, undefined),
      classConfidence: valueNumber(value?.class_confidence ?? value?.classConfidence),
    };
  }
  return {
    modelVersion: valueString(payload.model_version ?? payload.modelVersion, undefined),
    meteoriteProbability: valueNumber(
      payload.meteorite_probability ?? payload.meteoriteProbability,
    ),
    decisionBand: valueString(payload.decision_band ?? payload.decisionBand, undefined),
    dominantClass: valueString(payload.dominant_class ?? payload.dominantClass, undefined),
    classConfidence: valueNumber(payload.class_confidence ?? payload.classConfidence),
    models,
  };
}

function normalizeDataset(payload: any): ExpertDataset {
  return {
    id: String(payload.id),
    name: valueString(payload.name, "Dataset"),
    description: valueString(payload.description, undefined),
    status: valueString(payload.status, "unknown"),
    taxonomyVersion: valueString(
      payload.taxonomy_version ?? payload.taxonomyVersion,
      "taxonomy-v1",
    ),
    annotationPolicyVersion: valueString(
      payload.annotation_policy_version ?? payload.annotationPolicyVersion,
      "policy-v1",
    ),
  };
}

function normalizeQueueItem(payload: any): ExpertQueueItem {
  return {
    itemId: String(payload.item_id ?? payload.itemId),
    datasetId: String(payload.dataset_id ?? payload.datasetId),
    status: valueString(payload.status, "queued"),
    imageUrl: valueString(payload.image_url ?? payload.imageUrl, undefined),
    thumbnailUrl: valueString(payload.thumbnail_url ?? payload.thumbnailUrl, undefined),
    originalFilename: valueString(payload.original_filename ?? payload.originalFilename, undefined),
    specimenId: valueString(payload.specimen_id ?? payload.specimenId, undefined),
    contentType: valueString(payload.content_type ?? payload.contentType, undefined),
    qualityReport: payload.quality_report ?? payload.qualityReport ?? undefined,
    metadata: payload.metadata ?? {},
    prediction: normalizePrediction(payload.prediction),
  };
}

function authHeaders(session?: ExpertSession | null) {
  return {
    "Content-Type": "application/json",
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    ...(session?.userId ? { "X-User-Id": session.userId } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  session?: ExpertSession | null,
): Promise<T> {
  const response = await fetch(apiPath(path), {
    ...options,
    headers: {
      ...authHeaders(session),
      ...(options.headers ?? {}),
    },
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const message =
      typeof payload === "object"
        ? (payload?.error?.message ?? payload?.message ?? `HTTP ${response.status}`)
        : String(payload || `HTTP ${response.status}`);
    throw new Error(message);
  }
  return payload as T;
}

export function getSavedExpertSession(): ExpertSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ExpertSession;
    return parsed.accessToken ? parsed : null;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveExpertSession(session: ExpertSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearExpertSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function loginExpert(phoneOrEmail: string, password: string): Promise<ExpertSession> {
  const payload = await request<any>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phone_or_email: phoneOrEmail,
      password,
      device_id: `web-expert-${Date.now()}`,
    }),
  });
  const session = normalizeSession(payload);
  if (!session.accessToken) throw new Error("لم يرجع الخادم رمز الدخول.");
  saveExpertSession(session);
  return session;
}

export async function listExpertDatasets(session: ExpertSession): Promise<ExpertDataset[]> {
  const payload = await request<any[]>("/api/v1/expert/datasets", {}, session);
  return payload.map(normalizeDataset);
}

export async function getExpertDatasetStats(
  datasetId: string,
  session: ExpertSession,
): Promise<ExpertDatasetStats> {
  const payload = await request<any>(
    `/api/v1/expert/datasets/${encodeURIComponent(datasetId)}/stats`,
    {},
    session,
  );
  return {
    datasetId: String(payload.dataset_id ?? payload.datasetId ?? datasetId),
    counts: payload.counts ?? {},
    labelCounts: payload.label_counts ?? payload.labelCounts ?? {},
    qualityCounts: payload.quality_counts ?? payload.qualityCounts ?? {},
    lastAuditId: valueString(payload.last_audit_id ?? payload.lastAuditId, undefined),
  };
}

export async function getNextExpertItem(
  datasetId: string | undefined,
  session: ExpertSession,
): Promise<ExpertQueueItem | null> {
  const query = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
  const payload = await request<any | null>(`/api/v1/expert/queue/next${query}`, {}, session);
  return payload ? normalizeQueueItem(payload) : null;
}

export async function annotateExpertItem(
  itemId: string,
  input: ExpertAnnotationInput,
  session: ExpertSession,
): Promise<ExpertAnnotationResult> {
  const payload = await request<any>(
    `/api/v1/expert/items/${encodeURIComponent(itemId)}/annotation`,
    {
      method: "POST",
      body: JSON.stringify({
        client_uuid: input.clientUuid,
        action: input.action,
        top_label: input.topLabel,
        meteorite_subclass: input.meteoriteSubclass,
        terrestrial_family: input.terrestrialFamily,
        confidence: input.confidence,
        comment: input.comment,
        specimen_id: input.specimenId,
        metadata: input.metadata,
      }),
    },
    session,
  );
  return {
    annotationId: String(payload.annotation_id ?? payload.annotationId),
    consensusStatus: valueString(payload.consensus_status ?? payload.consensusStatus, "pending"),
    reviewRequired: Boolean(payload.review_required ?? payload.reviewRequired),
    nextItemAvailable: Boolean(payload.next_item_available ?? payload.nextItemAvailable),
  };
}
