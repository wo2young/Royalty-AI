import axiosInstance from "@/shared/api/axios"
import type { PasswordFormValues } from "../types"

export const userApi = {
  // PUT /api/userh/password (비밀번호 변경)
  updatePassword: async (
    data: Omit<PasswordFormValues, "confirmPassword">
  ): Promise<void> => {
    await axiosInstance.put("/api/userh/password", {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    })
  },

  // DELETE /api/userh/me (회원 탈퇴)
  deleteAccount: async (): Promise<void> => {
    await axiosInstance.delete("/api/userh/me")
  },
}
