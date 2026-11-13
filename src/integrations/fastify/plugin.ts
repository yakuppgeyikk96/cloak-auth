import type { createAuth } from "../../core/auth.js";
import type { FastifyPluginAsync } from "fastify";
import { registerLoginRoute } from "./routes/login.js";
import { registerMeRoute } from "./routes/me.js";
import { registerRegisterRoute } from "./routes/register.js";
import { registerLogoutRoute } from "./routes/logout.js";
import type { CloakAuthRoutes } from "./types.js";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import { createOriginGuard } from "./origin.js";

declare module "fastify" {
  interface FastifyInstance {
    auth: CloakAuthPluginOptions["auth"];
  }
}

export interface CloakAuthPluginOptions {
  auth: ReturnType<typeof createAuth>;
  cookieName?: string;
  secureCookies?: boolean;
  routePrefix?: string;
  routes?: boolean | CloakAuthRoutes;
  allowedOrigins?: readonly string[];
}

const cloakAuthPluginImpl: FastifyPluginAsync<CloakAuthPluginOptions> = async (
  app,
  options,
) => {
  const cookieName = options.cookieName ?? "cloak_session";
  const routePrefix = options.routePrefix ?? "/auth";
  const requireAllowedOrigin = createOriginGuard(options.allowedOrigins ?? []);

  if (!/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(routePrefix)) {
    throw new Error(
      "routePrefix must be a path such as /auth or /api/auth without a trailing slash",
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: options.secureCookies ?? true,
    sameSite: "lax" as const,
    path: "/",
  };

  await app.register(cookie);
  app.decorate("auth", options.auth);

  const routeOptions = {
    auth: options.auth,
    routePrefix,
    cookieName,
    cookieOptions,
    requireAllowedOrigin,
  };

  if (options.routes !== false) {
    const routes = typeof options.routes === "object" ? options.routes : {};

    if (routes.register !== false) registerRegisterRoute(app, routeOptions);
    if (routes.login !== false) registerLoginRoute(app, routeOptions);
    if (routes.me !== false) registerMeRoute(app, routeOptions);
    if (routes.logout !== false) registerLogoutRoute(app, routeOptions);
  }
};

export const cloakAuthPlugin = fp(cloakAuthPluginImpl, {
  name: "cloak-auth",
  fastify: "5.x",
});
