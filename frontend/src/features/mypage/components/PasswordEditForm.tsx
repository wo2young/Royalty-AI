import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { passwordSchema, type PasswordFormValues } from "../types"
import { useUpdatePassword } from "../api/user.queries"

interface PasswordEditFormProps {
  onClose: () => void
}

export function PasswordEditForm({ onClose }: PasswordEditFormProps) {
  const { mutate: updatePassword, isPending } = useUpdatePassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormValues) => {
    updatePassword(data.newPassword, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-2">
        <div className="space-y-1">
          <Label className="text-xs ml-1">새 비밀번호</Label>
          <Input
            {...register("newPassword")}
            type="password"
            className="h-11 bg-secondary/20"
          />
          {errors.newPassword && (
            <p className="text-[10px] text-destructive ml-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs ml-1">새 비밀번호 확인</Label>
          <Input
            {...register("confirmPassword")}
            type="password"
            className="h-11 bg-secondary/20"
          />
          {errors.confirmPassword && (
            <p className="text-[10px] text-destructive ml-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 mt-auto"
        disabled={isPending} // 로딩 중 버튼 비활성화
      >
        {isPending ? "변경 중..." : "비밀번호 변경하기"}
      </Button>
    </form>
  )
}
