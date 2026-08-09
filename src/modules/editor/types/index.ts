export type TrackType = 'video' | 'overlay' | 'text' | 'audio';
export type ClipType = 'video' | 'overlay' | 'text' | 'audio' | 'image';
export type EditorTool =
  | 'media'
  | 'canvas'
  | 'text'
  | 'audio'
  | 'videos'
  | 'images'
  | 'elements'
  | 'record'
  | 'select'
  | 'split'
  | 'crop'
  | 'hand';

export type FitMode = 'contain' | 'cover' | 'fill';

export interface CropSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  crop?: CropSettings;
  fitMode: FitMode;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}

export interface AudioSettings {
  volume: number;
  muted: boolean;
  fadeIn: number;
  fadeOut: number;
}

export interface TextStyle {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: number;
  letterSpacing?: number;
  bgPadding?: number;
  bgRadius?: number;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  maxWidth?: number;
}

export interface ElementStyle {
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shapeType?:
    | 'rectangle'
    | 'rounded-rect'
    | 'circle'
    | 'line'
    | 'arrow'
    | 'triangle'
    | 'speech-bubble'
    | 'progress-bar'
    | 'divider';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  arrowHead?: 'none' | 'end' | 'both';
  progress?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  assetId?: string;
  type: ClipType;
  timelineStart: number;
  timelineDuration: number;
  sourceStart: number;
  sourceDuration: number;
  name: string;
  transform: Transform;
  adjustments: Adjustments;
  audio: AudioSettings;
  speed: number;
  textStyle?: TextStyle;
  elementStyle?: ElementStyle;
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  order: number;
  hidden: boolean;
  locked: boolean;
  muted: boolean;
  clips: TimelineClip[];
}
