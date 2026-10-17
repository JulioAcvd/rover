import type { Animation, Frame } from "./types";

export type EndReason = "completed";

export interface AnimatorOptions {
  readonly random?: () => number;
  readonly onFrame?: (frame: Frame, index: number) => void;
  readonly onEnd?: (name: string, reason: EndReason) => void;
}

export interface Animator {
  play(name: string): void;
  exit(): void;
  stop(): void;
}

export function createAnimator(
  animations: Readonly<Record<string, Animation>>,
  { random = Math.random, onFrame, onEnd }: AnimatorOptions = {},
): Animator {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let exiting = false;

  function nextIndex(frame: Frame, index: number): number {
    if (exiting && frame.exitBranch !== undefined) return frame.exitBranch;
    let roll = random() * 100;
    for (const branch of frame.branching?.branches ?? []) {
      if (roll <= branch.weight) return branch.frameIndex;
      roll -= branch.weight;
    }
    return index + 1;
  }

  function show(name: string, animation: Animation, index: number): void {
    const frame = animation.frames[index];
    if (!frame) {
      onEnd?.(name, "completed");
      return;
    }
    onFrame?.(frame, index);
    const isLastFrame = index === animation.frames.length - 1;
    timer = setTimeout(
      () => show(name, animation, isLastFrame ? animation.frames.length : nextIndex(frame, index)),
      frame.duration,
    );
  }

  return {
    play(name) {
      clearTimeout(timer);
      exiting = false;
      const animation = animations[name];
      if (animation) show(name, animation, 0);
    },
    exit() {
      exiting = true;
    },
    stop() {
      clearTimeout(timer);
    },
  };
}
