import { BarChart3 } from "lucide-react"
import { BrandAIReportCard } from "./BrandAIReportCard"
import { BrandHistoryChart } from "./BrandHistoryChart"
import { TabEmptyState } from "./TabEmptyState"
import { Card } from "@/shared/components/ui/card"
import type { BrandReport } from "../../types"
import type { ChartData } from "../../types"

interface BrandSummaryTabProps {
  report: BrandReport
  historyData: ChartData[]
  hasAI: boolean
  hasHistory: boolean
  hasBI: boolean
}

export function BrandSummaryTab({
  report,
  historyData,
  hasAI,
  hasHistory,
  hasBI,
}: BrandSummaryTabProps) {
  if (!hasAI && !hasHistory && !hasBI) {
    return (
      <TabEmptyState
        icon={BarChart3}
        title="생성된 리포트가 없습니다"
        description="개별 탭에서 분석을 진행하면 종합 리포트가 구성됩니다."
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-xl font-bold text-slate-900 ml-1">
        종합 분석 리포트
      </h2>
      {hasAI && <BrandAIReportCard report={report} />}
      {hasHistory && <BrandHistoryChart data={historyData} />}
      {hasBI && <Card className="p-6">BI 분석 요약 내용...</Card>}
    </div>
  )
}
