"use client";

import { useEffect } from "react";

export function NativeContextMenuBlocker() {
  useEffect(() => {
    const preventBrowserMenu = (event: MouseEvent) => event.preventDefault();
    // Preserve event propagation for the app's own context menus.
    document.addEventListener("contextmenu", preventBrowserMenu, true);
    return () => document.removeEventListener("contextmenu", preventBrowserMenu, true);
  }, []);

  return null;
}
