import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/shared/api/axios"
import { useAuth } from "@/shared/auth/AuthContext"

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (!code) {
      alert("카카오 인증 실패")
      navigate("/auth/login")
      return
    }

    axiosInstance
      .post("/api/auth/kakao/login", { code })
      .then((res) => {
        login(res.data.accessToken, res.data.user)
        navigate("/")
      })
      .catch(() => {
        alert("카카오 로그인 실패")
        navigate("/auth/login")
      })
  }, [])

  return <div>카카오 로그인 처리 중...</div>
}
