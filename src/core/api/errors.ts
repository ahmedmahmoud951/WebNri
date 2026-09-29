import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly code: string;
  readonly correlationId?: string;
  readonly statusCode?: number;

  constructor(params: {
    code: string;
    message: string;
    correlationId?: string;
    statusCode?: number;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.correlationId = params.correlationId;
    this.statusCode = params.statusCode;
  }

  static fromBody(body: Partial<ApiErrorBody>, statusCode?: number): ApiError {
    const code =
      body.code ??
      body.errorCode ??
      (statusCode === 429 ? 'rate_limited' : undefined) ??
      (statusCode === 401 ? 'UNAUTHORIZED' : undefined) ??
      'UNKNOWN';
    return new ApiError({
      code,
      message: body.message ?? defaultMessage(code, statusCode),
      correlationId: body.correlationId,
      statusCode,
    });
  }

  static network(details?: string): ApiError {
    return new ApiError({
      code: 'NETWORK',
      message: details ?? 'Network error',
    });
  }

  static unauthorized(): ApiError {
    return new ApiError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
      statusCode: 401,
    });
  }
}

function defaultMessage(code: string, statusCode?: number): string {
  if (code === 'rate_limited' || statusCode === 429) {
    return 'Too many requests. Wait one minute and try again.';
  }
  if (code === 'invalid_credentials') {
    return 'Invalid username or password';
  }
  if (code === 'FORBIDDEN' || statusCode === 403) {
    return 'You do not have permission for this action.';
  }
  if (code === 'NO_CURRENT_SUBSCRIPTION' || code === 'NO_SUBSCRIPTION') {
    return 'No active subscription';
  }
  if (code === 'NO_CURRENT_SESSION') {
    return 'No current session';
  }
  if (code === 'RESERVATION_CONFLICT') {
    return 'This slot is already reserved for that time.';
  }
  if (code === 'INVITE_NOT_FOUND') {
    return 'Invite not found';
  }
  if (code === 'NO_CURRENT_PASS' || code === 'NO_PASS') {
    return 'No access pass';
  }
  return 'Unexpected error';
}

const EMPTY_BUSINESS_CODES = new Set([
  'NO_CURRENT_SUBSCRIPTION',
  'NO_SUBSCRIPTION',
  'NO_CURRENT_SESSION',
  'INVITE_NOT_FOUND',
  'NO_CURRENT_PASS',
  'NO_PASS',
]);

export function isEmptyBusinessError(error: unknown): boolean {
  return error instanceof ApiError && EMPTY_BUSINESS_CODES.has(error.code);
}

export function isMissingRoute(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (isEmptyBusinessError(error)) return false;
  return (
    error.statusCode === 404 ||
    error.statusCode === 501 ||
    error.code === 'NOT_IMPLEMENTED' ||
    error.code === 'NOT_FOUND'
  );
}

export function isUnimplementedRoute(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.statusCode === 501 || error.code === 'NOT_IMPLEMENTED';
}

export function shouldSkipRetry(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.statusCode === 401 ||
    error.statusCode === 403 ||
    error.statusCode === 429 ||
    error.code === 'rate_limited' ||
    error.code === 'invalid_credentials' ||
    error.code === 'INVITE_NOT_FOUND' ||
    error.code === 'FORBIDDEN'
  );
}
