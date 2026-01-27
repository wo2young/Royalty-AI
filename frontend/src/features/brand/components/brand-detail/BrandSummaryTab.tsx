import { BarChart3 } from "lucide-react"
import { BrandAIReportCard } from "./BrandAIReportCard"
import { BrandHistoryChart } from "./BrandHistoryChart"
import { TabEmptyState } from "./TabEmptyState"
import type { BrandIdentityPayload, BrandReport } from "../../types"
import type { HistoryData } from "../../types"
import { BrandBIReportCard } from "./BrandBIReportCard"

interface BrandSummaryTabProps {
  report: BrandReport
  historyData: HistoryData[]
  identityPayload?: BrandIdentityPayload
  hasAI: boolean
  hasHistory: boolean
  hasBI: boolean
}

export function BrandSummaryTab({
  report,
  historyData,
  identityPayload,
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
      {hasBI && identityPayload && (
        <div className="space-y-6">
          <BrandBIReportCard identityPayload={identityPayload} />
        </div>
      )}
      {hasAI && <BrandAIReportCard report={report} />}
      {hasHistory && <BrandHistoryChart data={historyData} />}
    </div>
  )
}
