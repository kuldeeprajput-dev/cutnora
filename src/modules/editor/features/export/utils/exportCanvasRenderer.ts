import type { TimelineClip } from "@/modules/editor/types";
import {
  getTextFont,
  getTextLayout,
} from "@/modules/editor/features/text/utils/text-layout";

export function renderClipTo2DCanvas(
  ctx: CanvasRenderingContext2D,
  clip: TimelineClip,
  stageScale = 1,
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

  if (type === "text" && textStyle) {
    const layout = getTextLayout(textStyle, transform.width);
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    if (textStyle.backgroundColor) {
      ctx.fillStyle = textStyle.backgroundColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, (textStyle.bgRadius || 0) * stageScale);
      ctx.fill();
    }

    if (textStyle.shadowColor) {
      ctx.shadowColor = textStyle.shadowColor;
      ctx.shadowBlur = (textStyle.shadowBlur || 0) * stageScale;
      ctx.shadowOffsetX = (textStyle.shadowOffsetX || 0) * stageScale;
      ctx.shadowOffsetY = (textStyle.shadowOffsetY || 0) * stageScale;
    }
    const fontSize = textStyle.fontSize * stageScale;
    ctx.font = getTextFont({ ...textStyle, fontSize });
    ctx.letterSpacing = `${(textStyle.letterSpacing || 0) * stageScale}px`;
    ctx.fillStyle = textStyle.color;
    ctx.textAlign = textStyle.textAlign;
    ctx.textBaseline = "alphabetic";
    const padding = layout.padding * stageScale;
    const textX =
      textStyle.textAlign === "left"
        ? padding
        : textStyle.textAlign === "right"
          ? w - padding
          : w / 2;
    const lineHeight = layout.lineHeight * stageScale;
    const metrics = ctx.measureText("Mg");
    const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2;
    const textTop = (h - layout.lines.length * lineHeight) / 2;

    for (const [index, line] of layout.lines.entries()) {
      const baseline =
        textTop + index * lineHeight + (lineHeight + ascent - descent) / 2;
      if (textStyle.outlineWidth) {
        ctx.strokeStyle = textStyle.outlineColor || "#000000";
        ctx.lineWidth = textStyle.outlineWidth * stageScale;
        ctx.lineJoin = "round";
        ctx.strokeText(line, textX, baseline);
      }
      ctx.fillText(line, textX, baseline);
      if (
        textStyle.textDecoration === "underline" ||
        textStyle.textDecoration === "line-through"
      ) {
        const lineWidth = ctx.measureText(line).width;
        const left =
          textStyle.textAlign === "left"
            ? textX
            : textStyle.textAlign === "right"
              ? textX - lineWidth
              : textX - lineWidth / 2;
        const y =
          textStyle.textDecoration === "underline"
            ? baseline + fontSize * 0.1
            : baseline - fontSize * 0.3;
        ctx.fillRect(left, y, lineWidth, Math.max(stageScale, fontSize / 16));
      }
    }
  } else if (type === "overlay" && elementStyle) {
    const fillColor = elementStyle.fillColor || "#FF5A36";
    const strokeColor = elementStyle.strokeColor || "transparent";
    const strokeWidth = (elementStyle.strokeWidth || 0) * stageScale;
    const radius = (elementStyle.borderRadius || 0) * stageScale;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    if (elementStyle.lineStyle === "dashed") {
      ctx.setLineDash([12 * stageScale, 6 * stageScale]);
    } else if (elementStyle.lineStyle === "dotted") {
      ctx.setLineDash([3 * stageScale, 3 * stageScale]);
    } else {
      ctx.setLineDash([]);
    }

    if (elementStyle.shadowColor) {
      ctx.shadowColor = elementStyle.shadowColor;
      ctx.shadowBlur = (elementStyle.shadowBlur || 0) * stageScale;
      ctx.shadowOffsetX = (elementStyle.shadowOffsetX || 0) * stageScale;
      ctx.shadowOffsetY = (elementStyle.shadowOffsetY || 0) * stageScale;
    }

    const shapeType = elementStyle.shapeType || "rectangle";

    ctx.beginPath();
    if (shapeType === "circle") {
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (strokeWidth > 0 && strokeColor !== "transparent") ctx.stroke();
    } else if (shapeType === "line") {
      ctx.strokeStyle = fillColor !== "transparent" ? fillColor : strokeColor;
      ctx.lineWidth = strokeWidth || 4 * stageScale;
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    } else if (shapeType === "arrow") {
      const lineEnd =
        elementStyle.arrowHead === "end" || elementStyle.arrowHead === "both"
          ? w * 0.85
          : w;
      const lineStart = elementStyle.arrowHead === "both" ? w * 0.15 : 0;

      ctx.strokeStyle = fillColor !== "transparent" ? fillColor : strokeColor;
      ctx.lineWidth = strokeWidth || 4 * stageScale;
      ctx.moveTo(lineStart, h / 2);
      ctx.lineTo(lineEnd, h / 2);
      ctx.stroke();

      ctx.fillStyle = fillColor;
      if (
        elementStyle.arrowHead === "end" ||
        elementStyle.arrowHead === "both"
      ) {
        ctx.beginPath();
        ctx.moveTo(w, h / 2);
        ctx.lineTo(w * 0.85, h * 0.25);
        ctx.lineTo(w * 0.85, h * 0.75);
        ctx.closePath();
        ctx.fill();
      }
      if (elementStyle.arrowHead === "both") {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w * 0.15, h * 0.25);
        ctx.lineTo(w * 0.15, h * 0.75);
        ctx.closePath();
        ctx.fill();
      }
    } else if (shapeType === "triangle") {
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0 && strokeColor !== "transparent") ctx.stroke();
    } else if (shapeType === "flag") {
      ctx.moveTo(w * 0.18, h * 0.08);
      ctx.lineTo(w * 0.88, h * 0.08);
      ctx.lineTo(w * 0.88, h * 0.62);
      ctx.lineTo(w * 0.35, h * 0.62);
      ctx.lineTo(w * 0.18, h * 0.82);
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0 && strokeColor !== "transparent") ctx.stroke();
    } else if (shapeType === "chat-bubble") {
      ctx.moveTo(w * 0.5, h * 0.05);
      ctx.bezierCurveTo(
        w * 0.75,
        h * 0.05,
        w * 0.95,
        h * 0.23,
        w * 0.95,
        h * 0.48,
      );
      ctx.bezierCurveTo(
        w * 0.95,
        h * 0.72,
        w * 0.75,
        h * 0.9,
        w * 0.5,
        h * 0.9,
      );
      ctx.bezierCurveTo(
        w * 0.42,
        h * 0.9,
        w * 0.34,
        h * 0.88,
        w * 0.28,
        h * 0.84,
      );
      ctx.lineTo(w * 0.12, h * 0.93);
      ctx.lineTo(w * 0.17, h * 0.75);
      ctx.bezierCurveTo(
        w * 0.09,
        h * 0.68,
        w * 0.05,
        h * 0.59,
        w * 0.05,
        h * 0.48,
      );
      ctx.bezierCurveTo(
        w * 0.05,
        h * 0.23,
        w * 0.25,
        h * 0.05,
        w * 0.5,
        h * 0.05,
      );
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0 && strokeColor !== "transparent") ctx.stroke();
    } else if (shapeType === "progress-bar") {
      const pct = Math.min(100, Math.max(0, elementStyle.progress ?? 65));
      ctx.fillStyle = strokeColor !== "transparent" ? strokeColor : "#1D2027";
      if (ctx.roundRect) ctx.roundRect(0, 0, w, h, radius);
      else ctx.rect(0, 0, w, h);
      ctx.fill();

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, (w * pct) / 100, h, radius);
      else ctx.rect(0, 0, (w * pct) / 100, h);
      ctx.fill();
    } else if (shapeType === "speech-bubble") {
      ctx.moveTo(w * 0.1, h * 0.1);
      ctx.lineTo(w * 0.9, h * 0.1);
      ctx.quadraticCurveTo(w, h * 0.1, w, h * 0.2);
      ctx.lineTo(w, h * 0.7);
      ctx.quadraticCurveTo(w, h * 0.8, w * 0.9, h * 0.8);
      ctx.lineTo(w * 0.4, h * 0.8);
      ctx.lineTo(w * 0.25, h);
      ctx.lineTo(w * 0.28, h * 0.8);
      ctx.lineTo(w * 0.1, h * 0.8);
      ctx.quadraticCurveTo(0, h * 0.8, 0, h * 0.7);
      ctx.lineTo(0, h * 0.2);
      ctx.quadraticCurveTo(0, h * 0.1, w * 0.1, h * 0.1);
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0 && strokeColor !== "transparent") ctx.stroke();
    } else {
      // rectangle / rounded-rect / divider / default
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, w, h, radius);
      } else {
        ctx.rect(0, 0, w, h);
      }
      ctx.fill();
      if (strokeWidth > 0 && strokeColor !== "transparent") {
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}
