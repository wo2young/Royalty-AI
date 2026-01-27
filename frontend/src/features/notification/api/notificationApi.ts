import axios from "@/shared/api/axios"
import type { NotificationDTO } from "../types/notification"


/**
 * 내 알림 목록 조회
 * GET /users/notification
 */
export const fetchNotifications = async (): Promise<NotificationDTO[]> => {
  const res = await axios.get("/users/notification")
  return res.data
}

/**
 * 알림 읽음 처리
 * POST /users/notification/read
 */
export const readNotification = async (notificationId: number) => {
  await axios.post("/users/notification/read", {
    notificationId,
  })
}
