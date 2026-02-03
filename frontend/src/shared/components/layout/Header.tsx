import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/shared/auth/AuthContext"
import NotificationBell from "@/features/notification/components/NotificationBell"
import { DesktopNav } from "../DesktopNav"
import { UserDropdown } from "../UserDropdown"
import { MobileNav } from "../MobileNave"

export function Header() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        {/* 로고 영역 */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Royalty-AI
            </span>
          </Link>
        </div>

        {/* 메인 메뉴 */}
        <DesktopNav />

        {/* 우측 영역 */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* 알림 벨 */}
              <NotificationBell />

              {/* 유저 드롭다운 메뉴 */}
              <div className="hidden md:flex">
                <UserDropdown />
              </div>
              <div className="md:hidden ml-2">
                <MobileNav />
              </div>
            </>
          ) : (
            /* 로그인 안되어있을 때: 로그인만 노출 */
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="rounded-full px-6"
            >
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
