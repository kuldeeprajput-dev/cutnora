'use client';

import React, { useState } from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';

export interface TextLayerProps {
  clip: TimelineClip;
}

export function TextLayer({ clip }: TextLayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textInput, setTextInput] = useState(clip.textStyle?.text || clip.name || 'Sample Text');
  const { updateClip } = useProjectStore();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textInput.trim() && textInput !== clip.textStyle?.text) {
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

  if (isEditing) {
    return (
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-full w-full bg-transparent p-2 text-center focus:outline-none resize-none"
        style={{
          fontSize: `${textStyle.fontSize}px`,
          fontFamily: textStyle.fontFamily,
          color: textStyle.color,
          fontWeight: textStyle.fontWeight,
          backgroundColor: textStyle.backgroundColor || 'rgba(0,0,0,0.5)',
        }}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex h-full w-full items-center justify-center p-2 text-center select-none"
      style={{
        fontSize: `${textStyle.fontSize}px`,
        fontFamily: textStyle.fontFamily,
        color: textStyle.color,
        fontWeight: textStyle.fontWeight,
        backgroundColor: textStyle.backgroundColor,
        textAlign: textStyle.textAlign,
        opacity: clip.transform.opacity,
      }}
    >
      {textStyle.text}
    </div>
  );
}
