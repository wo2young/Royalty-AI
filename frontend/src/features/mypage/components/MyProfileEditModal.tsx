import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KeyRound, UserMinus } from "lucide-react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { Dialog, DialogContent } from "@/shared/components/ui/dialog"
import { cn } from "@/lib/utils"
import { VerifyPasswordStep } from "./VerifyPasswordStep"
import { PasswordEditForm } from "./PasswordEditForm"
import { WithdrawalSection } from "./WithdrawalSection"

export function ProfileEditModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<"VERIFY" | "EDIT_TAB">("VERIFY")
  const [activeTab, setActiveTab] = useState("password")

  const handleVerifySuccess = async () => {
    setStep("EDIT_TAB")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setStep("VERIFY")
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-md p-0 border-none bg-card shadow-2xl">
        <div className="p-8 h-135 flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            {step === "VERIFY" ? (
              <VerifyPasswordStep key="verify" onVerify={handleVerifySuccess} />
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col flex-1"
              >
                <h2 className="text-2xl font-bold tracking-tight mb-6">
                  계정 설정
                </h2>

                <TabsPrimitive.Root
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex flex-col flex-1"
                >
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
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-primary shadow-sm border border-border/40 rounded-lg -z-10"
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

                  <div className="flex-1 relative">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="h-full"
                      >
                        {activeTab === "password" ? (
                          <PasswordEditForm />
                        ) : (
                          <WithdrawalSection onCancel={onClose} />
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
