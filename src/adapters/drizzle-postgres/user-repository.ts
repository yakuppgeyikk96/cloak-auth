import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { AuthError } from "../../core/errors.js";
import type {
  AuthUser,
  CreateUserInput,
  UserRepository,
} from "../../core/types.js";
import { authUsers } from "./schema.js";
import { eq } from "drizzle-orm";

export function createUserRepository(db: NodePgDatabase): UserRepository {
  return {
    async findById(id: string): Promise<AuthUser | null> {
      const users = await db
        .select()
        .from(authUsers)
        .where(eq(authUsers.id, id))
        .limit(1);

      return users[0] ?? null;
    },
    async findByEmail(email: string): Promise<AuthUser | null> {
      const users = await db
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, email))
        .limit(1);

      return users[0] ?? null;
    },
    async create(input: CreateUserInput): Promise<AuthUser> {
      try {
        const [res] = await db
          .insert(authUsers)
          .values({
            email: input.email,
            passwordHash: input.passwordHash,
          })
          .returning();

        if (!res) {
          throw new Error("User creation returned no row");
        }

        return res;
      } catch (error) {
        const cause =
          error instanceof Error && error.cause ? error.cause : error;

        if (
          typeof cause === "object" &&
          cause !== null &&
          "code" in cause &&
          cause.code === "23505" &&
          "constraint" in cause &&
          cause.constraint === "auth_users_email_unique"
        ) {
          throw new AuthError("Email already exists", "EMAIL_ALREADY_EXISTS");
        }

        throw error;
      }
    },
  };
}
