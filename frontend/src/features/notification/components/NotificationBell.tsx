import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover"

import { fetchNotifications, readNotification } from "../api/notificationApi"
import type { NotificationDTO } from "../types/notification"

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications().then((res) => {
      console.log("notifications response:", res)
      console.log("isArray:", Array.isArray(res))
      
      setNotifications(res)
      setLoading(false)
    })
  }, [])


  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleRead = async (id: number) => {
    await readNotification(id)
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      )
    )
  }


  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted">
          <Bell className="w-5 h-5" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={12}
        className="w-[360px] p-0"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? null : notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              알림이 없습니다
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notificationId}
                onClick={() => handleRead(n.notificationId)}
                className={`cursor-pointer px-4 py-3 text-sm border-b hover:bg-muted ${
                !n.isRead ? "bg-muted/50 font-medium" : ""
                }`}
              >
                <div className="font-semibold">{n.brandName}</div>
                <div className="text-xs text-muted-foreground">
                  {n.trademarkName}
                </div>
              </div>
            ))
          )}

        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
