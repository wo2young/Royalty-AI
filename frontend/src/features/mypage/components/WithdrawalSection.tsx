import { ShieldAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useDeleteAccount } from "../api/user.queries"

export function WithdrawalSection({ onCancel }: { onCancel: () => void }) {
  const { mutate: deleteAccount } = useDeleteAccount()

  const handleWithdraw = () => {
    if (confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      deleteAccount()
    }
  }

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
        <Button
          variant="destructive"
          className="w-full h-12 font-bold"
          onClick={handleWithdraw}
        >
          모든 정보 삭제 및 탈퇴
        </Button>
        <Button variant="outline" onClick={onCancel} className="h-10">
          취소
        </Button>
      </div>
    </div>
  )
}
