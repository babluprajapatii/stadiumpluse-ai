import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    };
  },
  usePathname() {
    return "/fan";
  },
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, ...rest } = props;
    return React.createElement("img", rest);
  },
}));
