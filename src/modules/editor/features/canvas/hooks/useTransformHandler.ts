import { useState, useRef } from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { calculateSnapping, type GuideLine } from '../utils/snapping-utils';

export type TransformMode = 'translate' | 'resize-nw' | 'resize-n' | 'resize-ne' | 'resize-e' | 'resize-se' | 'resize-s' | 'resize-sw' | 'resize-w' | 'rotate';

export interface UseTransformHandlerReturn {
  activeGuides: GuideLine[];
  isDragging: boolean;
  startTransform: (clip: TimelineClip, mode: TransformMode, e: React.PointerEvent) => void;
}

export function useTransformHandler(stageScale: number): UseTransformHandlerReturn {
  const [activeGuides, setActiveGuides] = useState<GuideLine[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { updateClip, currentProject } = useProjectStore();
  const { snappingEnabled } = useEditorUIStore();

  const activeClipRef = useRef<TimelineClip | null>(null);
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startTransformRef = useRef<TimelineClip['transform']>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    fitMode: 'contain',
  });
  const modeRef = useRef<TransformMode>('translate');

  const startTransform = (clip: TimelineClip, mode: TransformMode, e: React.PointerEvent) => {
    e.stopPropagation();
    activeClipRef.current = clip;
    modeRef.current = mode;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startTransformRef.current = { ...clip.transform };
    setIsDragging(true);

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!activeClipRef.current) return;

      const deltaScreenX = moveEv.clientX - startPointerRef.current.x;
      const deltaScreenY = moveEv.clientY - startPointerRef.current.y;
      const deltaProjectX = deltaScreenX / (stageScale || 1);
      const deltaProjectY = deltaScreenY / (stageScale || 1);

      const mode = modeRef.current;
      const startT = startTransformRef.current;
      let newX = startT.x;
      let newY = startT.y;
      let newW = startT.width;
      let newH = startT.height;
      let newRotation = startT.rotation;

      if (mode === 'translate') {
        const rawX = startT.x + deltaProjectX;
        const rawY = startT.y + deltaProjectY;

        // Snapping calculations against other visible clips & stage edges
        const projectW = currentProject?.settings.width || 1920;
        const projectH = currentProject?.settings.height || 1080;

        const otherBounds =
          currentProject?.tracks
            .flatMap((t) => (t.hidden ? [] : t.clips))
            .filter((c) => c.id !== activeClipRef.current?.id)
            .map((c) => ({
              x: c.transform.x,
              y: c.transform.y,
              width: c.transform.width,
              height: c.transform.height,
            })) || [];

        const snapResult = calculateSnapping(
          { x: rawX, y: rawY, width: startT.width, height: startT.height },
          otherBounds,
          projectW,
          projectH,
          snappingEnabled
        );

        newX = snapResult.x;
        newY = snapResult.y;
        setActiveGuides(snapResult.guides);
      } else if (mode === 'rotate') {
        const centerX = startT.x + startT.width / 2;
        const centerY = startT.y + startT.height / 2;
        const pointerProjX = startT.x + deltaProjectX;
        const pointerProjY = startT.y + deltaProjectY;
        const rad = Math.atan2(pointerProjY - centerY, pointerProjX - centerX);
        newRotation = Math.round((rad * (180 / Math.PI)) % 360);
      } else if (mode.startsWith('resize-')) {
        if (mode.includes('e')) newW = Math.max(20, startT.width + deltaProjectX);
        if (mode.includes('s')) newH = Math.max(20, startT.height + deltaProjectY);
        if (mode.includes('w')) {
          const w = Math.max(20, startT.width - deltaProjectX);
          newX = startT.x + (startT.width - w);
          newW = w;
        }
        if (mode.includes('n')) {
          const h = Math.max(20, startT.height - deltaProjectY);
          newY = startT.y + (startT.height - h);
          newH = h;
        }
      }

      // Update clip transform directly in store for smooth, glitch-free dragging
      updateClip(activeClipRef.current.id, {
        transform: {
          ...startT,
          x: newX,
          y: newY,
          width: newW,
          height: newH,
          rotation: newRotation,
        },
      });

      activeClipRef.current = {
        ...activeClipRef.current,
        transform: {
          ...activeClipRef.current.transform,
          x: newX,
          y: newY,
          width: newW,
          height: newH,
          rotation: newRotation,
        },
      };
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);
      setActiveGuides([]);
      activeClipRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return {
    activeGuides,
    isDragging,
    startTransform,
  };
}
