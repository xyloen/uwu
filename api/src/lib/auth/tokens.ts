import { randomBytes, createHash } from "crypto";

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `nxcms_${randomBytes(32).toString("hex")}`;
  const prefix = key.slice(0, 12);
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}
