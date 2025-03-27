import * as React from "react"
import { LazyRadix, Accordion as AccordionPrimitive } from '@/lib/radix-lazy'
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = ({
  type = "single",
  collapsible = false,
  className,
  ...props
}) => (
  <LazyRadix>
    <AccordionPrimitive.Root
      type={type}
      collapsible={collapsible}
      className={cn("w-full", className)}
      {...props}
    />
  </LazyRadix>
)

Accordion.displayName = "Accordion"

const AccordionItem = ({
  value,
  className,
  ...props
}) => (
  <AccordionPrimitive.Item
    value={value}
    className={cn("overflow-hidden border-b", className)}
    {...props}
  />
)

AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = ({ className, children, ...props }) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)

AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = ({ className, children, ...props }) => (
  <AccordionPrimitive.Content
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
)

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
