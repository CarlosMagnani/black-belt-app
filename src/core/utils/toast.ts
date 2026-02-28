import Toast from "react-native-toast-message";

type ToastVariant = "success" | "error" | "info";

type ShowToastOptions = {
  message: string;
  variant?: ToastVariant;
  title?: string;
  duration?: number;
};

const VARIANT_MAP: Record<ToastVariant, string> = {
  success: "success",
  error: "error",
  info: "info",
};

export function showToast({ message, variant = "info", title, duration = 3000 }: ShowToastOptions) {
  Toast.show({
    type: VARIANT_MAP[variant],
    text1: title ?? (variant === "success" ? "Sucesso" : variant === "error" ? "Erro" : ""),
    text2: message,
    visibilityTime: duration,
    topOffset: 60,
  });
}
