"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"

export function AppProfileLoader() {
  const router = useRouter()
  const { user, loadingProfile, loadProfile } = useAuth()

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

  React.useEffect(() => {
    if (!loadingProfile && !user) {
      router.replace("/auth")
    }
  }, [loadingProfile, user, router])

  return null
}
