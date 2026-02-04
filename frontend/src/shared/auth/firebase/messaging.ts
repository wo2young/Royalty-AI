import { getMessaging, getToken, isSupported } from "firebase/messaging"
import { firebaseApp } from "./firebase"

/**
 * FCM 토큰 발급
 * - 브라우저 미지원 시 null
 * - 실패해도 로그인 흐름에 영향 없음
 */
export const getFcmToken = async (): Promise<string | null> => {
  // 🔒 브라우저 지원 여부 체크
  const supported = await isSupported()
  if (!supported) return null

  try {
    // ✅ 핵심 추가 시작
    if ("serviceWorker" in navigator) {
      const registration =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/firebase-messaging-sw.js"))

      await navigator.serviceWorker.ready
    }

    
    const messaging = getMessaging(firebaseApp)

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    return token ?? null
  } catch (error) {
    console.error("❌ FCM 토큰 발급 실패", error)
    return null
  }
}
