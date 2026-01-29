/**
 * Backend: NotificationDTO
 * com.royalty.backend.notification.dto.NotificationDTO
 */
export interface NotificationDTO {
  // ===== Notification =====
  notificationId: number
  isRead: boolean

  // ===== Brand =====
  brandId: number
  brandName: string

  // ===== Detection Event =====
  eventId: number
  matchType: string
  imageSimilarity: number
  textSimilarity: number

  // ===== Patent =====
  patentId: number
  trademarkName: string
  applicationNumber: string

  createdAt?: any
}
