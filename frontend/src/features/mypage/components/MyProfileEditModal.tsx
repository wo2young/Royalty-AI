import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KeyRound, UserMinus, ShieldAlert, Lock } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ProfileEditModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<"VERIFY" | "EDIT_TAB">("VERIFY")
  const [activeTab, setActiveTab] = useState("password")

  const handleClose = () => {
    setStep("VERIFY")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-card shadow-2xl">
        {/* 높이를 고정하여 탭 전환 시 들썩거림 방지 */}
        <div className="p-8 h-110 flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            {step === "VERIFY" ? (
              <motion.div
                key="verify-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    본인 확인
                  </DialogTitle>
                  <DialogDescription>
                    안전을 위해 현재 비밀번호를 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-secondary/30"
                    />
                  </div>
                  <Button
                    className="w-full h-11 font-bold"
                    onClick={() => setStep("EDIT_TAB")}
                  >
                    인증 완료
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col flex-1"
              >
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    계정 설정
                  </DialogTitle>
                </DialogHeader>

                <TabsPrimitive.Root
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex flex-col flex-1"
                >
                  {/* BrandDetailTabs 스타일의 탭 리스트 */}
                  <TabsPrimitive.List className="relative flex p-1 bg-secondary/50 rounded-xl border border-border/50 mb-6">
                    {[
                      { id: "password", label: "비밀번호", icon: KeyRound },
                      { id: "withdraw", label: "회원 탈퇴", icon: UserMinus },
                    ].map((tab) => (
                      <TabsPrimitive.Trigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors duration-200 outline-none z-10",
                          activeTab === tab.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-background shadow-sm border border-border/40 rounded-lg -z-10"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.4,
                            }}
                          />
                        )}
                      </TabsPrimitive.Trigger>
                    ))}
                  </TabsPrimitive.List>

                  <div className="flex-1 relative mt-2">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="h-full flex flex-col"
                      >
                        {activeTab === "password" ? (
                          <div className="space-y-4 flex-1">
                            <div className="space-y-3">
                              <Input
                                type="password"
                                placeholder="현재 비밀번호"
                                className="h-11 bg-secondary/20"
                              />
                              <Input
                                type="password"
                                placeholder="새 비밀번호"
                                className="h-11 bg-secondary/20"
                              />
                              <Input
                                type="password"
                                placeholder="새 비밀번호 확인"
                                className="h-11 bg-secondary/20"
                              />
                            </div>
                            <Button className="w-full h-12 mt-auto font-bold">
                              비밀번호 변경
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4 flex-1">
                            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex gap-3">
                              <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                              <p className="text-xs text-destructive/70 leading-relaxed">
                                탈퇴 시 모든 데이터가 즉시 삭제되며 복구할 수
                                없습니다.
                              </p>
                            </div>
                            <div className="mt-auto flex flex-col gap-2">
                              <Button
                                variant="destructive"
                                className="w-full h-12 font-bold"
                              >
                                탈퇴 확정
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleClose}
                                className="h-10"
                              >
                                취소
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsPrimitive.Root>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
