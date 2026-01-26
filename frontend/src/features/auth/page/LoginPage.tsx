import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { useAuth } from "@/shared/auth/AuthContext"
import axiosInstance from "@/shared/api/axios"
import { useNavigate } from "react-router-dom"
import { useSearchParams } from "react-router-dom"
import { useEffect } from "react"



// 🔴 Mode 확장
type Mode = "login" | "signup" | "findId" | "findPassword"

export default function LoginPage() {

  // 🔹 회원가입 단계 (약관 → 폼)
type SignupStep = "terms" | "form"
const [signupStep, setSignupStep] = useState<SignupStep>("terms")


// 🔹 약관 동의 상태
const [terms, setTerms] = useState({
  all: false,
  service: false,   // 필수
  privacy: false,   // 필수
  marketing: false, // 선택
})

  const [mode, setMode] = useState<Mode>("login")
  const [panelMoving, setPanelMoving] = useState(false)
  const navigate = useNavigate()
  // 로그아웃버튼 누르면 회원가입으로 슬라이드
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const modeParam = searchParams.get("mode")

    if (modeParam === "signup") {
      setMode("signup")
    }
  }, [searchParams])


const canNextSignup = terms.service && terms.privacy

// 🔹 개별 약관 토글
const toggleTerm = (key: "service" | "privacy" | "marketing") => {
  setTerms((prev) => {
    const next = { ...prev, [key]: !prev[key] }
    next.all = next.service && next.privacy && next.marketing
    return next
  })
}

// 🔹 전체 동의 토글
const toggleAllTerms = (checked: boolean) => {
  setTerms({
    all: checked,
    service: checked,
    privacy: checked,
    marketing: checked,
  })
}


//회원가입 아이디중복 체크
const [usernameChecked, setUsernameChecked] = useState(false)
const [usernameCheckMessage, setUsernameCheckMessage] = useState<string | null>(null)




  /* =========================
   UI 메시지 (alert 대체)
   ========================= */
const [uiMessage, setUiMessage] = useState<string | null>(null)
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
  const [countdown, setCountdown] = useState<number | null>(null)

  const { login } = useAuth()

  /* =========================
   이메일 인증
   ========================= */
const [emailAuthCode, setEmailAuthCode] = useState("")
const [emailCodeSent, setEmailCodeSent] = useState(false)

  // 🔴 입력값 초기화
 // 🔴 입력값 + 인증 상태 초기화
const resetInputs = () => {
  setUsername("")
  setPassword("")
  setSignupUsername("")
  setSignupEmail("")
  setSignupPassword("")
  setSignupPasswordConfirm("")
  setFindEmail("")
  setFindUsername("")

  // 🔴 인증 관련
  setEmailAuthCode("")
  setEmailCodeSent(false)

  // 🔴 UI 메시지
  setUiMessage(null)
}

  // 🔴 switchMode 확장 (동작은 기존과 동일)
  const switchMode = (next: Mode) => {
  if (next === mode) return
  setPanelMoving(true)

  setTimeout(() => {
    resetInputs()
    setUiMessage(null)

   if (next === "signup") {
  setSignupStep("terms") // 약관부터
  setTerms({
    all: false,
    service: false,
    privacy: false,
    marketing: false,
  })
}
    setMode(next)
    setPanelMoving(false)
  }, 400)
}
  /* =========================
   ✅ 일반 로그인
   ========================= */
