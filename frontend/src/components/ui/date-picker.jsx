import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * DatePicker component based on shadcn UI
 * @param {Date} date - Selected date
 * @param {Function} onSelect - Function to call when a date is selected
 * @param {Object} locale - Date locale (default: fr)
 * @param {string} placeholder - Placeholder text when no date is selected
 * @param {string} className - Additional CSS classes
 * @param {Object} props - Additional props to pass to the component
 */
export function DatePicker({
  date,
  onSelect,
  locale = fr,
  placeholder = "Sélectionner une date",
  className,
  ...props
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
} 