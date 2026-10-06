import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-pink-200/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 text-base shadow-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-pink-400 focus-visible:ring-4 focus-visible:ring-pink-500/25 focus-visible:bg-white/95 dark:focus-visible:bg-slate-900/95 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
