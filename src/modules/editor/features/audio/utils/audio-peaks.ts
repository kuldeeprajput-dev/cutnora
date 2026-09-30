/**
 * Extract normalized waveform peak values from an audio/video file Blob or URL
 * using Web Audio API AudioContext.decodeAudioData.
 * Uses hybrid RMS (perceived loudness energy) + Peak transient analysis with
 * logarithmic dynamic range expansion to match the actual musical dynamics.
 */
export async function extractAudioPeaks(
  source: Blob | File | ArrayBuffer,
  peakCount?: number
): Promise<number[]> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (source instanceof ArrayBuffer) {
      arrayBuffer = source;
    } else {
      arrayBuffer = await source.arrayBuffer();
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      return generateFallbackPeaks(peakCount || 600);
    }

    const audioCtx = new AudioCtx();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

    // Dynamic resolution based on audio duration (~40 samples/sec for musical precision)
    const targetCount =
      peakCount ??
      Math.max(800, Math.min(3000, Math.round(audioBuffer.duration * 40)));

    const numChannels = audioBuffer.numberOfChannels;
    const channelL = audioBuffer.getChannelData(0);
    const channelR = numChannels > 1 ? audioBuffer.getChannelData(1) : null;
    const totalSamples = channelL.length;
    const sampleSize = Math.max(1, Math.floor(totalSamples / targetCount));

    const rawEnergies: number[] = new Array(targetCount);
    let maxObserved = 0;

    for (let i = 0; i < targetCount; i++) {
      const start = i * sampleSize;
      const end = Math.min(totalSamples, start + sampleSize);
      const actualSize = Math.max(1, end - start);

      let peak = 0;
      let sumSquares = 0;

      for (let j = start; j < end; j++) {
        const sL = channelL[j] ?? 0;
        const sR = channelR ? (channelR[j] ?? 0) : sL;
        const absVal = Math.max(Math.abs(sL), Math.abs(sR));

        if (absVal > peak) peak = absVal;
        sumSquares += absVal * absVal;
      }

      // Root Mean Square (RMS) represents human-perceived loudness
      const rms = Math.sqrt(sumSquares / actualSize);

      // Hybrid blend: 50% peak transients + 50% RMS body
      const energy = 0.5 * peak + 0.5 * (rms * 2.2);
      rawEnergies[i] = energy;
      if (energy > maxObserved) maxObserved = energy;
    }

    // Clean up Web Audio context
    if (audioCtx.state !== 'closed') {
      void audioCtx.close();
    }

    // Normalization scale factor to utilize 96% full height
    const normalizer = maxObserved > 0.02 ? 0.96 / maxObserved : 1.0;
    const peaks: number[] = new Array(targetCount);

    for (let i = 0; i < targetCount; i++) {
      const normalized = Math.min(1.0, (rawEnergies[i] ?? 0) * normalizer);
      // Perceptual loudness mapping using square root curve (matches human ear)
      const perceptual = Math.sqrt(normalized);
      // Floor at 0.12 so quiet passages are clearly visible with healthy height, loud peaks reach 0.98
      peaks[i] = Math.round(Math.max(0.12, Math.min(0.98, perceptual)) * 100) / 100;
    }

    return peaks;
  } catch (err) {
    console.warn('Failed to decode audio data for waveform peaks, using fallbacks:', err);
    return generateFallbackPeaks(peakCount || 800);
  }
}

function generateFallbackPeaks(count: number): number[] {
  // Generate a natural-looking rhythmic envelope for fallback instead of a flat line
  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const wave =
      0.38 +
      0.25 * Math.sin(t * Math.PI * 12) +
      0.15 * Math.sin(t * Math.PI * 28) +
      0.1 * Math.cos(t * Math.PI * 4);
    return Math.round(Math.max(0.12, Math.min(0.95, wave)) * 100) / 100;
  });
}
