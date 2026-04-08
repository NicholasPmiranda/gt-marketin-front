"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { useAuth } from "@/contexts/auth-context"


export default function Page() {
  const router = useRouter()
  const { user, loadingProfile } = useAuth()

  useEffect(() => {
    if (!loadingProfile && user?.perfil === "funcionario") {
      router.replace("/app/tarefas")
    }
  }, [loadingProfile, user?.perfil, router])

  if (loadingProfile || user?.perfil === "funcionario") {
    return null
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  )
}
