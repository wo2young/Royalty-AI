import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/shared/auth/AuthContext"
import { cn } from "@/lib/utils"

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null) // 호버 상태 관리
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const displayName = user?.username?.startsWith("kakao_")
    ? "kakao"
    : (user?.username ?? "사용자")

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsOpen(false)
  }

  // 외부 클릭 감지 로직
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 메뉴 아이템 데이터
  const menuItems = [
    {
      label: "마이페이지",
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate("/mypage"),
    },
    {
      label: "로그아웃",
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      isDestructive: true,
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-accent transition-colors duration-200 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border">
          <User className="w-4 h-4 text-slate-500" />
        </div>
        <span className="text-sm font-semibold hidden md:inline-block">
          {displayName}님
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 origin-top-right"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {menuItems.map((item, idx) => (
              <div key={item.label} className="relative">
                {/* 호버 배경 애니메이션 */}
                {hoveredIndex === idx && (
                  <motion.div
                    layoutId="dropdownHover"
                    className={cn(
                      "absolute inset-0 rounded-lg -z-10",
                      item.isDestructive ? "bg-red-50" : "bg-slate-100"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                <button
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg",
                    item.isDestructive ? "text-red-500" : "text-slate-600"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>

                {/* {idx === 0 && <div className="h-px bg-slate-100 my-1.5 mx-1" />} 로그아웃 나눔선 메뉴 3개이상일때*/}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
