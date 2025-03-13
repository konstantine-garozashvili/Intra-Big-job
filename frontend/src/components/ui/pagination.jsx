import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Pagination = ({ className, ...props }) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
    />
);
Pagination.displayName = "Pagination";

const PaginationContent = ({ className, ...props }) => (
    <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = ({ className, ...props }) => (
    <li className={cn("", className)} {...props} />
);
PaginationItem.displayName = "PaginationItem";

const PaginationLink = ({
    className,
    isActive,
    size = "icon",
    ...props
}) => (
    <Button
        variant={isActive ? "outline" : "ghost"}
        size={size}
        className={cn(className, {
            "pointer-events-none": isActive
        })}
        {...props}
    />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
    className,
    ...props
}) => (
    <Button
        variant="ghost"
        className={cn("gap-1", className)}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:ml-2">Précédent</span>
    </Button>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
    className,
    ...props
}) => (
    <Button
        variant="ghost"
        className={cn("gap-1", className)}
        {...props}
    >
        <span className="sr-only md:not-sr-only md:mr-2">Suivant</span>
        <ChevronRight className="h-4 w-4" />
    </Button>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
    className,
    ...props
}) => (
    <span
        aria-hidden
        className={cn("flex h-9 w-9 items-center justify-center", className)}
        {...props}
    >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Plus de pages</span>
    </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
};
