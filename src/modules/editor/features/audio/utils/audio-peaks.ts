/**
 * Extract normalized waveform peak values from an audio/video file Blob or URL
 * using Web Audio API AudioContext.decodeAudioData.
 */
export async function extractAudioPeaks(
  source: Blob | File | ArrayBuffer,
  peakCount = 200
): Promise<number[]> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (source instanceof ArrayBuffer) {
      arrayBuffer = source;
    } else {
      arrayBuffer = await source.arrayBuffer();
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return generateFallbackPeaks(peakCount);
    }

    const audioCtx = new AudioCtx();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const channelData = audioBuffer.getChannelData(0); // Primary mono/left channel

    const sampleSize = Math.floor(channelData.length / peakCount);
    const peaks: number[] = [];

    for (let i = 0; i < peakCount; i++) {
      const start = i * sampleSize;
      let max = 0;
      for (let j = 0; j < sampleSize; j++) {
        const val = Math.abs(channelData[start + j] || 0);
        if (val > max) max = val;
      }
      // Normalize peak value between 0.05 and 1.0
      peaks.push(Math.round(Math.max(0.05, Math.min(1.0, max)) * 100) / 100);
    }

    // Clean up Web Audio context
    if (audioCtx.state !== 'closed') {
      audioCtx.close();
    }

    return peaks;
  } catch (err) {
    console.warn('Failed to decode audio data for waveform peaks, using fallbacks:', err);
    return generateFallbackPeaks(peakCount);
  }
}

function generateFallbackPeaks(count: number): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    peaks.push(Math.round((0.2 + Math.sin(i * 0.2) * 0.4 + Math.random() * 0.3) * 100) / 100);
  }
  return peaks;
}
