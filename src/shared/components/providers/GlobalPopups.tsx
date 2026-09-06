"use client";

import React, { useEffect } from "react";
import { PopupModal, alert } from "@/shared/components/ui/Popup";
import { ToastContainer } from "@/shared/components/ui/Toast/ToastContainer";

export function GlobalPopups() {
  useEffect(() => {
    // Intercept native window.alert to automatically convert any alert() into our rich Cutnora modal popup
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;
      window.alert = (message?: unknown) => {
        const text =
          typeof message === "string"
            ? message
            : message !== undefined
              ? String(message)
              : "";
        void alert({
          title: "Notice",
          message: text,
          type: "alert",
          variant: "info",
        });
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, []);

  return (
    <>
      <PopupModal />
      <ToastContainer />
    </>
  );
}
