import { describe, it, expect } from "vitest";
import { signRole, verifyRole } from "@/lib/crypto";

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
