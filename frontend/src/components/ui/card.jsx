import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Composant Card - conteneur stylisé pour afficher du contenu
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * En-tête d'une Card
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Titre d'une Card
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight dark:text-white dark:font-medium",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * Description d'une Card
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground dark:text-gray-300", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * Contenu principal d'une Card
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * Pied de Card
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
