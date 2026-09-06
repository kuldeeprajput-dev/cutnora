import { create } from "zustand";

export type PopupType = "alert" | "confirm";
export type PopupVariant = "primary" | "destructive" | "warning" | "info";

export interface PopupOptions {
  title?: string;
  message: React.ReactNode | string;
  type?: PopupType;
  confirmText?: string;
  cancelText?: string;
  variant?: PopupVariant;
  closeOnBackdropClick?: boolean;
}

interface PopupState {
  isOpen: boolean;
  options: PopupOptions;
  resolve?: (value: boolean) => void;
  open: (options: PopupOptions) => Promise<boolean>;
  close: (result: boolean) => void;
}

const defaultOptions: PopupOptions = {
  title: "Confirm Action",
  message: "",
  type: "confirm",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "primary",
  closeOnBackdropClick: true,
};

export const usePopupStore = create<PopupState>((set, get) => ({
  isOpen: false,
  options: defaultOptions,
  resolve: undefined,

  open: (options: PopupOptions) => {
    const currentResolve = get().resolve;
    if (currentResolve) currentResolve(false);

    if (typeof document !== "undefined") {
      document.dispatchEvent(new PointerEvent("pointerdown"));
    }

    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: { ...defaultOptions, ...options },
        resolve,
      });
    });
  },

  close: (result: boolean) => {
    const { resolve } = get();
    if (resolve) resolve(result);
    set({ isOpen: false, resolve: undefined });
  },
}));

export const confirm = (options: PopupOptions | string): Promise<boolean> => {
  const opts = typeof options === "string" ? { message: options } : options;
  return usePopupStore.getState().open({ ...opts, type: "confirm" });
};

export const alert = (options: PopupOptions | string): Promise<boolean> => {
  const opts = typeof options === "string" ? { message: options } : options;
  return usePopupStore.getState().open({
    title: "Notice",
    confirmText: "OK",
    variant: "info",
    ...opts,
    type: "alert",
  });
};
