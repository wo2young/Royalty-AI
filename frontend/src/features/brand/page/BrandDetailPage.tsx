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

const myBrands = [
  {
    brandId: 1,
    brandName: "테크솔루션 주식회사",
    category: "IT/서비스",
    description: "혁신적인 AI 기반 클라우드 보안 솔루션을 제공합니다.",
    currentLogoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    createdAt: "2026.01.15",
    historyList: [
      {
        historyId: 10,
        version: "v2",
        imageSimilarity: 12.5,
        textSimilarity: 5.0,
        createdAt: "2026-01-22T14:30:00",
      },
      {
        historyId: 5,
        version: "v1",
        imageSimilarity: 45.8,
        textSimilarity: 10.2,
        createdAt: "2026-01-10T10:00:00",
      },
    ],
    reportList: [
      {
        reportId: 101,
        title: "상표권 침해 가능성 및 로고 유사성 분석",
        summary:
          "현재 로고는 기존 IT 서비스 군의 상표들과 낮은 유사도를 보이고 있어 안정적입니다.",
        riskScore: 24,
        suggestions: ["메인 컬러 채도 조절", "폰트 독창성 확보"],
        createdAt: "2026-01-22T14:30:00",
      },
    ],
  },
  {
    brandId: 2,
    brandName: "이노베이션 메디컬",
    category: "MEDICAL",
    description:
      "차세대 원격 진료 및 스마트 헬스케어 시스템을 개발하는 의료 전문 기업입니다.",
    currentLogoPath:
      "https://images.unsplash.com/photo-1505751172107-5739a00723a5?auto=format&fit=crop&q=80&w=200",
    createdAt: "2026.01.08",
    historyList: [], // 데이터 없는 상태 테스트용 (Empty State)
    reportList: [], // 데이터 없는 상태 테스트용 (Empty State)
  },
  {
    brandId: 3,
    brandName: "퓨처푸드 랩",
    category: "FOOD",
    description:
      "지속 가능한 미래 식량을 연구하고 친환경 대체육 솔루션을 제안합니다.",
    currentLogoPath:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200",
    createdAt: "2025.12.20",
    historyList: [
      {
        historyId: 11,
        version: "v1",
        imageSimilarity: 88.2,
        textSimilarity: 95.0,
        createdAt: "2025-12-20T09:00:00",
      },
    ],
    reportList: [
      {
        reportId: 102,
        title: "신규 로고 시장 적합성 분석",
        summary:
          "식품 업계의 전형적인 그린 컬러를 사용하여 신뢰감을 주지만, 경쟁사와 로고 형태가 매우 유사하여 리스크가 높습니다.",
        riskScore: 78, // 리스크가 높은 케이스 테스트
        suggestions: ["로고 심볼의 차별화 필요", "보조 색상 도입 권장"],
        createdAt: "2025-12-25T11:00:00",
      },
    ],
  },
]

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState("history")
  const brandData = myBrands.find((b) => b.brandId === Number(id))

  const formattedHistory =
    brandData?.historyList
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
