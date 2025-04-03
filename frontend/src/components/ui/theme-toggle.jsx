import { Moon, Sun } from "lucide-react"
import { Button } from "./button"
import { useTheme } from "@/lib/hooks/useTheme"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white mr-2 dark:text-[#78b9dd] dark:hover:bg-[#78b9dd]/20"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 