// @vitest-environment node
import { describe, expect, it } from "vitest";

describe("server-side rendering", () => {
  it("imports every entry point without a DOM", async () => {
    expect(globalThis.document).toBeUndefined();

    await expect(import("../src/index.js")).resolves.toHaveProperty("createRover");
    await expect(import("../src/element.js")).resolves.toHaveProperty("XpRoverElement");
  });
});
