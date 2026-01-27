import { useSearchParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import axiosInstance from "@/shared/api/axios"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  if (!token) {
    return <div className="p-10 text-center">유효하지 않은 접근입니다.</div>
  }

  const handleResetPassword = async () => {
    if (!password || !passwordConfirm) {
      alert("비밀번호를 입력하세요.")
      return
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      setLoading(true)

      await axiosInstance.post("/api/auth/password/reset", null, {
        params: {
          token,
          newPassword: password,
        },
      })

      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.")
      navigate("/auth/login")

    } catch (err: any) {
      const msg = err?.response?.data?.message
      alert(msg || "비밀번호 재설정 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-center">비밀번호 재설정</h2>

          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="새 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="새 비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          <Button
            size="lg"
            className="w-full"
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? "처리 중..." : "비밀번호 변경"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
