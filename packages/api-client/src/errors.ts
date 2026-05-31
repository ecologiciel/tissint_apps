import type { ApiErrorCode, ApiErrorPayload } from "@tissint/shared";

export class TissintApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly payload?: unknown;

  constructor(error: ApiErrorPayload & { payload?: unknown }) {
    super(error.message);
    this.name = "TissintApiError";
    this.code = error.code;
    this.status = error.status;
    this.payload = error.payload;
  }
}

export function isTissintApiError(error: unknown): error is TissintApiError {
  return error instanceof TissintApiError;
}

export function errorCodeForStatus(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 402) return "PREMIUM_REQUIRED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 413) return "FILE_TOO_LARGE";
  if (status === 415) return "INVALID_FILE_FORMAT";
  if (status === 422 || status === 400) return "VALIDATION_ERROR";
  if (status === 429) return "RATE_LIMITED";
  if (status === 503) return "SERVICE_UNAVAILABLE";
  return "HTTP_ERROR";
}
