import { describe, it, expect } from "vitest";
import { normalizeError, getErrorMessage, cn } from "@/components/ui/utils";

describe("Utility functions - utils.ts", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });
  });

  describe("normalizeError", () => {
    it("handles Error instances correctly", () => {
      const err = new Error("Standard error message");
      const normalized = normalizeError(err);
      expect(normalized.message).toBe("Standard error message");
    });

    it("handles string error messages", () => {
      const normalized = normalizeError("String error message");
      expect(normalized.message).toBe("String error message");
    });

    it("handles custom object errors with message property", () => {
      const err = { message: "Custom object error message", code: "500", status: 500 };
      const normalized = normalizeError(err);
      expect(normalized.message).toBe("Custom object error message");
      expect(normalized.code).toBe("500");
      expect(normalized.status).toBe(500);
    });

    it("handles custom object errors with error_description property", () => {
      const err = { error_description: "OAuth error description" };
      const normalized = normalizeError(err);
      expect(normalized.message).toBe("OAuth error description");
    });

    it("prevents empty or serialization failures from displaying to user", () => {
      expect(normalizeError("{}").message).toBe("Connection failed or a database constraint was violated.");
      expect(normalizeError("[]").message).toBe("Connection failed or a database constraint was violated.");
      expect(normalizeError("").message).toBe("Connection failed or a database constraint was violated.");
    });
  });

  describe("getErrorMessage", () => {
    it("returns error message on standard error", () => {
      expect(getErrorMessage(new Error("Special Error"), "Fallback")).toBe("Special Error");
    });

    it("returns fallback message on unknown or unexpected errors", () => {
      expect(getErrorMessage({}, "Fallback message")).toBe("Fallback message");
    });
  });
});
