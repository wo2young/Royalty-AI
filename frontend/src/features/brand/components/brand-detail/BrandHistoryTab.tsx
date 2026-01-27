import { BarChart3 } from "lucide-react"
import { BrandHistoryChart } from "./BrandHistoryChart"
import { TabEmptyState } from "./TabEmptyState"
import type { HistoryData } from "../../types"

interface BrandHistoryTabProps {
  historyData: HistoryData[]
  hasHistory: boolean
}

export function BrandHistoryTab({
  historyData,
  hasHistory,
}: BrandHistoryTabProps) {
  return hasHistory ? (
    <BrandHistoryChart data={historyData} />
  ) : (
    <TabEmptyState
      icon={BarChart3}
      title="변천사 데이터가 없습니다"
      description="나의 브랜드 분석을 시작해보세요!"
      actionLabel="분석 하러 가기"
      onAction={() => alert("분석 페이지 이동")}
    />
  )
}
