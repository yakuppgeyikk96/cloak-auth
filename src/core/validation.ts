import type { LoginInput, RegisterInput } from "./types.js";
import { AuthError } from "./errors.js";

export function validateRegisterInput(input: RegisterInput): void {
  if (input == null) {
    throw new AuthError("Register input is required");
  }

  if (typeof input.email !== "string") {
    throw new AuthError("Email must be a string");
  }

  if (typeof input.password !== "string") {
    throw new AuthError("Password must be a string");
  }

  if (!input.email.trim()) {
    throw new AuthError("Email is required");
  }

  if (!input.password) {
    throw new AuthError("Password is required");
  }
}

export function validateLoginInput(input: LoginInput): void {
  if (input == null) {
    throw new AuthError("Login input is required");
  }

  if (typeof input.email !== "string") {
    throw new AuthError("Email must be a string");
  }

  if (typeof input.password !== "string") {
    throw new AuthError("Password must be a string");
  }

  if (!input.email.trim()) {
    throw new AuthError("Email is required");
  }

  if (!input.password) {
    throw new AuthError("Password is required");
  }
}
