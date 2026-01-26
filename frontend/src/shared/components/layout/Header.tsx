import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/shared/auth/AuthContext"

export function Header() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()

  // ✅ 표시용 이름 처리 (카카오면 kakao로 통일)
  const displayName =
    user?.username?.startsWith("kakao_") ? "kakao" : user?.username

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 영역 */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Royalty-AI
            </span>
          </Link>
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-4">
          {/* 메인 메뉴 (데스크탑) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/analysis" className="transition-colors hover:text-primary">
              상표분석
            </Link>
            <Link
              to="/recommend"
              className="transition-colors hover:text-primary"
            >
              AI추천
            </Link>
            <Link
              to="/trademarks"
              className="transition-colors hover:text-primary"
            >
              상표리스트
            </Link>
            <Link
              to="/mypage"
              className="transition-colors hover:text-primary"
            >
              마이페이지
            </Link>
          </nav>

          {/* 로그인 / 유저 영역 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {displayName ?? "사용자"}님
              </span>
              <Button
                variant="default"
                onClick={() => {
                  logout()
                  navigate("/")
                }}
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth/login")}>
                로그인
              </Button>
            <Button
              variant="default"
              onClick={() => navigate("/auth/login?mode=signup")}
            >
              회원가입
            </Button>

            </>
          )}
        </div>
      </div>
    </header>
  )
}
