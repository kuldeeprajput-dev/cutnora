/**
 * Codec detection helper using MediaRecorder.isTypeSupported.
 * Chooses best available container & codec format for video and audio recordings.
 */
export function getSupportedMimeType(type: 'video' | 'audio'): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return type === 'video' ? 'video/webm' : 'audio/webm';
  }

  if (type === 'video') {
    const videoTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=avc1,aac',
      'video/mp4',
    ];

    for (const t of videoTypes) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'video/webm';
  } else {
    const audioTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
    ];

    for (const t of audioTypes) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'audio/webm';
  }
}
