import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const FloatingInput = React.forwardRef(({ 
  className, 
  type = "text", 
  label, 
  error,
  required = false,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  // Vérifier si le champ a une valeur
  useEffect(() => {
    setHasValue(props.value !== undefined && props.value !== "")
  }, [props.value])

  // Déterminer si l'étiquette doit être flottante
  const isFloating = isFocused || hasValue

  return (
    <div className="relative">
      <div className={cn(
        "relative border border-gray-300 rounded-md transition-all duration-200",
        isFloating ? "border-[#0062FF]" : "",
        error ? "border-red-500" : "",
        className
      )}>
        {/* Étiquette flottante */}
        <label 
          htmlFor={props.id} 
          className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none",
            isFloating 
              ? "transform -translate-y-1/2 top-0 text-xs bg-white px-1 z-10" 
              : "transform translate-y-0 top-1/2 -translate-y-1/2 text-gray-500",
            isFocused ? "text-[#0062FF]" : "text-gray-500",
            error ? "text-red-500" : ""
          )}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Champ de saisie */}
        <input
          type={type}
          className={cn(
            "block w-full h-11 px-3 pt-5 pb-5 text-base bg-transparent rounded-md appearance-none focus:outline-none",
            "transition-all duration-200"
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
          {...props}
        />
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
})

FloatingInput.displayName = "FloatingInput"

export { FloatingInput } 