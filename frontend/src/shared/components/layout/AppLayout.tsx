import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"
// 크롬 인증 모달 전역 임폴트 
import { useAuth } from "@/shared/auth/AuthContext"
import { useEffect, useState } from "react"
import NotificationPermissionModal from "@/shared/auth/NotificationPermissionModal"
import axiosInstance from "@/shared/api/axios"
import { getFcmToken } from "@/shared/auth/firebase/messaging"


export function AppLayout() {
   const {
    isLoggedIn,
    needNotificationPermission,
    setNeedNotificationPermission,
  } = useAuth()

  const [open, setOpen] = useState(false)

  useEffect(() => {
  const today = new Date().toISOString().slice(0, 10)
  const hiddenDate = localStorage.getItem(
    "notification_modal_hidden_date"
  )

  if (
    isLoggedIn &&
    needNotificationPermission &&
    hiddenDate !== today
  ) {
    setOpen(true)
  }
}, [isLoggedIn, needNotificationPermission])

  const handleClose = () => {

    setOpen(false)
    setNeedNotificationPermission(false)
  }
 const handleGranted = async () => {
  console.log("🔔 알림 허용 → FCM 토큰 발급 시작")

  try {
    const fcmToken = await getFcmToken()
    console.log("📱 FCM Token:", fcmToken)

    if (fcmToken) {
      await axiosInstance.post(
        "/api/auth/notifications/token",
        { token: fcmToken }
      )
      console.log("✅ FCM 토큰 서버 저장 완료")
    }
  } catch (e) {
    console.error("❌ FCM 토큰 발급 실패", e)
  } finally {
    setNeedNotificationPermission(false)
    setOpen(false)
  }
}



  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

     {open && (
  <NotificationPermissionModal
    onClose={handleClose}
    onGranted={handleGranted}
  />
)}
    </div>
  )
}
