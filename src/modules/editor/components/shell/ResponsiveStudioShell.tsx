"use client";

import React, { useSyncExternalStore } from "react";
import { MobileStudioShell } from "../mobile/MobileStudioShell";
import { StudioShell } from "./StudioShell";

const mobileEditorQuery = "(max-width: 1023px)";

function subscribeToMobileEditor(callback: () => void) {
  const query = window.matchMedia(mobileEditorQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileEditorSnapshot() {
  return window.matchMedia(mobileEditorQuery).matches;
}

function getMobileEditorServerSnapshot() {
  return false;
}

export function ResponsiveStudioShell() {
  const isMobileEditor = useSyncExternalStore(
    subscribeToMobileEditor,
    getMobileEditorSnapshot,
    getMobileEditorServerSnapshot,
  );

  return isMobileEditor ? <MobileStudioShell /> : <StudioShell />;
}
