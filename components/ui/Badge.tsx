import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium " +
          "bg-stone-100 text-stone-700 border border-stone-200",
        className
      )}
      {...props}
    />
  );
}
