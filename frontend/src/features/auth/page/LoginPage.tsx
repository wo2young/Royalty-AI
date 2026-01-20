import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { useAuth } from "@/shared/auth/AuthContext"
import axiosInstance from "@/shared/api/axios"

type Mode = "login" | "signup"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [panelMoving, setPanelMoving] = useState(false)

  /* =========================
     로그인 입력값
     ========================= */
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  /* =========================
     회원가입 입력값
     ========================= */
  const [signupUsername, setSignupUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("")

  const { login } = useAuth()

  const switchMode = (next: Mode) => {
    if (next === mode) return
    setPanelMoving(true)
    setTimeout(() => {
      setMode(next)
      setPanelMoving(false)
    }, 400)
  }

  /* =========================
     ✅ 일반 로그인
     ========================= */
  const handleLogin = async () => {
  if (!username || !password) {
    alert("아이디와 비밀번호를 입력하세요.")
    return
  }

  try {
    const res = await axiosInstance.post("/api/auth/login", {
      username,
      password,
    })

    login(res.data.accessToken, {
      userId: res.data.userId,
      username,
      role: res.data.role,
      provider: "LOCAL",
    })

    window.location.href = "/"
    return   // 🔥 이 줄이 핵심
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err)
    alert("로그인 실패 (아이디/비밀번호 확인)")
    // ❌ 이동 코드 없음 → 그대로 로그인 페이지
  }
}


  /* =========================
     🟡 카카오 로그인 (mock 유지)
     ========================= */
  const handleKakaoLogin = () => {
    login("mock-token", {
      username: "카카오사용자",
      provider: "KAKAO",
    })
    window.location.href = "/"
  }

  /* =========================
     ✅ 회원가입
     ========================= */
  const handleSignup = async () => {
    if (
      !signupUsername ||
      !signupEmail ||
      !signupPassword ||
      !signupPasswordConfirm
    ) {
      alert("모든 항목을 입력하세요.")
      return
    }

    if (signupPassword !== signupPasswordConfirm) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      await axiosInstance.post("/api/auth/signup", {
        username: signupUsername,
        password: signupPassword,
        email: signupEmail,
      })

      alert("회원가입 완료! 로그인해주세요.")

      setUsername(signupUsername)
      setPassword("")
      setSignupUsername("")
      setSignupEmail("")
      setSignupPassword("")
      setSignupPasswordConfirm("")

      switchMode("login")
    } catch (err) {
      console.error("❌ SIGNUP ERROR:", err)
      alert("회원가입 실패 (중복 아이디 또는 서버 오류)")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="relative w-full max-w-4xl h-[560px] overflow-hidden py-0">
        <CardContent className="relative p-0 h-full">
          {/* 🔵 SLIDE BRAND PANEL */}
          <div
            className={`absolute top-0 left-0 z-20 h-full w-1/2
              bg-[#142a5c] text-white
              transition-transform duration-500 ease-in-out
              ${panelMoving ? "translate-x-full" : "translate-x-0"}`}
          >
            <div className="flex h-full flex-col justify-center px-12">
              <h1 className="text-2xl font-bold mb-3">Royalty-AI</h1>
              <p className="text-sm text-white/80 leading-relaxed">
                상표 충돌을 실시간으로 분석하고
                <br />
                브랜드를 보호하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 h-full">
            <div />

            <div className="relative flex items-center justify-center px-10">
              <div className="relative w-full max-w-sm h-[440px]">
                {/* ================= LOGIN ================= */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300
                    ${
                      mode === "login"
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                >
                  <h2 className="text-2xl font-bold mb-1">로그인</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    계정에 로그인하여 계속하세요
                  </p>

                  <div className="space-y-4">
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="아이디"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                      type="password"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button size="lg" className="w-full" onClick={handleLogin}>
                      로그인
                    </Button>

                    {/* 🔥 카카오 로그인 유지 */}
                    <button
                      onClick={handleKakaoLogin}
                      className="w-full rounded-md bg-[#FEE500] text-black py-2 text-sm font-medium hover:opacity-90"
                    >
                      카카오로 로그인
                    </button>
                  </div>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    계정이 없으신가요?{" "}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => switchMode("signup")}
                    >
                      회원가입
                    </button>
                  </p>
                </div>

                {/* ================= SIGNUP ================= */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300
                    ${
                      mode === "signup"
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                >
                  <h2 className="text-2xl font-bold mb-1">회원가입</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    새 계정을 만들어 시작하세요
                  </p>

                  <div className="space-y-4">
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="아이디"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                    />
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="이메일"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="비밀번호"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <input
                      type="password"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="비밀번호 확인"
                      value={signupPasswordConfirm}
                      onChange={(e) =>
                        setSignupPasswordConfirm(e.target.value)
                      }
                    />

                    <Button size="lg" className="w-full" onClick={handleSignup}>
                      회원가입
                    </Button>
                  </div>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => switchMode("login")}
                    >
                      로그인
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
