export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly cause?: unknown;

  constructor(message: string, status: number, endpoint: string, cause?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.cause = cause;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export class NetworkError extends ApiError {
  constructor(endpoint: string, cause?: unknown) {
    super('网络请求失败，请检查连接', 0, endpoint, cause);
    this.name = 'NetworkError';
  }
}

export function formatErrorMessage(err: unknown, fallback = '操作失败'): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return err.message;
    if (err.isClientError) return `${err.message}`;
    if (err.isServerError) return `服务器错误 (${err.status}): ${err.message}`;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
