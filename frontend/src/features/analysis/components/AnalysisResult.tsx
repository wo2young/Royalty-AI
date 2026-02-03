import { AnimatePresence, motion, type Variants } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, Sparkles } from "lucide-react"
import type { AnalysisResult } from "../types"
import { useAnalysisQueries } from "../api/analysis.queries"
import { BrandAIReportCard } from "@/features/brands/components/brand-detail/BrandAIReportCard"
import { useState } from "react"
import type { BrandReport } from "@/features/brands/types"

// 애니메이션 컨테이너
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// 개별 카드 아이템 애니메이션 설정
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

interface AnalysisResultsProps {
  results: AnalysisResult[]
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid gap-3">
        {results.map((trademark) => (
          <AnalysisItem key={trademark.id} trademark={trademark} />
        ))}
      </div>
    </motion.div>
  )
}

function AnalysisItem({ trademark }: { trademark: AnalysisResult }) {
  const [reportData, setReportData] = useState<BrandReport | null>(null)

  const { mutate: analyzeDetail, isPending: isAnalyzing } =
    useAnalysisQueries.useAnalyzeDetail()

  const handleDetailAnalysis = (trademark: AnalysisResult) => {
    if (reportData) {
      setReportData(null)
      return
    }

    analyzeDetail(
      {
        id: trademark.id,
        trademark_name: trademark.trademark_name,
        applicant: trademark.applicant,
        category: trademark.category,
        combinedSimilarity: trademark.combinedSimilarity,

        brandName: trademark.trademark_name,
        logoPath: trademark.imageUrl,
        brandId: trademark.brandId,
      },
      {
        onSuccess: (data) => {
          console.log("AI 분석 서버 응답:", data)
          const formattedReport = {
            reportId: trademark.id,
            title: `${trademark.trademark_name} 상세 분석`,
            applicant: trademark.applicant,
            riskScore: data.riskScore ||  trademark.combinedSimilarity,
            summary: data.summary,
            suggestions: data.suggestions ||  [
              "유사 상표가 존재하므로 로고 디자인 수정을 권장합니다.",
            ],
            createdAt: data.createdAt || new Date().toISOString(),
          }
          console.log("가공된 리포트 데이터:", formattedReport)
          setReportData(formattedReport)
        },
      }
    )
  }

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="group p-5 hover:border-slate-300 transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700">
        <div className="flex items-center gap-6">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            {trademark.imageUrl ? (
              <img
                src={trademark.imageUrl}
                alt={trademark.trademark_name}
                className="object-cover w-full h-full"
              />
            ) : (
              <Building2 className="h-7 w-7 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {trademark.trademark_name}
                </h4>
                <span className="text-xs font-bold text-indigo-600">
                  {trademark.combinedSimilarity}% 일치
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={reportData ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => handleDetailAnalysis(trademark)}
                  disabled={isAnalyzing}
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
                  />
                  {isAnalyzing
                    ? "분석 중..."
                    : reportData
                      ? "결과 접기"
                      : "AI 분석"}
                </Button>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-400">출원인:</span>{" "}
              {trademark.applicant}
            </div>
          </div>
        </div>

        {/* AI 분석 결과 섹션 */}
        <AnimatePresence>
          {reportData && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 20 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <BrandAIReportCard report={reportData} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
