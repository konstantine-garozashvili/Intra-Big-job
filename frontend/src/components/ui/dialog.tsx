import * as React from "react"
import { lazyRadix, LazyComponent } from "@/lib/radix-lazy"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const DialogPrimitive = lazyRadix.Dialog;

const Dialog = React.forwardRef(({ className, children, ...props }, ref) => (
  <LazyComponent>
    <DialogPrimitive.Root ref={ref} className={cn("fixed inset-0 z-50 overflow-y-auto", className)} {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Content className="relative flex w-full max-w-2xl flex-col rounded-lg border bg-background p-6 shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg">
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  </LazyComponent>
))
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <DialogPrimitive.Trigger ref={ref} className={cn("inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props} />
  </LazyComponent>
))
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal = React.forwardRef((props, ref) => (
  <LazyComponent>
    <DialogPrimitive.Portal ref={ref} {...props} />
  </LazyComponent>
))
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogClose = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <DialogPrimitive.Close ref={ref} className={cn("absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", className)} {...props} />
  </LazyComponent>
))
DialogClose.displayName = "DialogClose"

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />
  </LazyComponent>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <LazyComponent>
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  </LazyComponent>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
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
      {title && <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">{title}</DialogPrimitive.Title>}
      {description && (
        <DialogPrimitive.Description className="text-sm text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
      )}
    </div>
  </LazyComponent>
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <LazyComponent>
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
  </LazyComponent>
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  </LazyComponent>
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <LazyComponent>
    <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  </LazyComponent>
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
