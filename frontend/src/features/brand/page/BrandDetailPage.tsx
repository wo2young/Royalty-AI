import { ArrowLeft, BarChart3, Brain, Fingerprint } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Link, useParams } from "react-router-dom"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { BrandDetailTabs } from "@/features/brand/components/brand-detail/BrandDetailTabs"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { TabEmptyState } from "../components/brand-detail/TabEmptyState"
import { BrandHistoryChart } from "../components/brand-detail/BrandHistoryChart"

const myBrands = [
  {
    id: 1,
    name: "테크솔루션 주식회사",
    category: "IT",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    description:
      "혁신적인 IT 솔루션을 제공하는 기업으로, 클라우드 서비스 및 AI 기반 소프트웨어 개발을 전문으로 합니다. 글로벌 시장 진출을 목표로 지속적인 기술 혁신을 이어가고 있습니다.",
    created_at: "2020.01.15",
  },
  {
    id: 2,
    name: "이노베이션랩",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "MEDICAL",
    created_at: "2026.01.08",
  },
  {
    id: 3,
    name: "퓨처테크",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "FOOD",
    created_at: "2025.12.20",
  },
  {
    id: 4,
    name: "스마트솔루션",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "COMMERCE",
    created_at: "2025.12.15",
  },
  {
    id: 5,
    name: "디지털웍스",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "CONTENT",
    created_at: "2025.12.10",
  },
  {
    id: 6,
    name: "클라우드허브",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "PET",
    created_at: "2025.12.05",
  },
  {
    id: 7,
    name: "데이터플로우",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "FINANCE",
    created_at: "2025.11.28",
  },
  {
    id: 8,
    name: "넥스트젠AI",
    category: "MANUFACTURING",
    created_at: "2025.11.20",
  },
]

const historyData = [
  { date: "2020.01", imageSimilarity: 100, textSimilarity: 100 },
  { date: "2022.01", imageSimilarity: 85, textSimilarity: 92 },
  { date: "2024.01", imageSimilarity: 72, textSimilarity: 85 },
  { date: "2026.01", imageSimilarity: 65, textSimilarity: 78 },
]

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState("history")
  const brandData = myBrands.find((b) => b.id === Number(id))

  // 데이터 존재 여부 확인 (실제 API 연동 시 이 부분을 데이터 유무로 체크하세요)
  const hasHistory = historyData && historyData.length > 0
  const hasAI = false // 현재 데이터가 없으므로 false 예시
  const hasBI = false // 현재 데이터가 없으므로 false 예시

  if (!brandData) {
    return <div className="p-20 text-center">브랜드를 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-white border-b border-slate-200/60">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            to="/mypage/brand"
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            나의 브랜드 목록으로
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-200/50">
                <img
                  src={brandData.image_path || "/placeholder.svg"}
                  alt={brandData.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5">
                    {brandData.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    등록일: {brandData.created_at}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {brandData.name}
                </h1>
                <p className="max-w-xl text-balance text-sm leading-relaxed text-muted-foreground">
                  {brandData.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                정보 수정
              </Button>
              <Button size="sm">리포트 다운로드</Button>
            </div>
          </div>
        </div>
      </div>

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
              {/*  종합 분석 */}
              {activeTab === "summary" && (
                <div className="flex flex-col gap-8">
                  {/* 데이터가 하나라도 있는 경우 카드 리스트 노출 */}
                  {hasAI || hasHistory || hasBI ? (
                    <>
                      <h2 className="text-xl font-bold text-slate-900 ml-1">
                        종합 분석 리포트
                      </h2>
                      {hasAI && (
                        <Card className="p-6">AI 분석 요약 내용...</Card>
                      )}
                      {hasHistory && <BrandHistoryChart data={historyData} />}
                      {hasBI && (
                        <Card className="p-6">BI 분석 요약 내용...</Card>
                      )}
                    </>
                  ) : (
                    /* 모든 데이터가 없을 때만 종합 Empty 화면 노출 */
                    <TabEmptyState
                      icon={BarChart3}
                      title="생성된 리포트가 없습니다"
                      description="개별 탭에서 분석을 진행하면 종합 리포트가 구성됩니다."
                    />
                  )}
                </div>
              )}

              {/* 개별 탭 */}
              {activeTab === "history" &&
                (hasHistory ? (
                  <BrandHistoryChart data={historyData} />
                ) : (
                  <TabEmptyState
                    icon={BarChart3}
                    title="변천사 데이터가 없습니다"
                    description="나의 브랜드 분석을 시작해보세요!"
                    actionLabel="분석 하러 가기"
                    onAction={() => alert("")} //TODO: 분석 페이지로 이동
                  />
                ))}

              {activeTab === "ai" &&
                (hasAI ? (
                  <Card>AI 결과</Card>
                ) : (
                  <TabEmptyState
                    icon={Brain}
                    title="AI 분석이 필요합니다"
                    description="잠재적 리스크를 진단해 보세요."
                    actionLabel="AI 분석하러가기"
                    onAction={() => alert("")} //TODO: 분석 페이지로 이동
                  />
                ))}

              {activeTab === "bi" &&
                (hasBI ? (
                  <Card>BI 결과</Card>
                ) : (
                  <TabEmptyState
                    icon={Fingerprint}
                    title="BI 분석 정보가 없습니다"
                    description="브랜드 정체성을 분석하세요."
                    actionLabel="BI 분석"
                    onAction={() => alert("")} //TODO: BI 분석기능 만들기
                  />
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
