import { describe, it, expect, beforeEach } from "vitest";
import { signRole, verifyRole } from "@/lib/crypto";
import { checkRateLimit, clearRateLimitStore } from "@/lib/rate-limit";

const SECRET = "test-secret-key-123456";

describe("Adversarial Security Verification — Session Cookie Signature Protection", () => {
  it("accepts a validly signed session cookie role", async () => {
    const role = "security";
    const signature = await signRole(role, SECRET);
    
    const isValid = await verifyRole(role, signature, SECRET);
    expect(isValid).toBe(true);
  });

  it("REJECTS a forged session cookie role where signature is missing or blank", async () => {
    const role = "organizer";
    const forgedSignature = "";
    
    const isValid = await verifyRole(role, forgedSignature, SECRET);
    expect(isValid).toBe(false);
  });

  it("REJECTS a forged session cookie role where the role is modified (privilege escalation attempt)", async () => {
    // Client logs in as 'fan' and intercepts cookie
    const realRole = "fan";
    const signature = await signRole(realRole, SECRET);

    // Client attempts to tamper with cookie to upgrade role to 'organizer' keeping the 'fan' signature
    const forgedRole = "organizer";
    
    const isValid = await verifyRole(forgedRole, signature, SECRET);
    expect(isValid).toBe(false); // Must reject the forgery!
  });

  it("REJECTS a forged session cookie role where the signature is guessed/brute-forced", async () => {
    const role = "security";
    const forgedSignature = "d98bf6cadcbaa3d599f3715d64caa51f3895f324e56cb42";
    
    const isValid = await verifyRole(role, forgedSignature, SECRET);
    expect(isValid).toBe(false);
  });
});

describe("Rate Limiting & Anti-Brute Force Protection", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("allows requests up to specified token limit", () => {
    const clientIp = "192.168.1.100";
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(clientIp, { limit: 5, intervalMs: 60000 });
      expect(res.allowed).toBe(true);
    }
  });

  it("blocks requests exceeding the token bucket limit", () => {
    const clientIp = "192.168.1.101";
    for (let i = 0; i < 3; i++) {
      checkRateLimit(clientIp, { limit: 3, intervalMs: 60000 });
    }
    const blockedRes = checkRateLimit(clientIp, { limit: 3, intervalMs: 60000 });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });
});

