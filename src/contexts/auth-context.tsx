"use client"

import * as React from "react"

import api from "@/lib/axios"

type AuthUser = {
  id: number
  name: string
  email: string
}

type LoginInput = {
  email: string
  password: string
}

type LoginResult = {
  success: boolean
  message?: string
}

type AuthContextValue = {
  user: AuthUser | null
  loadingProfile: boolean
  login: (input: LoginInput) => Promise<LoginResult>
  loadProfile: () => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loadingProfile, setLoadingProfile] = React.useState(true)

  const loadProfile = React.useCallback(async () => {
    setLoadingProfile(true)

    try {
      const response = await api.get<AuthUser>("/api/profile")
      setUser(response.data)
    } catch {
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  const login = React.useCallback(
    async ({ email, password }: LoginInput): Promise<LoginResult> => {
      try {
        const response = await api.post<{ token: string }>("/api/login", {
          email,
          password,
        })

        localStorage.setItem("token", response.data.token)
        setLoadingProfile(true)
        await loadProfile()

        return { success: true }
      } catch (error: unknown) {
        const defaultMessage = "Nao foi possivel entrar. Verifique seus dados."

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data &&
          typeof error.response.data.message === "string"
        ) {
          return { success: false, message: error.response.data.message }
        }

        return { success: false, message: defaultMessage }
      }
    },
    [loadProfile]
  )

  const logout = React.useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
  }, [])

  const value = React.useMemo(
    () => ({
      user,
      loadingProfile,
      login,
      loadProfile,
      logout,
    }),
    [user, loadingProfile, login, loadProfile, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }

  return context
}
