import type { ApiErrorPayload } from "@tissint/shared";

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
