import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Output,
  WebMOutputFormat,
} from "mediabunny";

// MediaRecorder often leaves out duration and seek indexes. Copy its encoded
// packets into a finalized container without decoding or encoding them again.
export async function finalizeRecordedWebM(
  blob: Blob,
  fps: number,
  checkIsCancelled: () => boolean,
) {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(blob),
  });
  const target = new BufferTarget();
  const output = new Output({ format: new WebMOutputFormat(), target });
  const checkCancelled = () => {
    if (checkIsCancelled()) throw new Error("EXPORT_CANCELLED");
  };
  try {
    const video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    const videoCodec = await video?.getCodec();
    const audioCodec = await audio?.getCodec();
    if (!video || !videoCodec)
      throw new Error("The recorder did not create a video track.");
    const videoSource = new EncodedVideoPacketSource(videoCodec);
    const audioSource =
      audio && audioCodec ? new EncodedAudioPacketSource(audioCodec) : null;
    output.addVideoTrack(videoSource, { frameRate: fps });
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();
    const copied = await Promise.allSettled([
      (async () => {
        const config = await video.getDecoderConfig();
        try {
          for await (const packet of new EncodedPacketSink(video).packets()) {
            checkCancelled();
            await videoSource.add(
              packet,
              config ? { decoderConfig: config } : undefined,
            );
          }
        } finally {
          videoSource.close();
        }
      })(),
      (async () => {
        if (!audio || !audioSource) return;
        const config = await audio.getDecoderConfig();
        try {
          for await (const packet of new EncodedPacketSink(audio).packets()) {
            checkCancelled();
            await audioSource.add(
              packet,
              config ? { decoderConfig: config } : undefined,
            );
          }
        } finally {
          audioSource.close();
        }
      })(),
    ]);
    const failure = copied.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
    checkCancelled();
    await output.finalize();
    if (!target.buffer)
      throw new Error("The video file could not be finalized.");
    return new Blob([target.buffer], { type: "video/webm" });
  } finally {
    if (output.state !== "finalized") await output.cancel();
    input.dispose();
  }
}
