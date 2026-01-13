import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"

export function Header() {
  const navigate = useNavigate()

  // 임시 로그인 상태 (나중에 전역 상태 관리로 대체)
  const isLoggedIn = false

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

        {/* 우측 버튼 영역 */}
        <div className="flex items-center gap-3">
          {/* 메인 메뉴 (데스크탑) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/analysis"
              className="transition-colors hover:text-primary"
            >
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
            <Link to="/user" className="transition-colors hover:text-primary">
              마이페이지
            </Link>
          </nav>

          {isLoggedIn ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/user")}>
                마이페이지
              </Button>
              <Button variant="default">로그아웃</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth/login")}>
                로그인
              </Button>
              <Button
                variant="default"
                onClick={() => navigate("/auth/signup")}
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
