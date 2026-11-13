export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterResult {
  user: PublicUser;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
}

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
}

export interface LoginResult {
  user: PublicUser;
  token: string;
  expiresAt: Date;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<AuthUser>;
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
}

export interface AuthOptions {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  sessionTtlSeconds?: number;
}

export interface AuthSession {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateSessionInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<AuthSession>;
  findByTokenHash(tokenHash: string): Promise<AuthSession | null>;
  deleteById(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export interface ValidateSessionResult {
  session: AuthSession;
  user: PublicUser;
}
