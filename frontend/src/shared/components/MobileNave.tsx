import { useState } from "react"
import { createPortal } from "react-dom" // Portal 사용
import { motion, AnimatePresence, type Variants } from "framer-motion"
import {
  Menu,
  X,
  ChevronRight,
  BarChart2,
  List,
  User,
  LogOut,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/shared/auth/AuthContext"

// y를 0으로 확실히 고정
const sheetVariants: Variants = {
  closed: {
    y: "100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  opened: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
    },
  },
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  const menuItems = [
    {
      name: "상표분석",
      path: "/analysis",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      name: "상표리스트",
      path: "/trademarks",
      icon: <List className="w-5 h-5" />,
    },
    { name: "마이페이지", path: "/mypage", icon: <User className="w-5 h-5" /> },
  ]

  // 모바일 메뉴 실제 내용
  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-5000"
          />

          {/* 바텀 시트 */}
          <motion.div
            initial="closed"
            animate="opened"
            exit="closed"
            variants={sheetVariants}
            // fixed와 inset-x-0, bottom-0으로 위치 강제 고정
            className="fixed inset-x-0 bottom-0 bg-white z-8000 rounded-t-4xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col"
            style={{ maxHeight: "90vh" }} // 화면의 90%까지만 차지
          >
            {/* 드래그 핸들 바 */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />

            <div className="px-6 pb-10 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">메뉴</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 active:scale-[0.98] transition-all"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                      {item.icon}
                    </div>
                    <span className="font-semibold text-slate-700">
                      {item.name}
                    </span>
                    <ChevronRight className="ml-auto w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="mt-4 flex items-center justify-center gap-2 p-4 rounded-2xl text-red-500 font-semibold border border-red-50"
              >
                <LogOut className="w-5 h-5" />
                로그아웃
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="md:hidden flex items-center">
      <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600">
        <Menu className="w-7 h-7" />
      </button>

      {/* Portal을 통해 menuContent를 document.body 바로 아래로 보냄 */}
      {typeof document !== "undefined" &&
        createPortal(menuContent, document.body)}
    </div>
  )
}
