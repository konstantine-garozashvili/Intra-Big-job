import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"
import { toast as sonnerToast } from 'sonner';

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border border-neutral-200 p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full dark:border-neutral-800",
  {
    variants: {
      variant: {
        default:
          "border bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50",
        destructive:
          "destructive group border-red-500 bg-red-500 text-neutral-50 dark:border-red-900 dark:bg-red-900 dark:text-neutral-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-neutral-100/40 group-[.destructive]:hover:border-red-500/30 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-neutral-50 group-[.destructive]:focus:ring-red-500 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:focus:ring-neutral-300 dark:group-[.destructive]:border-neutral-800/40 dark:group-[.destructive]:hover:border-red-900/30 dark:group-[.destructive]:hover:bg-red-900 dark:group-[.destructive]:hover:text-neutral-50 dark:group-[.destructive]:focus:ring-red-900",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-neutral-950/50 opacity-0 transition-opacity hover:text-neutral-950 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 dark:text-neutral-50/50 dark:hover:text-neutral-50",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

/**
 * Fonction wrapper pour créer des toasts avec des styles et comportements spécifiques
 * pour les messages liés aux limites de mots de passe
 */
export const toast = {
  // Réexporter les fonctions standard de sonner
  ...sonnerToast,
  
  /**
   * Affiche un message d'erreur spécifique pour les problèmes de limite de mot de passe
   * @param {string} message Le message d'erreur à afficher
   */
  passwordLimitError: (message) => {
    sonnerToast.error(message, {
      description: "La limite de 50 caractères est une mesure de sécurité importante.",
      duration: 6000, // Durée plus longue pour ce type d'erreur
      position: "top-center",
      style: {
        backgroundColor: "#fef2f2", // Rouge très pâle
        border: "1px solid #f87171", // Bordure rouge
        color: "#b91c1c", // Texte rouge foncé
        fontWeight: "500",
      }
    });
  },
  
  /**
   * Affiche un avertissement spécifique pour les problèmes de limite de mot de passe
   * @param {string} message Le message d'avertissement à afficher
   */
  passwordLimitWarning: (message) => {
    sonnerToast(message, {
      description: "Les mots de passe doivent avoir entre 8 et 50 caractères.",
      duration: 4000,
      icon: "⚠️",
      position: "top-center",
      style: {
        backgroundColor: "#fffbeb", // Jaune très pâle
        border: "1px solid #fbbf24", // Bordure jaune
        color: "#92400e", // Texte orangé foncé
        fontWeight: "500",
      }
    });
  }
};

export default toast;
