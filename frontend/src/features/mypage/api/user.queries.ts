import { useMutation } from "@tanstack/react-query"
import { userApi } from "./user.api"
import type { AxiosError } from "axios"
import { useAuth } from "@/shared/auth/AuthContext"

// 비밀번호 변경 훅
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: userApi.updatePassword,
    onSuccess: () => {
      alert("비밀번호가 성공적으로 변경되었습니다.")
    },
    onError: (error: AxiosError<{ message: string }>) => {
      alert(error.response?.data?.message || "비밀번호 변경에 실패했습니다.")
    },
  })
}

// 회원 탈퇴 훅
export const useDeleteAccount = () => {
  const { logout } = useAuth()
  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      alert("탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.")
      logout()
      window.location.href = "/"
    },
    onError: () => {
      alert("탈퇴 처리 중 오류가 발생했습니다.")
    },
  })
}
