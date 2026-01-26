import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { authStorage } from "./authStorage"
import axiosInstance from "@/shared/api/axios"
import { getFcmToken } from "./firebase/messaging"

type AuthContextType = {
  isLoggedIn: boolean
  user: any
  login: (token: string, user: any) => Promise<void>
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

  /**
   * ✅ 로그인 성공 처리
   * - 토큰 / 유저 저장
   * - FCM 토큰 발급 후 서버에 전달
   */
  const login = async (token: string, user: any) => {
    // 1️⃣ 기존 로그인 처리
    authStorage.set(token, user)
    setUser(user)
    setIsLoggedIn(true)

    // 2️⃣ FCM 토큰 처리 (실패해도 로그인은 유지)
    try {
      console.log("🚀 FCM 토큰 발급 시도")
      const fcmToken = await getFcmToken()
      console.log("📱 FCM Token:", fcmToken)

      if (fcmToken) {
        await axiosInstance.post("/api/notifications/fcm-token", {
          token: fcmToken,
        })
        console.log("✅ FCM 토큰 서버 저장 완료")
      }
    } catch (e) {
      console.warn("❌ FCM 토큰 저장 실패", e)
    }
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
