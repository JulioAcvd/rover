import { createAnimator } from "./animator";
import { roverAgent } from "./data/agent";
import defaultSpriteUrl from "./data/map.png";
import { createWebAudioSoundPlayer, type SoundPlayer } from "./sound-player";
import type { AgentData, Frame } from "./types";

const IDLE = "Idle";
const HIDE_ANIMATIONS = new Set(["Hide", "HideQuick"]);

export type RoverAnimationName = keyof typeof roverAgent.animations;

export interface RoverOptions {
  readonly agent?: AgentData;
  readonly spriteUrl?: string;
  readonly scale?: number;
  readonly autoIdle?: boolean;
  readonly soundPlayer?: SoundPlayer;
}

export interface RoverState {
  readonly animation: string | undefined;
  readonly frameIndex: number;
  readonly frameCount: number;
}

export interface Rover {
  play(name: RoverAnimationName | (string & {})): void;
  exit(): void;
  stop(): void;
  setAutoIdle(enabled: boolean): void;
  setMuted(muted: boolean): void;
  subscribe(listener: (state: RoverState) => void): () => void;
  destroy(): void;
}

export function createRover(container: HTMLElement, options: RoverOptions = {}): Rover {
  const agent: AgentData = options.agent ?? roverAgent;
  const {
    spriteUrl = defaultSpriteUrl,
    scale = 1,
    soundPlayer = createWebAudioSoundPlayer(() => import("./data/sounds").then((module) => module.roverSounds)),
  } = options;
  let autoIdle = options.autoIdle ?? true;
  let muted = true;
  const [width, height] = agent.framesize;

  const root = document.createElement("div");
  root.className = "rover";
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", "Rover the dog");
  root.style.width = `${width * scale}px`;
  root.style.height = `${height * scale}px`;

  const sprite = document.createElement("div");
  sprite.className = "rover__sprite";
  Object.assign(sprite.style, {
    width: `${width}px`,
    height: `${height}px`,
    backgroundImage: `url("${spriteUrl}")`,
    transform: `scale(${scale})`,
    transformOrigin: "0 0",
  });
  root.append(sprite);
  container.append(root);

  const listeners = new Set<(state: RoverState) => void>();
  let state: RoverState = { animation: undefined, frameIndex: 0, frameCount: 0 };
  let current: string | undefined;
  let queued: string | undefined;

  function updateState(changes: Partial<RoverState>): void {
    state = { ...state, ...changes };
    for (const listener of listeners) listener(state);
  }

  function render(frame: Frame, frameIndex: number): void {
    const [x, y] = frame.images?.[0] ?? [0, 0];
    sprite.style.backgroundPosition = `${-x}px ${-y}px`;
    if (frame.sound && !muted) soundPlayer.play(frame.sound);
    updateState({
      animation: current,
      frameIndex,
      frameCount: current ? (agent.animations[current]?.frames.length ?? 0) : 0,
    });
  }

  function start(name: string): void {
    current = name;
    queued = undefined;
    animator.play(name);
  }

  function handleEnd(name: string): void {
    current = undefined;
    updateState({ animation: undefined });
    if (queued) start(queued);
    else if (autoIdle && !HIDE_ANIMATIONS.has(name)) start(IDLE);
  }

  const animator = createAnimator(agent.animations, { onFrame: render, onEnd: handleEnd });
  if (autoIdle) start(IDLE);

  return {
    play(name) {
      if (!Object.hasOwn(agent.animations, name)) return;
      if (current !== IDLE) return start(name);
      queued = name;
      animator.exit();
    },
    exit() {
      queued = undefined;
      animator.exit();
    },
    stop() {
      current = undefined;
      queued = undefined;
      animator.stop();
      updateState({ animation: undefined });
    },
    setAutoIdle(enabled) {
      autoIdle = enabled;
      if (enabled && !current) start(IDLE);
    },
    setMuted(value) {
      muted = value;
      if (!muted) soundPlayer.enable();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      animator.stop();
      listeners.clear();
      soundPlayer.dispose?.();
      root.remove();
    },
  };
}
