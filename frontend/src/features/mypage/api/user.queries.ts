import { useMutation } from "@tanstack/react-query"
import { userApi } from "./user.api"
import type { AxiosError } from "axios"
import { useAuth } from "@/shared/auth/AuthContext"
import { toast } from "sonner"

// 비밀번호 변경 훅
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: userApi.updatePassword,
    onSuccess: () => {
      toast.success("비밀번호가 성공적으로 변경되었습니다.")
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message || "비밀번호 변경에 실패했습니다."
      )
    },
  })
}

// 회원 탈퇴 훅
export const useDeleteAccount = () => {
  const { logout } = useAuth()
  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      toast.success("탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.")
      logout()
      window.location.href = "/"
    },
    onError: () => {
      toast.error("탈퇴 처리 중 오류가 발생했습니다.")
    },
  })
}
