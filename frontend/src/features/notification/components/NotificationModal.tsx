import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

import {
  fetchNotifications,
  readNotification,
} from "../api/notificationApi"

import type { NotificationDTO } from "../types/notification"

interface NotificationModalProps {
  open: boolean
  onClose: () => void
}

const NotificationModal = ({ open, onClose }: NotificationModalProps) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])

  // 모달 열릴 때 알림 조회
  useEffect(() => {
    if (!open) return

    fetchNotifications().then(setNotifications)
  }, [open])

  // 알림 읽음 처리
  const handleRead = async (notificationId: number) => {
    await readNotification(notificationId)

    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId
          ? { ...n, isRead: true }
          : n
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle>알림</DialogTitle>
        </DialogHeader>

        <div className="h-[360px] overflow-y-auto divide-y">
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              onClick={() => handleRead(n.notificationId)}
              className={`px-4 py-3 cursor-pointer ${
                n.isRead ? "bg-background" : "bg-muted"
              }`}
            >
              <p className="text-sm font-medium">
                {n.brandName}
              </p>

              <p className="text-xs text-muted-foreground">
                상표명: {n.trademarkName}
              </p>

              <p className="text-xs text-muted-foreground">
                image: {n.imageSimilarity}
              </p>

              <p className="text-xs text-muted-foreground">
                text: {n.textSimilarity}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationModal
