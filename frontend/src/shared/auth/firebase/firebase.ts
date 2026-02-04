import { initializeApp } from "firebase/app"

/**
 * Firebase 기본 설정
 * 🔥 콘솔에서 받은 값 → .env로 관리
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Firebase App (단일 초기화)
 * ⚠️ 이 파일에서만 initializeApp 호출
 */
export const firebaseApp = initializeApp(firebaseConfig)
