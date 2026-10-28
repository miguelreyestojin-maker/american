export type ButtonVariant = "primary" | "secondary";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border border-black bg-black text-white hover:bg-background hover:text-black",
  secondary:
    "border border-black/40 bg-transparent text-black hover:border-black hover:bg-black hover:text-white",
};

const baseClass =
  "inline-flex h-12 items-center justify-center px-6 text-xs font-black uppercase tracking-tight transition-colors duration-150";

export function buttonClass(variant: ButtonVariant = "primary") {
  return `${baseClass} ${variantClass[variant]}`;
}
