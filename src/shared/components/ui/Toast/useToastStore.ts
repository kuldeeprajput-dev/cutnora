import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>()(
  immer((set) => ({
    toasts: [],

    showToast: (message, type = 'info', duration = 3000) => {
      const id = nanoid();
      set((state) => {
        // Prevent duplicate toasts of exact same message
        if (state.toasts.some((t) => t.message === message)) return;
        state.toasts.push({ id, message, type, duration });
      });

      if (duration > 0) {
        setTimeout(() => {
          useToastStore.getState().removeToast(id);
        }, duration);
      }
    },

    removeToast: (id) =>
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      }),
  }))
);
