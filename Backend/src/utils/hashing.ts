import argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { getEnv } from "../config/env";

export function randomToken(bytes = 48): string { return randomBytes(bytes).toString("base64url"); }
export function hashOpaqueToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }
export function hashIdentifier(value: string): string { return createHash("sha256").update(value.trim().toLowerCase()).digest("hex"); }
export async function hashPassword(password: string): Promise<string> { return argon2.hash(`${password}${getEnv().PASSWORD_PEPPER}`, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 }); }
export async function verifyPassword(hash: string, password: string): Promise<boolean> { return argon2.verify(hash, `${password}${getEnv().PASSWORD_PEPPER}`); }
