import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAnimator } from "./animator.js";
import { roverAgent } from "./data/agent.js";
import type { Animation } from "./types.js";

const linear: Animation = {
  frames: [{ duration: 100 }, { duration: 200 }, { duration: 300 }],
};

describe("createAnimator", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows each frame for its duration in order", () => {
    const frames: number[] = [];
    const animator = createAnimator({ linear }, { onFrame: (_, index) => frames.push(index) });

    animator.play("linear");
    expect(frames).toEqual([0]);

    vi.advanceTimersByTime(99);
    expect(frames).toEqual([0]);

    vi.advanceTimersByTime(1);
    expect(frames).toEqual([0, 1]);

    vi.advanceTimersByTime(200);
    expect(frames).toEqual([0, 1, 2]);
  });

  it("reports completion once the last frame has been shown for its duration", () => {
    const onEnd = vi.fn();
    const animator = createAnimator({ linear }, { onEnd });

    animator.play("linear");
    vi.advanceTimersByTime(599);
    expect(onEnd).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onEnd).toHaveBeenCalledExactlyOnceWith("linear", "completed");
  });

  const branchy: Animation = {
    frames: [
      { duration: 100 },
      {
        duration: 100,
        branching: {
          branches: [
            { frameIndex: 3, weight: 30 },
            { frameIndex: 0, weight: 50 },
          ],
        },
      },
      { duration: 100 },
      { duration: 100 },
    ],
  };

  it.each([
    { roll: 0.2, expectedNext: 3 },
    { roll: 0.6, expectedNext: 0 },
    { roll: 0.9, expectedNext: 2 },
  ])("branches by percentage weight (roll $roll goes to frame $expectedNext)", ({ roll, expectedNext }) => {
    const frames: number[] = [];
    const animator = createAnimator(
      { branchy },
      { random: () => roll, onFrame: (_, index) => frames.push(index) },
    );

    animator.play("branchy");
    vi.advanceTimersByTime(200);

    expect(frames).toEqual([0, 1, expectedNext]);
  });

  it("treats the last frame as the end even when it branches back", () => {
    const wrapping: Animation = {
      frames: [{ duration: 100 }, { duration: 100, branching: { branches: [{ frameIndex: 0, weight: 100 }] } }],
    };
    const frames: number[] = [];
    const onEnd = vi.fn();
    const animator = createAnimator({ wrapping }, { onFrame: (_, index) => frames.push(index), onEnd });

    animator.play("wrapping");
    vi.advanceTimersByTime(500);

    expect(frames).toEqual([0, 1]);
    expect(onEnd).toHaveBeenCalledExactlyOnceWith("wrapping", "completed");
  });

  it("leaves an endless loop through the exit branch when asked to exit", () => {
    const looping: Animation = {
      frames: [
        { duration: 100, exitBranch: 2, branching: { branches: [{ frameIndex: 0, weight: 100 }] } },
        { duration: 100 },
        { duration: 100 },
      ],
    };
    const frames: number[] = [];
    const onEnd = vi.fn();
    const animator = createAnimator(
      { looping },
      { random: () => 0.5, onFrame: (_, index) => frames.push(index), onEnd },
    );

    animator.play("looping");
    vi.advanceTimersByTime(250);
    animator.exit();
    vi.advanceTimersByTime(250);

    expect(frames).toEqual([0, 0, 0, 2]);
    expect(onEnd).toHaveBeenCalledExactlyOnceWith("looping", "completed");
  });

  it("freezes on the current frame without completing when stopped", () => {
    const frames: number[] = [];
    const onEnd = vi.fn();
    const animator = createAnimator({ linear }, { onFrame: (_, index) => frames.push(index), onEnd });

    animator.play("linear");
    vi.advanceTimersByTime(150);
    animator.stop();
    vi.advanceTimersByTime(1000);

    expect(frames).toEqual([0, 1]);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("restarts cleanly when a new animation interrupts the current one", () => {
    const frames: string[] = [];
    const animator = createAnimator(
      { linear, other: { frames: [{ duration: 100 }, { duration: 100 }] } },
      { onFrame: (frame, index) => frames.push(`${frame.duration}@${index}`) },
    );

    animator.play("linear");
    vi.advanceTimersByTime(50);
    animator.play("other");
    vi.advanceTimersByTime(100);

    expect(frames).toEqual(["100@0", "100@0", "100@1"]);
  });

  describe("with Rover's animation data", () => {
    const animationNames = Object.keys(roverAgent.animations);

    it("includes all 29 of Rover's animations", () => {
      expect(animationNames).toHaveLength(29);
    });

    it.each(animationNames.flatMap((name) => [0, 0.5, 0.999].map((roll) => ({ name, roll }))))(
      "$name completes within a minute after exit (roll $roll)",
      ({ name, roll }) => {
        const onEnd = vi.fn();
        const animator = createAnimator(roverAgent.animations, { random: () => roll, onEnd });

        animator.play(name);
        animator.exit();
        vi.advanceTimersByTime(60_000);

        expect(onEnd).toHaveBeenCalledWith(name, "completed");
      },
    );
  });
});
