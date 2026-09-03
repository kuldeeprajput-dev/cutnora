"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";

const mobileEditorQuery = "(max-width: 1023px)";
let mobileEditorMediaQuery: MediaQueryList | null = null;

const StudioShell = dynamic(
  () => import("./StudioShell").then((module) => module.StudioShell),
  { ssr: false, loading: StudioShellLoading },
);

const MobileStudioShell = dynamic(
  () =>
    import("../mobile/MobileStudioShell").then(
      (module) => module.MobileStudioShell,
    ),
  { ssr: false, loading: StudioShellLoading },
);

function getMobileEditorMediaQuery() {
  if (!mobileEditorMediaQuery) {
    mobileEditorMediaQuery = window.matchMedia(mobileEditorQuery);
  }
  return mobileEditorMediaQuery;
}

function subscribeToMobileEditor(callback: () => void) {
  const query = getMobileEditorMediaQuery();
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileEditorSnapshot() {
  return getMobileEditorMediaQuery().matches;
}

function getMobileEditorServerSnapshot() {
  return false;
}

function StudioShellLoading() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-studio-bg text-xs font-medium text-studio-muted">
      Opening workspace…
    </div>
  );
}

export function ResponsiveStudioShell() {
  const isMobileEditor = useSyncExternalStore(
    subscribeToMobileEditor,
    getMobileEditorSnapshot,
    getMobileEditorServerSnapshot,
  );
  const projectFps = useProjectStore(
    (state) => state.currentProject?.settings.fps ?? 30,
  );
  const setPlaybackFps = usePlaybackStore((state) => state.setFps);

  useEffect(() => {
    setPlaybackFps(projectFps);
  }, [projectFps, setPlaybackFps]);

  return isMobileEditor ? <MobileStudioShell /> : <StudioShell />;
}
