import { cn } from "@/lib/utils"

/**
 * Composant Skeleton - représente un état de chargement avec un effet de pulsation
 * 
 * @param {string} className - Classes CSS additionnelles
 * @param {object} props - Autres propriétés React
 * @returns {JSX.Element} Élément div avec l'apparence d'un squelette de chargement
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
