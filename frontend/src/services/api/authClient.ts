const APP_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiReponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

class ApiError extends Error {
  statusCode: number;
  errors: unknown[];
  code: string;

  constructor(statusCode: number, message: string, errors: unknown[] = [], code = "INTERNAL_ERROR") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
  }
}

const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiReponse<T>> => {
  const response = await fetch(`${APP_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(
      body.statusCode,
      body.message,
      body.errors,
      body.code
    );
  }

  return body;
}

export { apiClient, ApiError };