import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import { authStorage } from "@/shared/auth/authStorage"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔹 JWT 제외 경로
const AUTH_EXCLUDE_PATHS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/kakao",
   "/api/auth/email/send",        // ✅ 이메일 인증
  "/api/auth/find-username",     // ✅ 아이디 찾기
  "/api/auth/password",          // ✅ 비밀번호 재설정 계열
]

// =========================
// 요청 인터셉터
// =========================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken()
    const url = config.url ?? ""

    const isAuthExcluded = AUTH_EXCLUDE_PATHS.some((path) =>
      url.startsWith(path)
    )

    if (!isAuthExcluded && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// =========================
// 응답 인터셉터
// =========================
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url ?? ""

    const isAuthRequest = AUTH_EXCLUDE_PATHS.some((path) =>
      url.includes(path)
    )

    // 🔹 로그인/회원가입 요청에서의 401은 그대로 전달
    if (status === 401 && isAuthRequest) {
      return Promise.reject(error)
    }

    // 🔴 토큰 만료 / 인증 실패
    if (status === 401) {
      authStorage.clear()
      window.location.href = "/auth/login"
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
