import { useState } from "react"
import { Lock, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { motion } from "framer-motion"

interface VerifyPasswordStepProps {
  onVerify: (password: string) => Promise<void>
}

export function VerifyPasswordStep({ onVerify }: VerifyPasswordStepProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    setIsLoading(true)
    await onVerify(password)
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">본인 확인</h2>
        <p className="text-sm text-muted-foreground">
          안전을 위해 현재 비밀번호를 입력해주세요.
        </p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="••••••••"
            className="pl-10 h-11 bg-secondary/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          className="w-full h-11 font-bold"
          onClick={handleVerify}
          disabled={!password || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "인증 완료"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
