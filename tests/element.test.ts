import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/element.js";
import type { RoverState } from "../src/rover.js";

describe("<xp-rover>", () => {
  let element: HTMLElement;
  let animations: (string | undefined)[];

  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement("xp-rover");
    animations = [];
    element.addEventListener("xp-rover-change", (event) => {
      animations.push((event as CustomEvent<RoverState>).detail.animation);
    });
  });

  afterEach(() => {
    element.remove();
    vi.useRealTimers();
  });

  const mount = (attributes: Record<string, string>) => {
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    document.body.append(element);
  };

  it("plays the animation named in its attribute once connected", () => {
    mount({ manual: "", animation: "Greet" });

    expect(animations[0]).toBe("Greet");
  });

  it("plays a new animation when the attribute changes", () => {
    mount({ manual: "", animation: "Greet" });

    element.setAttribute("animation", "Pleased");

    expect(animations.at(-1)).toBe("Pleased");
  });

  it("sizes Rover from its scale attribute", () => {
    mount({ scale: "2" });
    const width = () => element.shadowRoot?.querySelector<HTMLElement>(".rover")?.style.width;
    expect(width()).toBe("160px");

    element.setAttribute("scale", "3");

    expect(width()).toBe("240px");
  });

  it("starts idling once the manual attribute is removed", () => {
    mount({ manual: "", animation: "Greet" });

    element.removeAttribute("manual");
    vi.advanceTimersByTime(5000);

    expect(animations).toContain("Idle");
  });

  it("goes quiet once removed from the page", () => {
    mount({ animation: "Greet" });

    element.remove();
    const eventsAtRemoval = animations.length;
    vi.advanceTimersByTime(5000);

    expect(animations).toHaveLength(eventsAtRemoval);
  });

  it("keeps working after being moved to another place in the page", () => {
    mount({ manual: "" });

    document.body.prepend(element);
    (element as HTMLElement & { play(name: string): void }).play("Greet");

    expect(animations.at(-1)).toBe("Greet");
  });
});
