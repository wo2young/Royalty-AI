import axiosInstance from "@/shared/api/axios"

export const userApi = {
  // PUT /api/userh/password (비밀번호 변경)
  updatePassword: async (newPassword: string): Promise<void> => {
    await axiosInstance.put("/api/userh/password", {
      newPassword: newPassword, // 이제 newPassword만 필드로 보냅니다.
    })
  },

  // DELETE /api/userh/me (회원 탈퇴)
  deleteAccount: async (): Promise<void> => {
    await axiosInstance.delete("/api/userh/me")
  },
}
