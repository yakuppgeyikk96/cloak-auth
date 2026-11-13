import type { createAuth } from "../../core/auth.js";

export interface CloakAuthRoutes {
  register?: boolean;
  login?: boolean;
  me?: boolean;
  logout?: boolean;
}

export interface AuthRouteOptions {
  auth: ReturnType<typeof createAuth>;
  requireAllowedOrigin: ReturnType<
    typeof import("./origin.js").createOriginGuard
  >;
  cookieName: string;
  routePrefix: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
  };
}
