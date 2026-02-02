import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "상표분석", path: "/analysis" },
  { name: "상표리스트", path: "/trademarks" },
  { name: "마이페이지", path: "/mypage" },
]

export function DesktopNav() {
  const location = useLocation()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  return (
    <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            onMouseEnter={() => setHoveredPath(item.path)}
            onMouseLeave={() => setHoveredPath(null)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-x-0 -bottom-[1.2rem] h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {hoveredPath === item.path && (
              <motion.div
                layoutId="hoverBackground"
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              />
            )}

            <span className="relative z-10">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
