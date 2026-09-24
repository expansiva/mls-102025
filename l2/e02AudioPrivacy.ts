/// <mls fileReference="_102025_/l2/e02AudioPrivacy.ts" enhancement="_blank" />

export interface E02PrivateViewCache<T> {
  audioUrl: string;
  processingId: string;
  processing: T | undefined;
  correctionDraft: string;
  interpretationRequest: string;
  selectedVersion: number | null;
  feedback: string;
}

export function e02ErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === 'number' && Number.isFinite(status) ? status : null;
}

export function isE02AccessRevokedError(error: unknown): boolean {
  const status = e02ErrorStatus(error);
  return status === 403 || status === 404;
}

/** Pure fail-closed reducer used by the UI and its privacy regression tests. */
export function clearE02PrivateCacheOnAccessError<T>(
  error: unknown,
  current: E02PrivateViewCache<T>,
): { revoked: boolean; cache: E02PrivateViewCache<T> } {
  if (!isE02AccessRevokedError(error)) return { revoked: false, cache: current };
  return {
    revoked: true,
    cache: {
      audioUrl: '', processingId: '', processing: undefined, correctionDraft: '',
      interpretationRequest: '', selectedVersion: null, feedback: '',
    },
  };
}
