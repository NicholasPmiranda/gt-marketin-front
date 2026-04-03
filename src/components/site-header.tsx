"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function SiteHeader() {
  const pathname = usePathname()

  const titulo =
    pathname.startsWith("/app/configuracoes")
      ? "Configuracoes"
      : pathname.startsWith("/app/tarefas")
        ? "Tarefas"
        : pathname.startsWith("/app/projetos")
          ? "Projetos"
      : pathname.startsWith("/app/contas-bancarias")
        ? "Contas bancarias"
      : pathname.startsWith("/app/cartoes")
          ? "Cartoes"
          : "Dashboard"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{titulo}</h1>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
