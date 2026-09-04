import "server-only";
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }
  return key;
}

/**
 * Encrypt a secret at rest. Envelope format:
 *   v1.<base64 iv>.<base64 authTag>.<base64 ciphertext>
 */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

/** Decrypt an envelope produced by `encryptSecret`. */
export function decryptSecret(envelope: string): string {
  const [version, ivB64, tagB64, dataB64] = envelope.split(".");
  if (version !== VERSION || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted envelope.");
  }
  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
