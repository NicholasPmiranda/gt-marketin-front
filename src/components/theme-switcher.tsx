"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()

  function handleToggleTheme() {
    if (resolvedTheme === "dark") {
      setTheme("light")
      return
    }

    setTheme("dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleTheme}
      aria-label="Alternar tema"
    >
      <SunIcon className="size-4 dark:hidden" />
      <MoonIcon className="hidden size-4 dark:block" />
    </Button>
  )
}
