import { useState, useRef } from 'react';
import type { TimelineClip } from '@/modules/editor/types';
import { autosaveService, useProjectStore } from '@/modules/projects';
import { useEditorUIStore } from '@/modules/editor/store/useEditorUIStore';
import { historyManager } from '@/modules/editor/store/useHistoryStore';
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
  const startTextStyleRef = useRef<TimelineClip['textStyle']>(undefined);
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
  const isMobileGestureRef = useRef(false);
  const mobileHistoryCapturedRef = useRef(false);
  const mobileFrameRef = useRef<number | null>(null);
  const pendingMobileUpdateRef = useRef<{
    clipId: string;
    updates: Partial<TimelineClip>;
  } | null>(null);
  const rotationGestureRef = useRef({
    centerX: 0,
    centerY: 0,
    startAngle: 0,
  });

  const flushMobileUpdate = () => {
    mobileFrameRef.current = null;
    const pending = pendingMobileUpdateRef.current;
    if (!pending) return;
    pendingMobileUpdateRef.current = null;

    if (!mobileHistoryCapturedRef.current) {
      const project = useProjectStore.getState().currentProject;
      if (project) {
        historyManager.pushState(project);
        mobileHistoryCapturedRef.current = true;
      }
    }

    useProjectStore.setState((state) => {
      if (!state.currentProject) return;
      for (const track of state.currentProject.tracks) {
        const clipIndex = track.clips.findIndex((item) => item.id === pending.clipId);
        if (clipIndex === -1) continue;
        track.clips[clipIndex] = { ...track.clips[clipIndex], ...pending.updates };
        break;
      }
    });
  };

  const queueMobileUpdate = (clipId: string, updates: Partial<TimelineClip>) => {
    pendingMobileUpdateRef.current = { clipId, updates };
    if (mobileFrameRef.current === null) {
      mobileFrameRef.current = window.requestAnimationFrame(flushMobileUpdate);
    }
  };

  const startTransform = (clip: TimelineClip, mode: TransformMode, e: React.PointerEvent) => {
    e.stopPropagation();
    activeClipRef.current = clip;
    modeRef.current = mode;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startTransformRef.current = { ...clip.transform };
    startTextStyleRef.current = clip.textStyle ? { ...clip.textStyle } : undefined;
    isMobileGestureRef.current = window.matchMedia('(max-width: 1023px)').matches;
    mobileHistoryCapturedRef.current = false;
    pendingMobileUpdateRef.current = null;
    if (mode === 'rotate' && isMobileGestureRef.current) {
      const overlayBounds = e.currentTarget.parentElement?.getBoundingClientRect();
      const centerX = overlayBounds ? overlayBounds.left + overlayBounds.width / 2 : e.clientX;
      const centerY = overlayBounds ? overlayBounds.top + overlayBounds.height / 2 : e.clientY;
      rotationGestureRef.current = {
        centerX,
        centerY,
        startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX),
      };
    }
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
          snappingEnabled && !isMobileGestureRef.current
        );

        newX = snapResult.x;
        newY = snapResult.y;
        if (!isMobileGestureRef.current) setActiveGuides(snapResult.guides);
      } else if (mode === 'rotate') {
        if (isMobileGestureRef.current) {
          const rotationGesture = rotationGestureRef.current;
          const currentAngle = Math.atan2(
            moveEv.clientY - rotationGesture.centerY,
            moveEv.clientX - rotationGesture.centerX,
          );
          const angleDelta = (currentAngle - rotationGesture.startAngle) * (180 / Math.PI);
          newRotation = Math.round(startT.rotation + angleDelta);
        } else {
          const centerX = startT.x + startT.width / 2;
          const centerY = startT.y + startT.height / 2;
          const pointerProjX = startT.x + deltaProjectX;
          const pointerProjY = startT.y + deltaProjectY;
          const rad = Math.atan2(pointerProjY - centerY, pointerProjX - centerX);
          newRotation = Math.round((rad * (180 / Math.PI)) % 360);
        }
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

      // If text clip, scale font size proportionally with width change
      let updatedTextStyle = activeClipRef.current.textStyle;
      if (activeClipRef.current.type === 'text' && mode.startsWith('resize-')) {
        const startFontSize = startTextStyleRef.current?.fontSize || 48;
        const scaleFactor = newW / (startT.width || 1);
        const newFontSize = Math.max(10, Math.min(400, Math.round(startFontSize * scaleFactor)));
        if (updatedTextStyle) {
          updatedTextStyle = {
            ...updatedTextStyle,
            fontSize: newFontSize,
          };
        }
      }

      const updates: Partial<TimelineClip> = {
        transform: {
          ...startT,
          x: newX,
          y: newY,
          width: newW,
          height: newH,
          rotation: newRotation,
        },
        ...(updatedTextStyle ? { textStyle: updatedTextStyle } : {}),
      };

      if (isMobileGestureRef.current) {
        queueMobileUpdate(activeClipRef.current.id, updates);
      } else {
        updateClip(activeClipRef.current.id, updates);
      }

      activeClipRef.current = {
        ...activeClipRef.current,
        ...(updatedTextStyle ? { textStyle: updatedTextStyle } : {}),
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
      if (isMobileGestureRef.current && pendingMobileUpdateRef.current) {
        if (mobileFrameRef.current !== null) {
          window.cancelAnimationFrame(mobileFrameRef.current);
        }
        flushMobileUpdate();
      }
      if (isMobileGestureRef.current && mobileHistoryCapturedRef.current) {
        const project = useProjectStore.getState().currentProject;
        if (project) autosaveService.scheduleSave(project);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('cutnora:mobile-pinch-start', handleMobilePinchStart);
      setIsDragging(false);
      setActiveGuides([]);
      activeClipRef.current = null;
      isMobileGestureRef.current = false;
      mobileHistoryCapturedRef.current = false;
    };

    const handleMobilePinchStart = () => handlePointerUp();

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('cutnora:mobile-pinch-start', handleMobilePinchStart);
  };

  return {
    activeGuides,
    isDragging,
    startTransform,
  };
}
