/**
 * Cryptographic Helpers for Session Verification.
 * Uses Web Crypto API (SubtleCrypto) to remain cross-runtime compatible (Edge/Node).
 */

export async function signRole(role: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(role)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyRole(role: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signRole(role, secret);
  if (expected.length !== signature.length) return false;
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}
