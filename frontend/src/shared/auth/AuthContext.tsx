// src/shared/auth/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { authStorage } from "./authStorage"

type AuthContextType = {
  isLoggedIn: boolean
  user: any
  login: (token: string, user: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 🔄 새로고침 시 로그인 유지
  useEffect(() => {
    const token = authStorage.getToken()
    const storedUser = authStorage.getUser()

    if (token && storedUser) {
      setUser(storedUser)
      setIsLoggedIn(true)
    }
  }, [])

  const login = (token: string, user: any) => {
    authStorage.set(token, user)
    setUser(user)
    setIsLoggedIn(true)
  }

  const logout = () => {
    authStorage.clear()
    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
