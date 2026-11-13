import type { FastifyInstance } from "fastify";
import type { AuthRouteOptions } from "../types.js";

export function registerMeRoute(
  app: FastifyInstance,
  options: AuthRouteOptions,
): void {
  const { auth, cookieName, cookieOptions, routePrefix } = options;

  app.get(`${routePrefix}/me`, async (request, reply) => {
    reply.header("Cache-Control", "no-store");

    const token = request.cookies[cookieName];
    const result = token ? await auth.validateSession(token) : null;

    if (!result) {
      reply.clearCookie(cookieName, cookieOptions);

      return reply.code(401).send({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      });
    }

    return { user: result.user };
  });
}
