'use client';

import React from 'react';
import type { TimelineClip, ElementStyle } from '@/modules/editor/types';

export interface ElementLayerProps {
  clip: TimelineClip;
}

export function ElementLayer({ clip }: ElementLayerProps) {
  const style: ElementStyle = clip.elementStyle || {
    fillColor: '#FF5A36',
    borderRadius: 8,
    shapeType: 'rectangle',
  };

  const shapeType = style.shapeType || 'rectangle';
  const fillColor = style.fillColor || '#FF5A36';
  const strokeColor = style.strokeColor || 'transparent';
  const strokeWidth = style.strokeWidth || 0;
  const borderRadius = style.borderRadius || 0;
  const lineStyle = style.lineStyle || 'solid';

  const strokeDasharray =
    lineStyle === 'dashed' ? '12 6' : lineStyle === 'dotted' ? '3 3' : undefined;

  const shadowCss = style.shadowColor
    ? `${style.shadowOffsetX || 0}px ${style.shadowOffsetY || 0}px ${style.shadowBlur || 0}px ${style.shadowColor}`
    : undefined;

  const renderSvgShape = () => {
    switch (shapeType) {
      case 'circle':
        return (
          <ellipse
            cx="50%"
            cy="50%"
            rx="46%"
            ry="46%"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );

      case 'line':
        return (
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke={fillColor !== 'transparent' ? fillColor : strokeColor}
            strokeWidth={strokeWidth || 4}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        );

      case 'arrow':
        return (
          <g>
            <line
              x1="0"
              y1="50%"
              x2="90%"
              y2="50%"
              stroke={fillColor !== 'transparent' ? fillColor : strokeColor}
              strokeWidth={strokeWidth || 6}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            {(style.arrowHead === 'end' || style.arrowHead === 'both') && (
              <polygon points="85%,25% 100%,50% 85%,75%" fill={fillColor} />
            )}
            {style.arrowHead === 'both' && (
              <polygon points="15%,25% 0%,50% 15%,75%" fill={fillColor} />
            )}
          </g>
        );

      case 'triangle':
        return (
          <polygon
            points="50%,5% 95%,95% 5%,95%"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        );

      case 'speech-bubble':
        return (
          <path
            d="M 10 10 H 90 Q 95 10 95 15 V 70 Q 95 75 90 75 H 40 L 25 90 L 28 75 H 10 Q 5 75 5 70 V 15 Q 5 10 10 10 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        );

      case 'progress-bar': {
        const pct = Math.min(100, Math.max(0, style.progress ?? 65));
        return (
          <g>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx={borderRadius}
              fill={strokeColor !== 'transparent' ? strokeColor : '#1D2027'}
            />
            <rect
              x="0"
              y="0"
              width={`${pct}%`}
              height="100%"
              rx={borderRadius}
              fill={fillColor}
            />
          </g>
        );
      }

      case 'divider':
        return (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={borderRadius || 4}
            fill={fillColor}
          />
        );

      case 'rounded-rect':
      case 'rectangle':
      default:
        return (
          <rect
            x="2"
            y="2"
            width="96%"
            height="96%"
            rx={borderRadius}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
    }
  };

  return (
    <div
      className="h-full w-full pointer-events-none flex items-center justify-center overflow-hidden"
      style={{
        opacity: clip.transform.opacity,
        boxShadow: shadowCss,
      }}
    >
      <svg className="h-full w-full overflow-visible">
        {renderSvgShape()}
      </svg>
    </div>
  );
}
