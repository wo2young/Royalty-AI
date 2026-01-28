import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover"

import { fetchNotifications, readNotification } from "../api/notificationApi"
import type { NotificationDTO } from "../types/notification"

const getSimilarityText = (n: NotificationDTO) => {
  if (n.matchType === "IMAGE") {
    return `로고 유사도 ${Math.round((n.imageSimilarity ?? 0) * 100)}%`
  }

  if (n.matchType === "TEXT") {
    return `상호 유사도 ${Math.round((n.textSimilarity ?? 0) * 100)}%`
  }

  return "유사 상표"
}


/**
 * 날짜 포맷: 2026.01.27 22:14
 * - string / OffsetDateTime 객체 모두 대응
 * - 파싱 실패 시 빈 문자열 반환 (NaN 방지)
 */
const formatDate = (createdAt: any) => {
  if (!createdAt) return ""

  let d: Date | null = null

  // 1) ISO string
  if (typeof createdAt === "string") {
    d = new Date(createdAt)
  }
  // 2) OffsetDateTime 객체 형태
  else if (createdAt.dateTime) {
    d = new Date(createdAt.dateTime)
  }

  if (!d || isNaN(d.getTime())) return ""

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)

  /** 알림 목록 조회 */
  const loadNotifications = async () => {
    setLoading(true)

    const res = await fetchNotifications()
    const raw = Array.isArray(res) ? res : res?.data ?? []

    // isRead / createdAt 방어
    const data: NotificationDTO[] = raw.map((n: any) => ({
      ...n,
      isRead: n.isRead ?? false,
      createdAt: n.createdAt ?? null,
    }))

    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  /** 알림 읽음 처리 */
  const handleRead = async (id: number) => {
    try {
      await readNotification(id)

      // UI 즉시 반영
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, isRead: true } : n
        )
      )

      // 백엔드 기준 재동기화
      await loadNotifications()
    } catch (e) {
      console.error("알림 읽음 처리 실패", e)
    }
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
        className="
          z-[9999] 
          w-[380px] 
          p-0 
          bg-white border 
          border-gray-200 
          rounded-[20px]
          overflow-hidden
          shadow-[0_10px_30px_rgba(0,0,0,0.12)]
          translate-x-35"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm">로딩 중...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              알림이 없습니다
            </div>
          ) : (
            notifications.map((n) => {

              return (
                <div
                  key={n.notificationId}
                  onClick={() => handleRead(n.notificationId)}
                  className={`cursor-pointer 
                              px-5 py-3 
                              text-sm 
                              border-b 
                              transition-colors duration-200
                              ${
                                n.isRead 
                                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                : "bg-white text-gray-900 font-medium hover:bg-gray-50"
                    }
                  `}
                >
                  {/* 제목 */}
                  <div className="font-semibold mb-1">
                    [{n.brandName} 브랜드]
                  </div>

                  {/* 본문 */}
                  <div className="text-sm leading-relaxed">
                    {getSimilarityText(n)}인 상표가
                    특허청에 출원되었습니다.
                  </div>

                  {/* 출원번호 */}
                  <div className="text-xs text-muted-foreground mt-1">
                    (출원번호: {n.applicationNumber})
                  </div>

                  {/* 날짜 */}
                  <div className="text-[11px] text-gray-400 mt-2">
                    {formatDate(n.createdAt)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
