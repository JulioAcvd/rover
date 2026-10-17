import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRover, type RoverOptions } from "./rover";
import type { AgentData } from "./types";

const agent: AgentData = {
  framesize: [80, 80],
  overlayCount: 1,
  sounds: ["1"],
  animations: {
    RestPose: { frames: [{ duration: 100, images: [[0, 160]] }] },
    Idle: {
      frames: [
        { duration: 100, images: [[0, 0]], exitBranch: 1, branching: { branches: [{ frameIndex: 0, weight: 100 }] } },
        { duration: 100, images: [[80, 0]] },
      ],
    },
    Greet: {
      frames: [
        { duration: 100, images: [[160, 80]], sound: "1" },
        { duration: 100, images: [[240, 80]] },
      ],
    },
    Hide: { frames: [{ duration: 100, images: [[320, 0]] }] },
  },
};

describe("createRover", () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
  });
  afterEach(() => vi.useRealTimers());

  const spritePosition = () => container.querySelector<HTMLElement>(".rover__sprite")?.style.backgroundPosition;
  const create = (options: Partial<RoverOptions> = {}) =>
    createRover(container, { agent, spriteUrl: "map.png", autoIdle: false, ...options });

  it("shows the sprite of the current frame", () => {
    const rover = create();

    rover.play("Greet");
    expect(spritePosition()).toBe("-160px -80px");

    vi.advanceTimersByTime(100);
    expect(spritePosition()).toBe("-240px -80px");
  });

  it("reports the playing animation and frame to subscribers", () => {
    const rover = create();
    const states: unknown[] = [];
    rover.subscribe((state) => states.push(state));

    rover.play("Greet");
    vi.advanceTimersByTime(200);

    expect(states).toEqual([
      { animation: "Greet", frameIndex: 0, frameCount: 2 },
      { animation: "Greet", frameIndex: 1, frameCount: 2 },
      { animation: undefined, frameIndex: 1, frameCount: 2 },
    ]);
  });

  it("reports no animation after a stop", () => {
    const rover = create();
    const listener = vi.fn();
    rover.play("Greet");
    rover.subscribe(listener);

    rover.stop();

    expect(listener).toHaveBeenLastCalledWith({ animation: undefined, frameIndex: 0, frameCount: 2 });
  });

  it("removes itself and goes quiet when destroyed", () => {
    const rover = create({ autoIdle: true });
    const listener = vi.fn();
    rover.subscribe(listener);

    rover.destroy();
    vi.advanceTimersByTime(1000);

    expect(container.childElementCount).toBe(0);
    expect(listener).not.toHaveBeenCalled();
  });

  describe("sound", () => {
    const fakeSoundPlayer = () => ({ enable: vi.fn(), play: vi.fn() });

    it("stays silent by default", () => {
      const soundPlayer = fakeSoundPlayer();
      const rover = create({ soundPlayer });

      rover.play("Greet");

      expect(soundPlayer.play).not.toHaveBeenCalled();
    });

    it("plays frame sounds once unmuted", () => {
      const soundPlayer = fakeSoundPlayer();
      const rover = create({ soundPlayer });

      rover.setMuted(false);
      rover.play("Greet");

      expect(soundPlayer.enable).toHaveBeenCalledOnce();
      expect(soundPlayer.play).toHaveBeenCalledExactlyOnceWith("1");
    });
  });

  describe("with auto idle", () => {
    it("starts idling right away", () => {
      create({ autoIdle: true });

      expect(spritePosition()).toBe("0px 0px");
    });

    it("returns to idle when an animation completes", () => {
      const rover = create({ autoIdle: true });
      rover.play("Greet");
      vi.advanceTimersByTime(100);

      vi.advanceTimersByTime(400);

      expect(spritePosition()).toBe("0px 0px");
    });

    it("stays hidden after hiding", () => {
      const rover = create({ autoIdle: true });
      rover.play("Hide");
      vi.advanceTimersByTime(300);

      vi.advanceTimersByTime(1000);

      expect(spritePosition()).toBe("-320px 0px");
    });

    it("lets idle exit gracefully before playing a requested animation", () => {
      const rover = create({ autoIdle: true });

      rover.play("Greet");
      expect(spritePosition()).toBe("0px 0px");

      vi.advanceTimersByTime(100);
      expect(spritePosition()).toBe("-80px 0px");

      vi.advanceTimersByTime(100);
      expect(spritePosition()).toBe("-160px -80px");
    });

    it("stops returning to idle once disabled", () => {
      const rover = create({ autoIdle: true });
      rover.setAutoIdle(false);
      rover.play("Greet");

      vi.advanceTimersByTime(1000);

      expect(spritePosition()).toBe("-240px -80px");
    });

    it("ignores unknown animations instead of getting stuck", () => {
      const rover = create({ autoIdle: true });

      rover.play("Fetch");
      vi.advanceTimersByTime(1000);

      expect(spritePosition()).toBe("0px 0px");
    });

    it("stays frozen after a stop instead of idling", () => {
      const rover = create({ autoIdle: true });
      rover.play("Greet");
      vi.advanceTimersByTime(200);

      rover.stop();
      vi.advanceTimersByTime(1000);

      expect(spritePosition()).toBe("-160px -80px");
    });

    it("finishes idle through its exit branch when asked to exit", () => {
      const rover = create({ autoIdle: true });

      rover.exit();
      vi.advanceTimersByTime(100);

      expect(spritePosition()).toBe("-80px 0px");
    });
  });
});
