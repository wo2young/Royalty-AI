import { Brain, Loader2 } from "lucide-react"
import { TabEmptyState } from "./TabEmptyState"
import { BrandBIReportCard } from "./BrandBIReportCard"
import type { BrandBIData } from "../../types"
import { useAnalyzeIdentity } from "../../api/brand.queries"

interface BrandBITabProps {
  brandId: number
  data?: BrandBIData | null
  isLoading?: boolean
}

export function BrandBITab({
  brandId,
  data,
  isLoading: isDataLoading,
}: BrandBITabProps) {
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeIdentity()
  const hasBI = data && data.identityPayload

  const handleAnalyze = () => {
    analyze(brandId)
  }

  if (isAnalyzing || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2
          className="w-16 h-16 text-indigo-600 animate-spin"
          strokeWidth={1.5}
        />
        <p className="text-slate-500 font-medium">
          BI가 브랜드를 분석 중입니다...
        </p>
      </div>
    )
  }

  return hasBI ? (
    <BrandBIReportCard identityPayload={data.identityPayload} />
  ) : (
    <TabEmptyState
      icon={Brain}
      title="BI 분석을 시작해 보세요"
      description="등록하신 브랜드 로고와 상호명을 바탕으로 AI가 정밀 분석 리포트를 생성합니다"
      actionLabel="지금 분석 시작하기"
      onAction={handleAnalyze}
    />
  )
}
