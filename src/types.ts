export type SpriteOffset = readonly [x: number, y: number];

export interface Branch {
  readonly frameIndex: number;
  readonly weight: number;
}

export interface Frame {
  readonly duration: number;
  readonly images?: readonly SpriteOffset[];
  readonly sound?: string;
  readonly exitBranch?: number;
  readonly branching?: { readonly branches: readonly Branch[] };
}

export interface Animation {
  readonly frames: readonly Frame[];
}

export interface AgentData {
  readonly framesize: readonly [width: number, height: number];
  readonly overlayCount: number;
  readonly sounds: readonly string[];
  readonly animations: Readonly<Record<string, Animation>>;
}
