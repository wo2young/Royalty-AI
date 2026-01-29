import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/shared/api/axios"
import { useAuth } from "@/shared/auth/AuthContext"

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // 🔐 중복 호출 방지용
  const calledRef = useRef(false)

  useEffect(() => {
    console.log("🔥 KakaoCallbackPage mounted")

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    console.log("🔥 kakao code =", code)

    // 1️⃣ 인가 코드 없으면 실패
   if (!code) return

    // 🚫 이미 호출했으면 종료
    if (calledRef.current) return
    calledRef.current = true

    // 2️⃣ 백엔드로 인가 코드 전달
    const requestKakaoLogin = async () => {
      try {
        const res = await axiosInstance.post(
          "/api/auth/kakao/login",
          { code }
        )

        console.log("🔥 kakao login response =", res.data)

        const { accessToken, user } = res.data

        // 3️⃣ 로그인 상태 저장
        login(accessToken, user)

        // 4️⃣ 메인 페이지로 이동
        navigate("/", { replace: true })
      } catch (err) {
        console.error("🔥 kakao login api error =", err)
        alert("카카오 로그인 실패")
        navigate("/auth/login", { replace: true })
      }
    }

    requestKakaoLogin()
  }, [login, navigate])

  return <div>카카오 로그인 처리 중...</div>
}
