// @vitest-environment node
import { describe, expect, it } from "vitest";

describe("server-side rendering", () => {
  it("imports every entry point without a DOM", async () => {
    expect(globalThis.document).toBeUndefined();

    await expect(import("./index.js")).resolves.toHaveProperty("createRover");
    await expect(import("./element.js")).resolves.toHaveProperty("XpRoverElement");
  });
});
