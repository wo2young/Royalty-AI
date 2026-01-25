import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, BellOff } from "lucide-react"

export const NotificationCard = () => {
  const [isActive, setIsActive] = useState(false)
  const [showBadge, setShowBadge] = useState(false)

  const toggleNotification = () => {
    setIsActive(!isActive)
    if (!isActive) {
      setShowBadge(true)
      setTimeout(() => setShowBadge(false), 1000) // 1초 후 배지 삭제
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {/* 1. 오로라 테두리 카드 */}
      <div className="relative group">
        {isActive && (
          <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 animate-tilt">
            <div
              className="absolute inset-0 bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl animate-spin-slow"
              style={{ animationDuration: "3s" }}
            />
          </div>
        )}

        <div className="relative flex flex-col items-center p-8 bg-gray-800 rounded-2xl w-80 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-2">프리미엄 알림</h3>
          <p className="text-gray-400 text-center mb-6 text-sm">
            중요한 업데이트가 있을 때<br />
            오로라 효과로 알려드려요.
          </p>

          {/* 2. 플로팅 배지 버튼 */}
          <div className="relative">
            <AnimatePresence>
              {showBadge && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0, y: -60 }}
                  className="absolute left-1/2 -translate-x-1/2 px-2 py-1 bg-cyan-400 text-gray-900 text-xs font-bold rounded-full shadow-lg pointer-events-none"
                >
                  ON!
                </motion.span>
              )}
            </AnimatePresence>

            <button
              onClick={toggleNotification}
              className={`p-4 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={isActive ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
              >
                {isActive ? <Bell size={28} /> : <BellOff size={28} />}
              </motion.div>
            </button>
          </div>

          <span className="mt-4 text-xs text-gray-500 uppercase tracking-widest">
            {isActive ? "Active Mode" : "Quiet Mode"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotificationCard
