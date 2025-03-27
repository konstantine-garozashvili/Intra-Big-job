import * as React from "react"
import { lazyRadix, LazyComponent } from "@/lib/radix-lazy"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = React.forwardRef(({ className, children, ...props }, ref) => (
  <LazyComponent>
    <lazyRadix.Dialog.Root ref={ref} className={cn("fixed inset-0 z-50 overflow-y-auto", className)} {...props}>
      <lazyRadix.Dialog.Portal>
        <lazyRadix.Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
          <lazyRadix.Dialog.Content className="relative flex w-full max-w-md flex-col rounded-lg border bg-background p-6 shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-20 data-[state=open]:slide-in-from-left-20 sm:rounded-lg">
            {children}
          </lazyRadix.Dialog.Content>
        </div>
      </lazyRadix.Dialog.Portal>
    </lazyRadix.Dialog.Root>
  </LazyComponent>
))
Sheet.displayName = "Sheet"

const SheetTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <lazyRadix.Dialog.Trigger ref={ref} className={cn("inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props} />
  </LazyComponent>
))
SheetTrigger.displayName = "SheetTrigger"

const SheetClose = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <lazyRadix.Dialog.Close ref={ref} className={cn("absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", className)} {...props} />
  </LazyComponent>
))
SheetClose.displayName = "SheetClose"

const SheetPortal = lazyRadix.Dialog.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <lazyRadix.Dialog.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref} />
))
SheetOverlay.displayName = lazyRadix.Dialog.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <lazyRadix.Dialog.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <lazyRadix.Dialog.Title className="sr-only">
        Sheet Dialog
      </lazyRadix.Dialog.Title>
      <lazyRadix.Dialog.Description className="sr-only">
        Contenu du panneau latéral
      </lazyRadix.Dialog.Description>
      <lazyRadix.Dialog.Close
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </lazyRadix.Dialog.Close>
      {children}
    </lazyRadix.Dialog.Content>
  </SheetPortal>
))
SheetContent.displayName = lazyRadix.Dialog.Content.displayName

const SheetHeader = ({
  className,
  title,
  description,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
}) => (
  <LazyComponent>
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
      {title && <lazyRadix.Dialog.Title className="text-lg font-semibold leading-none tracking-tight">{title}</lazyRadix.Dialog.Title>}
      {description && (
        <lazyRadix.Dialog.Description className="text-sm text-muted-foreground">
          {description}
        </lazyRadix.Dialog.Description>
      )}
    </div>
  </LazyComponent>
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <LazyComponent>
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
  </LazyComponent>
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <lazyRadix.Dialog.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  </LazyComponent>
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <lazyRadix.Dialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  </LazyComponent>
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