const handleLogin = async () => {
  if (!username || !password) {
    setUiMessage("아이디와 비밀번호를 입력하세요.")
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
    setUiMessage("아이디 또는 비밀번호가 올바르지 않습니다.")
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
  const KakaoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 3C6.48 3 2 6.58 2 11c0 2.88 1.93 5.42 4.83 6.82L6 21l4.14-2.26c.6.08 1.22.12 1.86.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
      fill="#000000"
    />
  </svg>
)


  /* =========================
     ✅ 회원가입
     ========================= */
const handleSignup = async () => {
  // 아이디 길이 체크
  if (signupUsername.length < 6 || signupUsername.length > 12) {
    setUiMessage("아이디는 6자 이상 12자 이하로 입력해주세요.")
    return
  }

  // 비밀번호 길이 체크
  if (signupPassword.length < 8 || signupPassword.length > 16) {
    setUiMessage("비밀번호는 8자 이상 16자 이하로 입력해주세요.")
    return
  }

  // 비밀번호 확인
  if (signupPassword !== signupPasswordConfirm) {
    setUiMessage("비밀번호가 일치하지 않습니다.")
    return
  }

  try {
    await axiosInstance.post("/api/auth/signup", {
      username: signupUsername,
      password: signupPassword,
      email: signupEmail,
      emailAuthCode,
    })

    let seconds = 3
    setCountdown(seconds)
    setUiMessage(
      `회원가입이 완료되었습니다. ${seconds}초 후 로그인 화면으로 이동합니다.`
    )

    const timer = setInterval(() => {
      seconds -= 1
      setCountdown(seconds)

      if (seconds > 0) {
        setUiMessage(
          `회원가입이 완료되었습니다. ${seconds}초 후 로그인 화면으로 이동합니다.`
        )
      } else {
        clearInterval(timer)
        setCountdown(null)
        switchMode("login")
      }
    }, 1000)

  } catch (err: any) {
    const message = err?.response?.data?.message
    setUiMessage(message || "회원가입에 실패했습니다.")
  }
}



/* =========================
   이메일 인증번호 발송
   ========================= */
const handleSendEmailAuthCode = async () => {
  if (!signupEmail) {
    setUiMessage("이메일을 입력하세요.")
    return
  }

  try {
    await axiosInstance.post("/api/auth/email/send", {
      email: signupEmail,
    })
    setUiMessage("인증번호를 이메일로 전송했습니다.")
    setEmailCodeSent(true)
  } catch (err: any) {
    setUiMessage(
      err?.response?.data?.message || "인증번호 발송 실패"
    )
  }
}



   


  /* =========================
     아이디찾기 관련
     ========================= */
  const handleFindId = async () => {
  if (!findEmail) {
    setUiMessage("이메일을 입력하세요.")
    return
  }

  try {
    await axiosInstance.post("/api/auth/find-username", {
      email: findEmail,
    })

    let seconds = 3
    setCountdown(seconds)
    setUiMessage(`입력하신 이메일로 아이디를 전송했습니다. ${seconds}초 후 로그인 화면으로 이동합니다.`)

    const timer = setInterval(() => {
      seconds -= 1
      setCountdown(seconds)

      if (seconds > 0) {
        setUiMessage(
          `입력하신 이메일로 아이디를 전송했습니다. ${seconds}초 후 로그인 화면으로 이동합니다.`
        )
      } else {
        clearInterval(timer)
        setCountdown(null)
        switchMode("login")
      }
    }, 1000)

  } catch {
    setUiMessage("해당 이메일로 등록된 계정이 없습니다.")
  }
}

/* =========================
   비밀번호 재설정 메일 요청
   ========================= */
const handleFindPassword = async () => {
  if (!findEmail || !findUsername) {
    setUiMessage("아이디와 이메일을 입력하세요.")
    return
  }

  try {
    await axiosInstance.post("/api/auth/password/reset-request", {
      username: findUsername,
      email: findEmail,
    })

    let seconds = 3
    setCountdown(seconds)
    setUiMessage(
      `비밀번호 재설정 메일을 전송했습니다. ${seconds}초 후 로그인 화면으로 이동합니다.`
    )

    const timer = setInterval(() => {
      seconds -= 1
      setCountdown(seconds)

      if (seconds > 0) {
        setUiMessage(
          `비밀번호 재설정 메일을 전송했습니다. ${seconds}초 후 로그인 화면으로 이동합니다.`
        )
      } else {
        clearInterval(timer)
        setCountdown(null)
        switchMode("login")
      }
    }, 1000)

  } catch (err: any) {
    const message = err?.response?.data?.message
    setUiMessage(message || "비밀번호 재설정 요청 실패")
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
    rounded-xl
    transition-transform duration-500 ease-in-out
    ${panelMoving ? "translate-x-full" : "translate-x-0"}`}
>
    <div className="flex h-full flex-col items-center justify-center px-12">
  <img
    src="/logo.svg"
    alt="Royalty-AI Logo"
    className="w-70 mb-6 cursor-pointer transition-opacity hover:opacity-80
               brightness-0 invert"
    onClick={() => navigate("/")}
  />
  <p className="text-base text-white/120 leading-relaxed text-center">
    상표 충돌을 실시간으로 분석하고
    <br />
    브랜드를 보호하세요
  </p>
</div>
</div>



          <div className="grid grid-cols-2 h-full">
            <div />

          <div className="relative flex items-center justify-center px-10 h-full">

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

                  {uiMessage && (
                    <p className="text-sm text-red-500 mt-1">
                      {uiMessage}
                    </p>
                  )}

                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={handleLogin}
                  >
                    Royalty Login
                  </Button>

                    <Button
                    type="button"
                    size="lg"
                    onClick={handleKakaoLogin}
                    className="
                      w-full
                      bg-[#FEE500]
                      text-black
                      font-medium
                      hover:bg-[#E6D200]
                      active:bg-[#D4C100]
                      flex items-center justify-center gap-2
                    "
                  >
                    <KakaoIcon />
                    <span>Login with Kakao</span>
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
  <div className="absolute inset-0 overflow-hidden">
    <div
      className={`flex w-[200%] h-full transition-transform duration-500
        ${signupStep === "terms" ? "translate-x-0" : "-translate-x-1/2"}`}
    >
      {/* ===== STEP 1 : 약관 동의 ===== */}
      <div className="w-1/2 pr-4 h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">약관 동의</h2>

        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={terms.all}
              onChange={(e) => toggleAllTerms(e.target.checked)}
            />
            전체 동의
          </label>

          <hr />

          <label className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={terms.service}
              onChange={() => toggleTerm("service")}
            />
            이용약관 동의 <span className="text-red-500">(필수)</span>
          </label>

          <div className="mt-2 h-24 overflow-y-scroll rounded-md border bg-muted/30 p-2 text-xs leading-relaxed">
            <p>
              본 약관은 Royalty-AI 서비스의 이용과 관련하여 회사와 회원 간의
              권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
            <p className="mt-2">
              회원은 본 서비스를 이용함에 있어 관계 법령 및 본 약관을
              준수하여야 하며, 회사의 정상적인 서비스 운영을 방해하는 행위를
              해서는 안 됩니다.
            </p>
            <p className="mt-2">
              회사는 서비스의 일부 또는 전부를 사전 고지 후 변경하거나
              중단할 수 있습니다.
            </p>
          </div>


        <label className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    checked={terms.privacy}
    onChange={() => toggleTerm("privacy")}
  />
  개인정보 처리방침 <span className="text-red-500">(필수)</span>
</label>

<div className="mt-2 h-24 overflow-y-scroll rounded-md border bg-muted/30 p-2 text-xs leading-relaxed">
  <p>
    회사는 회원가입, 서비스 제공을 위하여 최소한의 개인정보를
    수집하며, 수집된 개인정보는 목적 외의 용도로 이용되지 않습니다.
  </p>
  <p className="mt-2">
    수집 항목: 아이디, 이메일, 비밀번호(암호화)
  </p>
  <p className="mt-2">
    개인정보는 회원 탈퇴 시 지체 없이 파기되며, 관련 법령에 따라
    일정 기간 보관될 수 있습니다.
  </p>
</div>

<label className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    checked={terms.marketing}
    onChange={() => toggleTerm("marketing")}
  />
  마케팅 정보 수신 (선택)
</label>

<div className="mt-2 h-20 overflow-y-scroll rounded-md border bg-muted/30 p-2 text-xs leading-relaxed">
  <p>
    회사는 신규 기능 안내, 이벤트, 프로모션 정보 등을 이메일 또는
    알림을 통해 제공할 수 있습니다.
  </p>
  <p className="mt-2">
    마케팅 정보 수신에 동의하지 않더라도 서비스 이용에는 제한이
    없습니다.
  </p>
</div>

        </div>

        {!canNextSignup && (
          <p className="text-xs text-red-500 mt-3">
            필수 약관에 동의해주세요.
          </p>
        )}

        <Button
          size="lg"
          className="w-full mt-6"
          disabled={!canNextSignup}
          onClick={() => setSignupStep("form")}
        >
          다음
        </Button>
      </div>

              {/* ===== STEP 2 : 회원가입 폼 ===== */}
              <div className="w-1/2 pl-4">
                <h2 className="text-2xl font-bold mb-1">회원가입</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  새 계정을 만들어 시작하세요
                </p>

                <div className="space-y-4">
                  <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="아이디"
          value={signupUsername}
          onChange={(e) => {
            setSignupUsername(e.target.value)
            setUsernameChecked(false)
            setUsernameCheckMessage(null)
          }}
        />

          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="이메일"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              className="px-3 text-xs whitespace-nowrap"
              onClick={handleSendEmailAuthCode}
            >
              인증번호 받기
            </Button>
          </div>

          {emailCodeSent && (
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="이메일 인증번호"
              value={emailAuthCode}
              onChange={(e) => setEmailAuthCode(e.target.value)}
            />
          )}

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

          {uiMessage && (
            <p className="text-sm text-red-500 mt-1">
              {uiMessage}
            </p>
          )}

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
    </div>
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

    {uiMessage && (
      <p className="text-sm text-red-500 mb-3">{uiMessage}</p>
    )}

    <Button size="lg" className="w-full" onClick={handleFindId}>
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

    {uiMessage && (
      <p className="text-sm text-red-500 mb-3">{uiMessage}</p>
    )}

    <Button size="lg" className="w-full" onClick={handleFindPassword}>
      비밀번호 재설정
    </Button>

    <p className="mt-6 text-center text-sm text-muted-foreground">
      <button
        onClick={() => switchMode("login")}
        className="transition-colors hover:text-[#1f2a44] hover:underline"
      >
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
