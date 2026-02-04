import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "@/shared/auth/AuthContext"

export default function RequireAuth() {
  const { isLoggedIn, isAuthReady } = useAuth()
  const location = useLocation()

  // ⭐ 인증 상태 복구 중이면 아무것도 하지 않음
  if (!isAuthReady) {
    return null
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
