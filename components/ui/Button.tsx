import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center font-medium tracking-tight transition " +
  "focus:outline-none focus-visible:shadow-ring disabled:opacity-50 disabled:cursor-not-allowed " +
  "rounded-lg";

const variants: Record<Variant, string> = {
  primary:   "bg-ink text-paper hover:bg-stone-700",
  secondary: "bg-accent text-paper hover:bg-accent-ink",
  ghost:     "bg-transparent text-ink hover:bg-stone-100",
  outline:   "bg-transparent text-ink border border-stone-300 hover:bg-stone-50"
};

const sizes: Record<Size, string> = {
  sm: "h-9  px-3 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
