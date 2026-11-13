import { AuthError } from "./errors.js";
import { hashPassword, verifyPassword } from "./password.js";
import { generateSessionToken, hashSessionToken } from "./session-token.js";
import type {
  AuthOptions,
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
  ValidateSessionResult,
} from "./types.js";
import { validateRegisterInput, validateLoginInput } from "./validation.js";

export function createAuth(options: AuthOptions) {
  const sessionTtlSeconds = options.sessionTtlSeconds ?? 24 * 60 * 60;

  if (
    !Number.isSafeInteger(sessionTtlSeconds) ||
    sessionTtlSeconds <= 0 ||
    sessionTtlSeconds > 365 * 24 * 60 * 60
  ) {
    throw new Error(
      "sessionTtlSeconds must be an integer between 1 and 31536000",
    );
  }

  async function register(input: RegisterInput): Promise<RegisterResult> {
    validateRegisterInput(input);

    const email = input.email.trim();

    const existingUser = await options.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AuthError("Email already exists", "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await options.userRepository.create({
      email,
      passwordHash,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async function login(input: LoginInput): Promise<LoginResult> {
    validateLoginInput(input);

    const email = input.email.trim();
    const user = await options.userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await verifyPassword(
      user.passwordHash,
      input.password,
    );

    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + sessionTtlSeconds * 1000);

    const session = await options.sessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
      expiresAt: session.expiresAt,
    };
  }

  async function validateSession(
    token: string,
  ): Promise<ValidateSessionResult | null> {
    if (!token || typeof token !== "string") return null;

    const tokenHash = hashSessionToken(token);

    const session = await options.sessionRepository.findByTokenHash(tokenHash);

    if (!session) return null;

    if (session.expiresAt.getTime() <= Date.now()) {
      await options.sessionRepository.deleteById(session.id);
      return null;
    }

    const user = await options.userRepository.findById(session.userId);

    if (!user) {
      await options.sessionRepository.deleteById(session.id);
      return null;
    }

    return {
      session,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async function logout(token: string): Promise<void> {
    if (!token || typeof token !== "string") return;

    const tokenHash = hashSessionToken(token);

    const session = await options.sessionRepository.findByTokenHash(tokenHash);

    if (session) {
      await options.sessionRepository.deleteById(session.id);
    }
  }

  async function logoutAll(token: string): Promise<void> {
    const result = await validateSession(token);

    if (!result) return;

    await options.sessionRepository.deleteByUserId(result.user.id);
  }

  return { register, login, validateSession, logout, logoutAll };
}
