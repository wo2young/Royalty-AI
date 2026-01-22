import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔹 JWT 제외 경로
const AUTH_EXCLUDE_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/kakao",
]

// =========================
// 요청 인터셉터
// =========================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken")
    const url = config.url ?? ""

    // ✅ auth 관련 요청에는 토큰 붙이지 않음
    const isAuthExcluded = AUTH_EXCLUDE_PATHS.some((path) =>
      url.startsWith(path)
    )

    if (!isAuthExcluded && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// =========================
// 응답 인터셉터
// =========================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url ?? ""

    const isAuthRequest = AUTH_EXCLUDE_PATHS.some((path) =>
      url.includes(path)
    )

    // ✅ 로그인/회원가입 실패는 여기서 끝
    if (status === 401 && isAuthRequest) {
      return Promise.reject(error)
    }

    // 🔴 진짜 인증 만료만 강제 로그아웃
    if (status === 401) {
      localStorage.removeItem("accessToken")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)
export default axiosInstance
