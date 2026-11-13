import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type {
  AuthSession,
  CreateSessionInput,
  SessionRepository,
} from "../../core/types.js";
import { authSessions } from "./schema.js";

export function createSessionRepository(db: NodePgDatabase): SessionRepository {
  return {
    async create(input: CreateSessionInput): Promise<AuthSession> {
      const [session] = await db
        .insert(authSessions)
        .values({
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        })
        .returning();

      if (!session) {
        throw new Error("Session creation returned no row");
      }

      return session;
    },
    async findByTokenHash(tokenHash: string): Promise<AuthSession | null> {
      const sessions = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.tokenHash, tokenHash))
        .limit(1);

      return sessions[0] ?? null;
    },
    async deleteById(id: string): Promise<void> {
      await db.delete(authSessions).where(eq(authSessions.id, id));
    },
    async deleteByUserId(userId: string): Promise<void> {
      await db.delete(authSessions).where(eq(authSessions.userId, userId));
    },
  };
}
