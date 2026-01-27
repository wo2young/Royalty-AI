import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import NotificationModal from "./NotificationModal"
import { fetchNotifications } from "../api/notificationApi"
import type { NotificationDTO } from "../types/notification"

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 알림 개수 조회 (Bell 표시용)
  useEffect(() => {
    fetchNotifications().then((list: NotificationDTO[]) => {
      const unread = list.filter((n) => !n.isRead).length
      setUnreadCount(unread)
    })
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-muted"
        aria-label="알림 열기"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default NotificationBell
