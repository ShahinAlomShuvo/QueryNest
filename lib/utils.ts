import { hash } from "bcrypt";

/**
 * Hash a password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
} 