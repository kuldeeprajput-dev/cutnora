export type TrackType = 'video' | 'audio' | 'text' | 'image';

export interface Clip {
  id: string;
  trackId: string;
  mediaId?: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  locked: boolean;
}
