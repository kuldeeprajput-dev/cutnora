'use client';

import React, { useState } from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { AlertTriangle } from 'lucide-react';

export interface TextLayerProps {
  clip: TimelineClip;
}

export function TextLayer({ clip }: TextLayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textInput, setTextInput] = useState(clip.textStyle?.text || clip.name || 'Sample Text');
  const { updateClip, currentProject } = useProjectStore();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textInput.trim() !== clip.textStyle?.text) {
      updateClip(clip.id, {
        textStyle: {
          fontSize: 48,
          fontFamily: 'Inter, sans-serif',
          color: '#FFFFFF',
          textAlign: 'center',
          fontWeight: 'bold',
          ...clip.textStyle,
          text: textInput,
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTextInput(clip.textStyle?.text || clip.name || 'Sample Text');
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleBlur();
    }
  };

  const textStyle = clip.textStyle || {
    text: clip.name || 'Sample Text',
    fontSize: 48,
    fontFamily: 'Inter, sans-serif',
    color: '#FFFFFF',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
  };

  // Check canvas bounds overflow warning
  const projW = currentProject?.settings.width || 1920;
  const projH = currentProject?.settings.height || 1080;
  const isOverflowing =
    clip.transform.x < 0 ||
    clip.transform.y < 0 ||
    clip.transform.x + clip.transform.width > projW ||
    clip.transform.y + clip.transform.height > projH;

  const shadowCss = textStyle.shadowColor
    ? `${textStyle.shadowOffsetX || 0}px ${textStyle.shadowOffsetY || 0}px ${textStyle.shadowBlur || 0}px ${textStyle.shadowColor}`
    : undefined;

  const outlineStyle: React.CSSProperties = textStyle.outlineWidth
    ? {
        WebkitTextStroke: `${textStyle.outlineWidth}px ${textStyle.outlineColor || '#000000'}`,
      }
    : {};

  if (isEditing) {
    return (
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-full w-full bg-transparent p-2 focus:outline-none resize-none leading-normal font-sans"
        style={{
          fontSize: `${textStyle.fontSize}px`,
          fontFamily: textStyle.fontFamily,
          color: textStyle.color,
          fontWeight: textStyle.fontWeight,
          fontStyle: textStyle.fontStyle || 'normal',
          textAlign: textStyle.textAlign,
          lineHeight: textStyle.lineHeight || 1.2,
          letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
          backgroundColor: textStyle.backgroundColor || 'rgba(0,0,0,0.5)',
          padding: textStyle.bgPadding ? `${textStyle.bgPadding}px` : undefined,
          borderRadius: textStyle.bgRadius ? `${textStyle.bgRadius}px` : undefined,
          whiteSpace: 'pre-wrap',
          ...outlineStyle,
        }}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="group/text relative flex h-full w-full items-center justify-center p-2 select-none overflow-hidden"
      style={{
        fontSize: `${textStyle.fontSize}px`,
        fontFamily: textStyle.fontFamily,
        color: textStyle.color,
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.fontStyle || 'normal',
        backgroundColor: textStyle.backgroundColor,
        textAlign: textStyle.textAlign,
        lineHeight: textStyle.lineHeight || 1.2,
        letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
        padding: textStyle.bgPadding ? `${textStyle.bgPadding}px` : undefined,
        borderRadius: textStyle.bgRadius ? `${textStyle.bgRadius}px` : undefined,
        textShadow: shadowCss,
        whiteSpace: 'pre-wrap',
        opacity: clip.transform.opacity,
        ...outlineStyle,
      }}
    >
      <span className="w-full truncate whitespace-pre-wrap">{textStyle.text}</span>

      {/* Overflow Warning Badge */}
      {isOverflowing && (
        <div
          className="absolute -top-3 -right-3 z-40 rounded-full bg-brand p-1 text-white shadow-lg opacity-0 group-hover/text:opacity-100 transition-opacity"
          title="Clip extends outside video canvas boundaries!"
        >
          <AlertTriangle className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
