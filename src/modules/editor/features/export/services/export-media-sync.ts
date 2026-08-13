import type { Project } from "@/modules/projects/types";

type ExportMediaElement =
  HTMLVideoElement | HTMLImageElement | HTMLAudioElement;

export async function synchronizeExportMedia(
  project: Project,
  currentTime: number,
  mediaElements: Map<string, ExportMediaElement>,
  activeAssetIds: Set<string>,
): Promise<void> {
  const nextActive = new Set<string>();
  const activations: Promise<void>[] = [];

  for (const track of project.tracks) {
    if (track.hidden) continue;
    for (const clip of track.clips) {
      if (
        !clip.assetId ||
        currentTime < clip.timelineStart ||
        currentTime >= clip.timelineStart + clip.timelineDuration
      ) {
        continue;
      }

      const media = mediaElements.get(clip.assetId);
      if (
        !(media instanceof HTMLVideoElement) &&
        !(media instanceof HTMLAudioElement)
      ) {
        continue;
      }

      nextActive.add(clip.assetId);
      media.playbackRate = clip.speed || 1;
      const clipElapsed = currentTime - clip.timelineStart;
      const targetTime = clip.sourceStart + clipElapsed * (clip.speed || 1);
      const needsActivation =
        !activeAssetIds.has(clip.assetId) ||
        Math.abs(media.currentTime - targetTime) > 0.5;

      if (needsActivation) {
        activations.push(activateMedia(media, targetTime));
      } else if (media.paused) {
        void media.play().catch(() => undefined);
      }
    }
  }

  for (const [assetId, media] of mediaElements) {
    if (
      !nextActive.has(assetId) &&
      (media instanceof HTMLVideoElement ||
        media instanceof HTMLAudioElement) &&
      !media.paused
    ) {
      media.pause();
    }
  }

  await Promise.all(activations);
  activeAssetIds.clear();
  nextActive.forEach((assetId) => activeAssetIds.add(assetId));
}

export function pauseExportMedia(
  mediaElements: Map<string, ExportMediaElement>,
): void {
  mediaElements.forEach((media) => {
    if (
      (media instanceof HTMLVideoElement ||
        media instanceof HTMLAudioElement) &&
      !media.paused
    ) {
      media.pause();
    }
  });
}

async function activateMedia(
  media: HTMLVideoElement | HTMLAudioElement,
  requestedTime: number,
): Promise<void> {
  const maxTime = Number.isFinite(media.duration)
    ? Math.max(0, media.duration - 0.001)
    : requestedTime;
  const targetTime = Math.max(0, Math.min(requestedTime, maxTime));

  if (Math.abs(media.currentTime - targetTime) > 0.04) {
    await seekMedia(media, targetTime);
  }
  await media.play().catch(() => undefined);

  if (
    media instanceof HTMLVideoElement &&
    "requestVideoFrameCallback" in media
  ) {
    await Promise.race([
      new Promise<void>((resolve) =>
        media.requestVideoFrameCallback(() => resolve()),
      ),
      new Promise<void>((resolve) => setTimeout(resolve, 250)),
    ]);
  }
}

function seekMedia(
  media: HTMLVideoElement | HTMLAudioElement,
  time: number,
): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 1500);
    media.addEventListener(
      "seeked",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
    media.currentTime = time;
  });
}
