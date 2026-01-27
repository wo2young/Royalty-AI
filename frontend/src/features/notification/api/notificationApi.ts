import axios from "@/shared/api/axios"


// 알림 목록 조회
export const fetchNotifications = async () => {
  const res = await axios.get("/users/notification")
  return res.data
}

// 알림 읽음 처리
export const readNotification = async (
  notificationId: number
): Promise<void> => {
  await axios.post("/users/notification/read", {
    notificationId,
  })
}
