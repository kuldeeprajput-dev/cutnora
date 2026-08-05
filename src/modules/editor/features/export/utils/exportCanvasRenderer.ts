import type { TimelineClip } from '@/modules/editor/types';

export function renderClipTo2DCanvas(
  ctx: CanvasRenderingContext2D,
  clip: TimelineClip,
  stageScale = 1
) {
  const { transform, textStyle, elementStyle, type } = clip;
  ctx.save();

  // Position, Scale & Rotate
  const x = transform.x * stageScale;
  const y = transform.y * stageScale;
  const w = transform.width * stageScale;
  const h = transform.height * stageScale;

  ctx.globalAlpha = transform.opacity ?? 1;
  ctx.translate(x + w / 2, y + h / 2);
  if (transform.rotation) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }
  ctx.translate(-w / 2, -h / 2);

  if (type === 'text' && textStyle) {
    // Render Background Fill if present
    if (textStyle.backgroundColor) {
      ctx.fillStyle = textStyle.backgroundColor;
      const radius = (textStyle.bgRadius || 0) * stageScale;
      const pad = (textStyle.bgPadding || 0) * stageScale;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-pad, -pad, w + pad * 2, h + pad * 2, radius);
      } else {
        ctx.rect(-pad, -pad, w + pad * 2, h + pad * 2);
      }
      ctx.fill();
    }

    // Shadow
    if (textStyle.shadowColor) {
      ctx.shadowColor = textStyle.shadowColor;
      ctx.shadowBlur = (textStyle.shadowBlur || 0) * stageScale;
      ctx.shadowOffsetX = (textStyle.shadowOffsetX || 0) * stageScale;
      ctx.shadowOffsetY = (textStyle.shadowOffsetY || 0) * stageScale;
    }

    // Text Properties
    const fontSize = (textStyle.fontSize || 48) * stageScale;
    const fontStyle = textStyle.fontStyle || 'normal';
    const fontWeight = textStyle.fontWeight || 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${textStyle.fontFamily || 'Inter, sans-serif'}`;
    ctx.fillStyle = textStyle.color || '#FFFFFF';
    ctx.textAlign = textStyle.textAlign || 'center';
    ctx.textBaseline = 'middle';

    const textX =
      textStyle.textAlign === 'left'
        ? 0
        : textStyle.textAlign === 'right'
        ? w
        : w / 2;

    // Draw text outline if present
    if (textStyle.outlineWidth) {
      ctx.strokeStyle = textStyle.outlineColor || '#000000';
      ctx.lineWidth = textStyle.outlineWidth * stageScale;
      ctx.strokeText(textStyle.text || '', textX, h / 2);
    }

    ctx.fillText(textStyle.text || '', textX, h / 2);
  } else if (type === 'overlay' && elementStyle) {
    const fillColor = elementStyle.fillColor || '#FF5A36';
    const strokeColor = elementStyle.strokeColor || 'transparent';
    const strokeWidth = (elementStyle.strokeWidth || 0) * stageScale;
    const radius = (elementStyle.borderRadius || 0) * stageScale;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    if (elementStyle.shadowColor) {
      ctx.shadowColor = elementStyle.shadowColor;
      ctx.shadowBlur = (elementStyle.shadowBlur || 0) * stageScale;
      ctx.shadowOffsetX = (elementStyle.shadowOffsetX || 0) * stageScale;
      ctx.shadowOffsetY = (elementStyle.shadowOffsetY || 0) * stageScale;
    }

    ctx.beginPath();
    if (elementStyle.shapeType === 'circle') {
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (elementStyle.shapeType === 'triangle') {
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
    } else {
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, w, h, radius);
      } else {
        ctx.rect(0, 0, w, h);
      }
    }

    ctx.fill();
    if (strokeWidth > 0 && strokeColor !== 'transparent') {
      ctx.stroke();
    }
  }

  ctx.restore();
}
