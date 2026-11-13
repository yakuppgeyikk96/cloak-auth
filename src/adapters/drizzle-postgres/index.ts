import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createUserRepository } from "./user-repository.js";
import { createSessionRepository } from "./session-repository.js";

export function createDrizzleRepositories(db: NodePgDatabase) {
  return {
    userRepository: createUserRepository(db),
    sessionRepository: createSessionRepository(db),
  };
}

export { authUsers, authSessions } from "./schema.js";
