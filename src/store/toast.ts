import { create } from "zustand";

export type ToastTone = "default" | "success" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const DURATION_MS = 6000;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().dismiss(id), DURATION_MS);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export function pushToast(toast: Omit<Toast, "id">) {
  useToast.getState().push(toast);
}
