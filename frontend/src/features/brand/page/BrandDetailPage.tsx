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
import { BrandAIReportCard } from "../components/brand-detail/BrandAIReportCard"

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
        date: item.createdAt.split("T")[0].replace(/-/g, "."), // "2026-01-22" -> "2026.01.22"
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
                  src={brandData.currentLogoPath || "/placeholder.svg"}
                  alt={brandData.brandName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5">
                    {brandData.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    등록일: {brandData.createdAt}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {brandData.brandName}
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
                        <BrandAIReportCard report={brandData.reportList[0]} />
                      )}
                      {hasHistory && (
                        <BrandHistoryChart data={formattedHistory} />
                      )}
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
                  <BrandHistoryChart data={formattedHistory} />
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
                (brandData.reportList.length > 0 ? (
                  <BrandAIReportCard report={brandData.reportList[0]} /> // 첫 번째 리포트 노출
                ) : (
                  <TabEmptyState
                    icon={Brain}
                    title="AI 분석 리포트가 없습니다"
                    description="브랜드 로고와 네이밍을 AI가 정밀 분석하여 리스크를 예방해 드립니다."
                    actionLabel="지금 분석 시작하기"
                    onAction={() => console.log("분석 시작")}
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
