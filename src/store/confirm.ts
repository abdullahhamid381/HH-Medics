import { create } from "zustand";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const initial: ConfirmState = {
  isOpen: false,
  title: "",
  description: undefined,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  tone: "danger",
  resolve: null,
};

export const useConfirmStore = create<ConfirmState>(() => initial);

// Imperative helper: `if (await confirmAction({ title: "Delete this product?" })) { ... }`
// Replaces native window.confirm() with the styled dialog.
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.setState({
      ...initial,
      ...options,
      isOpen: true,
      resolve,
    });
  });
}

export function resolveConfirm(value: boolean) {
  const { resolve } = useConfirmStore.getState();
  useConfirmStore.setState({ isOpen: false, resolve: null });
  resolve?.(value);
}
