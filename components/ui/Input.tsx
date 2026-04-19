import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-lg border border-stone-300 bg-paper px-3 text-[15px] " +
        "text-ink placeholder:text-stone-400 focus:outline-none focus-visible:shadow-ring",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
