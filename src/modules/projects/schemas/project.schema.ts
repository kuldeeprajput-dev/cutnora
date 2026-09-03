import { z } from 'zod';

export const AspectRatioSchema = z.enum(['16:9', '9:16', '1:1', '4:5']);

export const ProjectSettingsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  aspectRatio: AspectRatioSchema,
  fps: z.number().positive(),
  duration: z.number().min(0),
  backgroundColor: z.string(),
  masterVolume: z.number().min(0).max(1),
});

export const CropSettingsSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
});

export const TransformSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  scaleX: z.number(),
  scaleY: z.number(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  crop: CropSettingsSchema.optional(),
  fitMode: z.enum(['contain', 'cover', 'fill']),
});

export const AdjustmentsSchema = z.object({
  brightness: z.number(),
  contrast: z.number(),
  saturation: z.number(),
  blur: z.number().min(0),
  grayscale: z.number().min(0).max(1),
  sepia: z.number().min(0).max(1),
});

export const AudioSettingsSchema = z.object({
  volume: z.number().min(0).max(1),
  muted: z.boolean(),
  fadeIn: z.number().min(0),
  fadeOut: z.number().min(0),
});

export const TextStyleSchema = z.object({
  text: z.string(),
  fontSize: z.number().positive(),
  fontFamily: z.string(),
  color: z.string(),
  backgroundColor: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']),
  fontWeight: z.enum(['normal', 'bold']),
});

export const ElementStyleSchema = z.object({
  fillColor: z.string(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  borderRadius: z.number().optional(),
});

export const ClipSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  assetId: z.string().optional(),
  type: z.enum(['video', 'overlay', 'text', 'audio', 'image']),
  timelineStart: z.number().min(0),
  timelineDuration: z.number().positive(),
  sourceStart: z.number().min(0),
  sourceDuration: z.number().positive(),
  splitGroupId: z.string().optional(),
  name: z.string(),
  transform: TransformSchema,
  adjustments: AdjustmentsSchema,
  audio: AudioSettingsSchema,
  speed: z.number().positive(),
  textStyle: TextStyleSchema.optional(),
  elementStyle: ElementStyleSchema.optional(),
});

export const TrackSchema = z.object({
  id: z.string(),
  type: z.enum(['video', 'overlay', 'text', 'audio']),
  name: z.string(),
  order: z.number(),
  hidden: z.boolean(),
  locked: z.boolean(),
  muted: z.boolean(),
  clips: z.array(ClipSchema),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  schemaVersion: z.number().default(1),
  settings: ProjectSettingsSchema,
  tracks: z.array(TrackSchema),
  assetIds: z.array(z.string()),
});

export function migrateProjectData(rawProject: unknown): z.infer<typeof ProjectSchema> {
  const result = ProjectSchema.safeParse(rawProject);
  if (result.success) {
    return result.data;
  }
  throw new Error(`Project data validation failed: ${result.error.message}`);
}
