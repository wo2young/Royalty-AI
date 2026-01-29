import { Brain } from "lucide-react"
import { BrandAIReportCard } from "./BrandAIReportCard"
import { TabEmptyState } from "./TabEmptyState"
import type { BrandReport } from "../../types"

interface BrandAITabProps {
  reportList: BrandReport[]
}

export function BrandAITab({ reportList }: BrandAITabProps) {
  return reportList.length > 0 ? (
    <BrandAIReportCard report={reportList[0]} />
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
