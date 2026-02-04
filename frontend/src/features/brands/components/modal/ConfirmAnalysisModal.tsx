import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog"

interface ConfirmAnalysisModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmAnalysisModal({
  open,
  onOpenChange,
}: ConfirmAnalysisModalProps) {
  const navigate = useNavigate()

  const handleGoToAnalysis = () => {
    navigate("/analysis", {
      state: {
        activeTab: "mybrand",
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">브랜드 정보 수정 완료</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            브랜드 정보가 변경되어 기존 AI 분석 결과가 유효하지 않을 수
            있습니다. 지금 바로 새로운 정보로 다시 분석하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-center gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-32"
          >
            나중에 하기
          </Button>
          <Button
            onClick={handleGoToAnalysis}
            className="w-full sm:w-32 shadow-md"
          >
            재분석 하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
