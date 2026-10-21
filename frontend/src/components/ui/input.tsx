import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-[#545454]/50 bg-[#FFFFFF] px-2.5 py-1 text-sm text-[#0A0D0A] transition-[color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-[#FFFFFF] file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-[#FFFFFF] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 placeholder:text-xs placeholder:text-[#8C8C8C] focus-visible:border-ring",
        className
      )}
      {...props}
    />
  )
}

export { Input }
