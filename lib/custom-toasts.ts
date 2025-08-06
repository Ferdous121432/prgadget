import { toast } from "sonner";

// Type for toast functions
type ToastFunction = (title: string, message?: string) => void;
type ToastWithActionFunction = (
  title: string,
  message: string,
  onAction?: () => void,
  actionText?: string
) => void;

export const customToasts = {
  // Success toast with custom content
  success: ((title: string, message?: string) => {
    toast.success(title, {
      description: message,
    });
  }) as ToastFunction,

  // Error toast with custom content
  error: ((title: string, message?: string) => {
    toast.error(title, {
      description: message,
    });
  }) as ToastFunction,

  // Warning toast
  warning: ((title: string, message?: string) => {
    toast.warning(title, {
      description: message,
    });
  }) as ToastFunction,

  // Info toast
  info: ((title: string, message?: string) => {
    toast.info(title, {
      description: message,
    });
  }) as ToastFunction,

  // Custom loading toast
  loading: (message: string, id?: string) => {
    return toast.loading(message, {
      id: id || "loading",
    });
  },

  // Dismiss loading toast
  dismissLoading: (id = "loading") => {
    toast.dismiss(id);
  },

  // Progress update
  updateProgress: (id: string, message: string) => {
    toast.loading(message, { id });
  },

  // Complete progress
  completeProgress: (id: string, successMessage: string) => {
    toast.success(successMessage, { id });
  },
};
