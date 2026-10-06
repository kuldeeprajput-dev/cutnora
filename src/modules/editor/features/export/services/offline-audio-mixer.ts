import {
  AudioBufferSink,
  type InputAudioTrack,
  type WrappedAudioBuffer,
} from "mediabunny";
import type { TimelineClip } from "@/modules/editor/types";

export const EXPORT_SAMPLE_RATE = 48_000;

export interface ExportAudioClip {
  clip: TimelineClip;
  track: InputAudioTrack;
  iterator?: AsyncGenerator<WrappedAudioBuffer, void, unknown>;
  current?: WrappedAudioBuffer;
  ended?: boolean;
}

// Mix only a small PCM block at a time; a long project never allocates a full soundtrack.
export async function mixExportAudioBlock(
  clips: ExportAudioClip[],
  startSample: number,
  sampleCount: number,
  masterVolume: number,
  checkCancelled: () => void,
) {
  const block = new AudioBuffer({
    length: sampleCount,
    numberOfChannels: 2,
    sampleRate: EXPORT_SAMPLE_RATE,
  });
  const channels = [block.getChannelData(0), block.getChannelData(1)];
  const startTime = startSample / EXPORT_SAMPLE_RATE;
  const endTime = (startSample + sampleCount) / EXPORT_SAMPLE_RATE;

  for (const state of clips) {
    checkCancelled();
    const { clip } = state;
    const clipEnd = clip.timelineStart + clip.timelineDuration;
    if (clipEnd <= startTime) {
      await state.iterator?.return();
      state.iterator = undefined;
      state.current = undefined;
      state.ended = true;
      continue;
    }
    if (state.ended || clip.timelineStart >= endTime) continue;
    if (!state.iterator) {
      state.iterator = new AudioBufferSink(state.track).buffers(
        Math.max(
          0,
          clip.sourceStart + Math.max(0, startTime - clip.timelineStart),
        ),
        clip.sourceStart + clip.timelineDuration,
      );
    }
    const sourceEnd =
      clip.sourceStart +
      Math.min(endTime - clip.timelineStart, clip.timelineDuration);
    while (!state.ended) {
      checkCancelled();
      if (!state.current) {
        if (!state.iterator) break;
        const next = await state.iterator.next();
        if (next.done) {
          state.ended = true;
          break;
        }
        state.current = next.value;
      }
      const { buffer, timestamp, duration } = state.current;
      if (timestamp >= sourceEnd) break;
      const bufferStart = clip.timelineStart + timestamp - clip.sourceStart;
      const bufferEnd = bufferStart + duration;
      const firstSample = Math.max(
        0,
        Math.ceil(
          (Math.max(clip.timelineStart, bufferStart) - startTime) *
            EXPORT_SAMPLE_RATE,
        ),
      );
      const lastSample = Math.min(
        sampleCount,
        Math.ceil(
          (Math.min(clipEnd, bufferEnd) - startTime) * EXPORT_SAMPLE_RATE,
        ),
      );
      const sourceChannels = Array.from(
        { length: Math.min(2, buffer.numberOfChannels) },
        (_, channel) => buffer.getChannelData(channel),
      );
      for (let index = firstSample; index < lastSample; index++) {
        const elapsed =
          startTime + index / EXPORT_SAMPLE_RATE - clip.timelineStart;
        const position = Math.max(
          0,
          (clip.sourceStart + elapsed - timestamp) * buffer.sampleRate,
        );
        const left = Math.min(buffer.length - 1, Math.floor(position));
        const right = Math.min(buffer.length - 1, left + 1);
        const fraction = position - Math.floor(position);
        let gain = (clip.audio?.volume ?? 1) * masterVolume;
        const fadeIn = clip.audio?.fadeIn ?? 0;
        const fadeOut = clip.audio?.fadeOut ?? 0;
        if (fadeIn > 0) gain *= Math.min(1, Math.max(0, elapsed / fadeIn));
        if (fadeOut > 0)
          gain *= Math.min(
            1,
            Math.max(0, (clip.timelineDuration - elapsed) / fadeOut),
          );
        for (let channel = 0; channel < 2; channel++) {
          const data =
            sourceChannels[Math.min(channel, sourceChannels.length - 1)];
          channels[channel][index] +=
            (data[left] + (data[right] - data[left]) * fraction) * gain;
        }
      }
      if (timestamp + duration >= sourceEnd) break;
      state.current = undefined;
    }
  }
  // Clamp the mixed signal before encoding to avoid overflow from overlapping tracks.
  for (const channel of channels) {
    for (let index = 0; index < channel.length; index++)
      channel[index] = Math.max(-1, Math.min(1, channel[index]));
  }
  return block;
}
