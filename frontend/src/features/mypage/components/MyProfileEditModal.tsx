"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Trash2, ShieldAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog"

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  currentEmail: string
}

export function ProfileEditModal({
  isOpen,
  onClose,
  currentEmail,
}: ProfileEditModalProps) {
  const [email, setEmail] = useState(currentEmail)
  const [isDeleteMode, setIsDeleteMode] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-110 p-0 overflow-hidden border-none bg-card shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              계정 설정
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              개인 정보를 안전하게 관리하고 업데이트하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2 group">
              <Label
                htmlFor="email"
                className="text-sm font-medium group-focus-within:text-primary transition-colors"
              >
                이메일 주소
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-secondary/30 border-secondary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* 회원 탈퇴 섹션 */}
            <div className="pt-4 border-t border-border/50">
              {!isDeleteMode ? (
                <button
                  onClick={() => setIsDeleteMode(true)}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors group"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover:shake" />더 이상
                  서비스를 이용하고 싶지 않으신가요?
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-destructive">
                        정말 탈퇴하시겠습니까?
                      </p>
                      <p className="text-xs text-destructive/70 leading-relaxed">
                        탈퇴 시 모든 데이터와 혜택이 즉시 삭제되며 복구할 수
                        없습니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-4 font-medium"
                    >
                      탈퇴 확정
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDeleteMode(false)}
                      className="h-8 px-4"
                    >
                      취소
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 font-medium"
            >
              닫기
            </Button>
            <Button className="flex-1 h-11 font-medium shadow-lg shadow-primary/20">
              변경사항 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
