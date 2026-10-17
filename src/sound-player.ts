export interface SoundPlayer {
  /** Must be called from a user gesture so the browser allows audio. */
  enable(): void;
  play(id: string): void;
  dispose?(): void;
}

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer;
}

export function createWebAudioSoundPlayer(
  loadSounds: () => Promise<Readonly<Record<string, string>>>,
): SoundPlayer {
  let context: AudioContext | undefined;
  let buffers: Promise<Map<string, AudioBuffer>> | undefined;

  async function decodeAll(audioContext: AudioContext): Promise<Map<string, AudioBuffer>> {
    const sounds = await loadSounds();
    const entries = await Promise.all(
      Object.entries(sounds).map(
        async ([id, dataUrl]) => [id, await audioContext.decodeAudioData(dataUrlToArrayBuffer(dataUrl))] as const,
      ),
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
        if (!buffer || audioContext.state === "closed") return;
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });
    },
    dispose() {
      void context?.close();
      context = undefined;
      buffers = undefined;
    },
  };
}
