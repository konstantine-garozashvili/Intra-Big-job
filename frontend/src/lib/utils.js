import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner et déduire les classes CSS, particulièrement utile avec Tailwind CSS
 * Combine les fonctionnalités de clsx et tailwind-merge pour éviter les conflits de classes
 *
 * @param {...any} inputs - Les classes CSS à fusionner
 * @returns {string} - La chaîne de classes CSS fusionnée et optimisée
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
