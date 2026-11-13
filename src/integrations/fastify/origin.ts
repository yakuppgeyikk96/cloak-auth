import type { FastifyReply, FastifyRequest } from "fastify";

function validateOrigins(origins: readonly string[]) {
  for (const origin of origins) {
    let url: URL;

    try {
      url = new URL(origin);
    } catch {
      throw new Error(`Invalid allowed origin: ${origin}`);
    }

    if (!["http:", "https:"].includes(url.protocol) || url.origin !== origin) {
      throw new Error(
        `Allowed origin must contain only protocol, host and optional port: ${origin}`,
      );
    }
  }
}

export function createOriginGuard(allowedOrigins: readonly string[]) {
  validateOrigins(allowedOrigins);

  const origins = new Set(allowedOrigins);

  return async function requireAllowedOrigin(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const origin = request.headers.origin;

    if (!origin || origin === "null" || !origins.has(origin)) {
      reply.code(403).send({
        code: "ORIGIN_NOT_ALLOWED",
        message: "Origin is not allowed",
      });
    }
  };
}
