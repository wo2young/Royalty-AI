import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "@/shared/auth/AuthContext"

export default function RequireAuth() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

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
