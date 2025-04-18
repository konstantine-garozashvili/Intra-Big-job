import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-500 dark:text-white dark:font-medium dark:hover:bg-red-600 dark:hover:shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:hover:text-white",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:text-gray-200",
        link: "underline-offset-4 hover:underline text-primary dark:text-[#78b9dd]",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
