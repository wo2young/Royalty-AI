import { useParams } from "react-router-dom"
import { BrandDetailTabs } from "@/features/brands/components/brand-detail/BrandDetailTabs"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { BrandDetailHeader } from "../components/brand-detail/BrandDetailHeader"
import { BrandHistoryTab } from "../components/brand-detail/BrandHistoryTab"
import { BrandAITab } from "../components/brand-detail/BrandAITab"
import { BrandSummaryTab } from "../components/brand-detail/BrandSummaryTab"
import {
  useBrandDetail,
  useBrandIdentity,
  useToggleNotification,
  useUpdateBrand,
} from "../api/brand.queries"
import { BrandBITab } from "../components/brand-detail/BrandBITab"
import { ConfirmAnalysisModal } from "../components/modal/ConfirmAnalysisModal"

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState("history")
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const brandId = Number(id)

  const { mutate: toggleNotify } = useToggleNotification()
  const { data: brandData, isLoading, isError } = useBrandDetail(Number(id))
  const { mutate: updateBrand, isPending: isUpdatePending } = useUpdateBrand()
  const { data: biData, isLoading: isBiLoading } = useBrandIdentity(brandId)

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
        fullTimestamp: item.createdAt,
        createdAt: item.createdAt.split("T")[0].replace(/-/g, "."), // "2026-01-22" -> "2026.01.22"
        imageSimilarity: item.imageSimilarity,
        textSimilarity: item.textSimilarity,
        imagePath: item.imagePath,
      }))
      .sort(
        (a, b) =>
          new Date(a.fullTimestamp).getTime() -
          new Date(b.fullTimestamp).getTime()
      ) || []

  // 데이터 존재 여부 확인 (실제 API 연동 시 이 부분을 데이터 유무로 체크하세요)
  const hasHistory = formattedHistory.length > 0
  const hasAI = (brandData?.historyList?.length ?? 0) > 0
  const hasBI = !!biData?.identityPayload

  const handleToggleNotify = (brandId: number, enabled: boolean) => {
    toggleNotify({ brandId, enabled })
  }

  const handleEditSubmit = (formData: FormData) => {
    updateBrand(
      { brandId, formData },
      {
        onSuccess: () => {
          setIsConfirmModalOpen(true)
        },
        onError: () => alert("수정 중 오류가 발생했습니다."),
      }
    )
  }

  if (!brandData) {
    return <div className="p-20 text-center">브랜드를 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <BrandDetailHeader
        brand={brandData}
        hasHistory={hasHistory}
        onToggleNotify={handleToggleNotify}
        onEditSubmit={handleEditSubmit}
        isUpdatePending={isUpdatePending}
      />

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
                  report={brandData.parsedDetail}
                  historyData={formattedHistory}
                  identityPayload={biData?.identityPayload}
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
                <BrandAITab report={brandData.parsedDetail} />
              )}

              {activeTab === "bi" && (
                <BrandBITab
                  brandId={brandId}
                  data={biData}
                  isLoading={isBiLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ConfirmAnalysisModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
      />
    </div>
  )
}
