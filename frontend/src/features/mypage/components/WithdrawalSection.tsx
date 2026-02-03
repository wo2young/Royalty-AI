import { ShieldAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useDeleteAccount } from "../api/user.queries"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

export function WithdrawalSection({ onCancel }: { onCancel: () => void }) {
  const { mutate: deleteAccount, isPending } = useDeleteAccount()

  return (
    <div className="flex flex-col h-full space-y-5">
      <div className="flex-1">
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-destructive">
              정말 탈퇴하시겠습니까?
            </p>
            <p className="text-xs text-destructive/70 leading-relaxed">
              탈퇴 시 모든 데이터, 브랜드 분석 내역, 북마크 등이 즉시 삭제되며
              복구가 불가능합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full h-12 font-bold"
              disabled={isPending}
            >
              {isPending ? "탈퇴 처리 중..." : "모든 정보 삭제 및 탈퇴"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                정말로 떠나시나요?
              </AlertDialogTitle>
              <AlertDialogDescription>
                탈퇴 버튼을 누르시면 계정 정보와 함께 모든 북마크 및 분석 기록이
                영구적으로 삭제됩니다. 다시 한번 확인 부탁드립니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAccount()}
                className="bg-destructive hover:bg-destructive/90 rounded-xl"
              >
                회원 탈퇴
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="outline"
          onClick={onCancel}
          className="h-10 hover:bg-secondary"
        >
          이전으로 돌아가기
        </Button>
      </div>
    </div>
  )
}
