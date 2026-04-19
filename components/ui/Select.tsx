import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-lg border border-stone-300 bg-paper px-3 text-[15px] " +
        "text-ink focus:outline-none focus-visible:shadow-ring",
      className
    )}
    {...props}
  />
));
Select.displayName = "Select";
