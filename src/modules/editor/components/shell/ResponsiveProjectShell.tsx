"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { usePlaybackStore } from "@/modules/editor/store/usePlaybackStore";
import { useProjectStore } from "@/modules/projects";

const mobileEditorQuery = "(max-width: 1023px)";
let mobileEditorMediaQuery: MediaQueryList | null = null;

const ProjectShell = dynamic(
  () => import("./ProjectShell").then((module) => module.ProjectShell),
  { ssr: false, loading: ProjectShellLoading },
);

const MobileProjectShell = dynamic(
  () =>
    import("../mobile/MobileProjectShell").then(
      (module) => module.MobileProjectShell,
    ),
  { ssr: false, loading: ProjectShellLoading },
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

function ProjectShellLoading() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-studio-bg text-xs font-medium text-studio-muted">
      Opening workspace…
    </div>
  );
}

export function ResponsiveProjectShell() {
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

  return isMobileEditor ? <MobileProjectShell /> : <ProjectShell />;
}

export const ResponsiveStudioShell = ResponsiveProjectShell;
