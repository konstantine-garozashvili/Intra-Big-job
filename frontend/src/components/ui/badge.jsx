import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary-dark dark:text-secondary-dark-foreground dark:hover:bg-secondary-dark/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-destructive-dark dark:text-destructive-dark-foreground dark:hover:bg-destructive-dark/80",
        outline: "text-foreground dark:text-foreground-dark",
        student: "border-transparent bg-blue-900 text-blue-200 hover:bg-blue-800",
        teacher: "border-transparent bg-emerald-900 text-emerald-200 hover:bg-emerald-800",
        admin: "border-transparent bg-amber-900 text-amber-200 hover:bg-amber-800",
        super_admin: "border-transparent bg-red-900 text-red-200 hover:bg-red-800",
        superadmin: "border-transparent bg-red-900 text-red-200 hover:bg-red-800",
        hr: "border-transparent bg-purple-900 text-purple-200 hover:bg-purple-800",
        recruiter: "border-transparent bg-pink-900 text-pink-200 hover:bg-pink-800",
        guest: "border-transparent bg-teal-900 text-teal-200 hover:bg-teal-800",
        user: "border-transparent bg-gray-800 text-gray-200 hover:bg-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  const { isDark, ...restProps } = props;
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...restProps} />
  )
}

export { Badge, badgeVariants } 
