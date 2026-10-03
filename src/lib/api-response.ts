import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}

export const apiResponse = {
  success<T>(data: T, meta?: Record<string, unknown>, status = 200) {
    const payload: ApiSuccessResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
    return NextResponse.json(payload, { status });
  },

  error(
    code: string,
    message: string,
    details?: Array<{ field?: string; message: string }>,
    status = 400
  ) {
    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return NextResponse.json(payload, { status });
  },

  unauthorized(message = "Authentication required to perform this action.") {
    return this.error("UNAUTHORIZED", message, undefined, 401);
  },

  notFound(message = "Requested entity was not found.") {
    return this.error("NOT_FOUND", message, undefined, 404);
  },

  validationError(details: Array<{ field?: string; message: string }>) {
    return this.error(
      "VALIDATION_ERROR",
      "Request payload validation failed.",
      details,
      422
    );
  },
};

export const apiSuccess = <T>(data: T, status = 200, meta?: Record<string, unknown>) =>
  apiResponse.success(data, meta, status);

export const apiError = (
  code: string,
  message: string,
  status = 400,
  details?: Array<{ field?: string; message: string }>
) => apiResponse.error(code, message, details, status);

