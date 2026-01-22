import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { useAuth } from "@/shared/auth/AuthContext"
import axiosInstance from "@/shared/api/axios"
import { useNavigate } from "react-router-dom"
// 🔴 Mode 확장
type Mode = "login" | "signup" | "findId" | "findPassword"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [panelMoving, setPanelMoving] = useState(false)
  const navigate = useNavigate()
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

  /* 🔴 아이디 / 비밀번호 찾기 */
  const [findEmail, setFindEmail] = useState("")
  const [findUsername, setFindUsername] = useState("")

  const { login } = useAuth()

  // 🔴 입력값 초기화
  const resetInputs = () => {
    setUsername("")
    setPassword("")
    setSignupUsername("")
    setSignupEmail("")
    setSignupPassword("")
    setSignupPasswordConfirm("")
    setFindEmail("")
    setFindUsername("")
  }

  // 🔴 switchMode 확장 (동작은 기존과 동일)
  const switchMode = (next: Mode) => {
    if (next === mode) return
    setPanelMoving(true)
    setTimeout(() => {
      resetInputs()
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

    navigate("/")
  } catch {
    setPassword("") // ❗ 비밀번호만 초기화
    alert("로그인 실패 (아이디/비밀번호 확인)")
  }
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    handleLogin()
  }
}





  /* =========================
     🟡 카카오 로그인
     ========================= */
  const handleKakaoLogin = () => {
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID
    const redirectUri = "http://localhost:5173/oauth/kakao/callback"

    window.location.href =
      "https://kauth.kakao.com/oauth/authorize" +
      `?response_type=code&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`
  }

  /* =========================
     ✅ 회원가입
     ========================= */
const handleSignup = async () => {
  // 🔴 아이디 길이 체크
  if (signupUsername.length < 6 || signupUsername.length > 12) {
    alert("아이디는 6자 이상 12자 이하로 입력해주세요.")
    return
  }

  // 🔴 비밀번호 길이 체크
  if (signupPassword.length < 8 || signupPassword.length > 16) {
    alert("비밀번호는 8자 이상 16자 이하로 입력해주세요.")
    return
  }

  // 🔴 비밀번호 확인 체크
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
    switchMode("login")

  } catch (err: any) {
    const message = err?.response?.data?.message

    if (!message) {
      alert("회원가입 실패 (서버 오류)")
      return
    }

    alert(message)
  }
}

   


  /* =========================
     아이디찾기 관련
     ========================= */
  const handleFindId = async () => {
  if (!findEmail) {
    alert("이메일을 입력하세요.")
    return
  }

  try {
    await axiosInstance.post("/api/auth/find-username", {
      email: findEmail,
    })

    alert("입력하신 이메일로 아이디를 전송했습니다.")
    switchMode("login")
  } catch {
    alert("해당 이메일로 등록된 계정이 없습니다.")
  }
}
/* =========================
   비밀번호 재설정 메일 요청
   ========================= */
const handleFindPassword = async () => {
  if (!findEmail) {
    alert("이메일을 입력하세요.")
    return
  }

  try {
   await axiosInstance.post(
  "/api/auth/password/reset-request",
  null,
  {
    params: {
      email: findEmail,
    },
  }
)


    alert("비밀번호 재설정 메일을 전송했습니다.")
    switchMode("login")

  } catch (err: any) {
    const message = err?.response?.data?.message
    alert(message || "비밀번호 재설정 요청 실패")
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
            <h1
              className="text-2xl font-bold mb-3 cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => navigate("/")}
            >
              Royalty-AI
            </h1>
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
                {mode === "login" && (
                  <div className="absolute inset-0">
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
                         onKeyDown={handleKeyDown}
                      />
                      <input
                        type="password"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                         onKeyDown={handleKeyDown}
                      />

                      <Button
                          type="button"
                          size="lg"
                          className="w-full"
                          onClick={handleLogin}
                        >
                          로그인
                        </Button>
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleKakaoLogin}
                      className="w-full bg-[#FEE500] text-black font-semibold hover:bg-[#E6D200] active:bg-[#D4C100]"
                    >
                      카카오로 로그인
                    </Button>

                    </div>

                    {/* 🔴 아이디 / 비밀번호 찾기 */}
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                      <button
                        onClick={() => switchMode("findId")}
                        className="transition-colors hover:text-[#1f2a44] hover:underline"
                      >
                        아이디 찾기
                      </button>
                      {" | "}
                      <button
                        onClick={() => switchMode("findPassword")}
                        className="transition-colors hover:text-[#1f2a44] hover:underline"
                      >
                        비밀번호 찾기
                      </button>
                    </p>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        계정이 없으신가요?{" "}
                        <button
                          onClick={() => switchMode("signup")}
                          className="font-medium transition-colors hover:text-[#1f2a44] hover:underline"
                        >
                          회원가입
                        </button>
                      </p>

                  </div>
                )}

                {/* ================= SIGNUP ================= */}
                {mode === "signup" && (
                  <div className="absolute inset-0">
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
                        onClick={() => switchMode("login")}
                        className="transition-colors hover:text-[#1f2a44] hover:underline"
                      >
                        로그인
                      </button>
                    </p>
                  </div>
                )}

                {/* ================= FIND ID ================= */}
                {mode === "findId" && (
                  <div className="absolute inset-0">
                    <h2 className="text-2xl font-bold mb-6">아이디 찾기</h2>

                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm mb-4"
                      placeholder="이메일"
                      value={findEmail}
                      onChange={(e) => setFindEmail(e.target.value)}
                    />

                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleFindId}
                      >
                        아이디 찾기
                      </Button>

                    <p className="mt-6 text-center text-sm">
                      <button
                        onClick={() => switchMode("login")}
                        className="transition-colors hover:text-[#1f2a44] hover:underline"
                      >
                        로그인으로 돌아가기
                      </button>
                    </p>
                  </div>
                )}

                {/* ================= FIND PASSWORD ================= */}
                {mode === "findPassword" && (
                  <div className="absolute inset-0">
                    <h2 className="text-2xl font-bold mb-6">비밀번호 찾기</h2>

                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm mb-3"
                      placeholder="아이디"
                      value={findUsername}
                      onChange={(e) => setFindUsername(e.target.value)}
                    />
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm mb-4"
                      placeholder="이메일"
                      value={findEmail}
                      onChange={(e) => setFindEmail(e.target.value)}
                    />

                  <Button
  size="lg"
  className="w-full"
  onClick={handleFindPassword}
>
  비밀번호 재설정
</Button>

                    <p className="mt-6 text-center text-sm">
                      <button onClick={() => switchMode("login")}>
                        로그인으로 돌아가기
                      </button>
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
