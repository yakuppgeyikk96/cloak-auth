import type { FastifyInstance } from "fastify";
import type { AuthRouteOptions } from "../types.js";
import type { RegisterInput } from "../../../core/types.js";
import { AuthError } from "../../../core/errors.js";

export function registerRegisterRoute(
  app: FastifyInstance,
  options: AuthRouteOptions,
): void {
  const { auth, routePrefix } = options;

  app.post<{ Body: RegisterInput }>(
    `${routePrefix}/register`,
    {
      onRequest: options.requireAllowedOrigin,
    },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store");

      try {
        const result = await auth.register(request.body);
        return reply.code(201).send({ user: result.user });
      } catch (error) {
        if (error instanceof AuthError) {
          const status = error.code === "EMAIL_ALREADY_EXISTS" ? 409 : 400;
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
