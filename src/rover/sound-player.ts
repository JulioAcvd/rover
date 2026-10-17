export interface SoundPlayer {
  /** Must be called from a user gesture so the browser allows audio. */
  enable(): void;
  play(id: string): void;
}

export function createWebAudioSoundPlayer(
  loadSounds: () => Promise<Readonly<Record<string, string>>>,
): SoundPlayer {
  let context: AudioContext | undefined;
  let buffers: Promise<Map<string, AudioBuffer>> | undefined;

  async function decodeAll(audioContext: AudioContext): Promise<Map<string, AudioBuffer>> {
    const sounds = await loadSounds();
    const entries = await Promise.all(
      Object.entries(sounds).map(async ([id, dataUrl]) => {
        const data = await (await fetch(dataUrl)).arrayBuffer();
        return [id, await audioContext.decodeAudioData(data)] as const;
      }),
    );
    return new Map(entries);
  }

  return {
    enable() {
      context ??= new AudioContext();
      void context.resume();
      buffers ??= decodeAll(context);
    },
    play(id) {
      if (!context || !buffers) return;
      const audioContext = context;
      void buffers.then((loaded) => {
        const buffer = loaded.get(id);
        if (!buffer) return;
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });
    },
  };
}
