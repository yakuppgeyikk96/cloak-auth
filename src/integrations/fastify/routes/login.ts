import type { FastifyInstance } from "fastify";
import type { AuthRouteOptions } from "../types.js";
import type { LoginInput } from "../../../core/types.js";
import { AuthError } from "../../../core/errors.js";

export function registerLoginRoute(
  app: FastifyInstance,
  options: AuthRouteOptions,
): void {
  const { auth, cookieName, cookieOptions, routePrefix } = options;

  app.post<{ Body: LoginInput }>(
    `${routePrefix}/login`,
    async (request, reply) => {
      try {
        const result = await auth.login(request.body);

        reply.header("Cache-Control", "no-store");
        reply.setCookie(cookieName, result.token, {
          ...cookieOptions,
          expires: result.expiresAt,
        });

        return { user: result.user };
      } catch (error) {
        if (error instanceof AuthError) {
          const status = error.code === "INVALID_CREDENTIALS" ? 401 : 400;

          return reply.code(status).send({
            code: error.code,
            message: error.message,
          });
        }

        throw error;
      }
    },
  );
}
