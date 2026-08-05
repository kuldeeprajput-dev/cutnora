export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stopAll(): void {
    for (const [key, { source, gain }] of this.activeNodes.entries()) {
      try {
        source.stop();
        source.disconnect();
        gain.disconnect();
      } catch {
        // Node already stopped
      }
      this.activeNodes.delete(key);
    }
  }

  public disconnectClip(clipId: string): void {
    const node = this.activeNodes.get(clipId);
    if (node) {
      try {
        node.source.stop();
        node.source.disconnect();
        node.gain.disconnect();
      } catch {
        // Ignore
      }
      this.activeNodes.delete(clipId);
    }
  }

  public dispose(): void {
    this.stopAll();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
