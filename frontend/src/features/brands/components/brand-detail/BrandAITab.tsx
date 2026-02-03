import { Brain } from "lucide-react"
import { BrandAIReportCard } from "./BrandAIReportCard"
import { TabEmptyState } from "./TabEmptyState"
import type { BrandReport } from "../../types"

interface BrandAITabProps {
  report?: BrandReport
}

export function BrandAITab({ report }: BrandAITabProps) {
  return report ? (
    <BrandAIReportCard report={report} />
  ) : (
    <TabEmptyState
      icon={Brain}
      title="AI 분석 리포트가 없습니다"
      description="브랜드 로고와 네이밍을 AI가 정밀 분석하여 리스크를 예방해 드립니다."
      actionLabel="지금 분석 시작하기"
      onAction={() => console.log("분석 시작")}
    />
  )
}
