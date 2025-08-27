import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createApiLogger() {
  return {
    info: (message: string, meta?: Record<string, any>) => {
      console.log(JSON.stringify({
        level: "info",
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    },
    error: (message: string, error?: Error, meta?: Record<string, any>) => {
      console.error(JSON.stringify({
        level: "error",
        message,
        timestamp: new Date().toISOString(),
        error: error?.message,
        stack: error?.stack,
        ...meta
      }));
    }
  };
}

export function withCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const allowedOrigins = [env.CORS_ORIGIN];
  
  if (env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:3000");
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : "null",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return null;
}

export function withApiLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    const logger = createApiLogger();
    
    logger.info("API request started", {
      correlationId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
    });

    try {
      const corsResponse = withCors(request);
      if (corsResponse) return corsResponse;

      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      logger.info("API request completed", {
        correlationId,
        method: request.method,
        url: request.url,
        status: response.status,
        duration,
      });

      response.headers.set("X-Correlation-ID", correlationId);
      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error("API request failed", error as Error, {
        correlationId,
        method: request.method,
        url: request.url,
        duration,
      });

      const errorResponse = NextResponse.json(
        {
          success: false,
          message: "Internal server error",
          correlationId,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );

      errorResponse.headers.set("X-Correlation-ID", correlationId);
      return errorResponse;
    }
  };
}