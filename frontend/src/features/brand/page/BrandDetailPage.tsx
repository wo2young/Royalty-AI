import { Fingerprint } from "lucide-react"
import { useParams } from "react-router-dom"
import { BrandDetailTabs } from "@/features/brand/components/brand-detail/BrandDetailTabs"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { TabEmptyState } from "../components/brand-detail/TabEmptyState"
import { BrandDetailHeader } from "../components/brand-detail/BrandDetailHeader"
import { BrandHistoryTab } from "../components/brand-detail/BrandHistoryTab"
import { BrandAITab } from "../components/brand-detail/BrandAITab"
import { BrandSummaryTab } from "../components/brand-detail/BrandSummaryTab"
import { useBrandDetail } from "../api/brand.queries"

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState("history")

  const { data: brandData, isLoading, isError } = useBrandDetail(Number(id))

  if (isLoading)
    return <div className="p-20 text-center">브랜드 정보를 불러오는 중...</div>
  if (isError || !brandData) {
    return (
      <div className="p-20 text-center text-destructive">
        브랜드를 찾을 수 없거나 에러가 발생했습니다.
      </div>
    )
  }

  const formattedHistory =
    brandData.historyList
      ?.map((item) => ({
        historyId: item.historyId,
        version: item.version,
        createdAt: item.createdAt.split("T")[0].replace(/-/g, "."), // "2026-01-22" -> "2026.01.22"
        imageSimilarity: item.imageSimilarity,
        textSimilarity: item.textSimilarity,
      }))
      .reverse() || []

  // 데이터 존재 여부 확인 (실제 API 연동 시 이 부분을 데이터 유무로 체크하세요)
  const hasHistory = formattedHistory.length > 0
  const hasAI = (brandData?.reportList?.length ?? 0) > 0
  const hasBI = false // 현재 데이터가 없으므로 false

  if (!brandData) {
    return <div className="p-20 text-center">브랜드를 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <BrandDetailHeader brand={brandData} />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="space-y-8">
          <BrandDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeTab === "summary" && (
                <BrandSummaryTab
                  report={brandData.reportList[0]}
                  historyData={formattedHistory}
                  hasAI={hasAI}
                  hasHistory={hasHistory}
                  hasBI={hasBI}
                />
              )}

              {activeTab === "history" && (
                <BrandHistoryTab
                  historyData={formattedHistory}
                  hasHistory={hasHistory}
                />
              )}

              {activeTab === "ai" && (
                <BrandAITab reportList={brandData.reportList} />
              )}

              {activeTab === "bi" && (
                <TabEmptyState
                  icon={Fingerprint}
                  title="BI 분석 정보가 없습니다"
                  description="브랜드 정체성을 분석하세요."
                  actionLabel="BI 분석 시작"
                  onAction={() => {}}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
