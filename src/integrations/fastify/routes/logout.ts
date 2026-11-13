import type { FastifyInstance } from "fastify";
import type { AuthRouteOptions } from "../types.js";

export function registerLogoutRoute(
  app: FastifyInstance,
  options: AuthRouteOptions,
): void {
  const { auth, cookieName, cookieOptions, routePrefix } = options;

  app.post(
    `${routePrefix}/logout`,
    async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      const token = request.cookies[cookieName];

      if (token) await auth.logout(token);

      reply.clearCookie(cookieName, cookieOptions);
      return reply.code(204).send();
    },
  );
}
