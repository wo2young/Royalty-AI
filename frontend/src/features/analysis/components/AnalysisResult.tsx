import { AnimatePresence, motion, type Variants } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, Sparkles, Save } from "lucide-react"
import type { AnalysisResult, BrandReport } from "../types"
import { useAnalysisQueries } from "../api/analysis.queries"
import { BrandAIReportCard } from "@/features/brands/components/brand-detail/BrandAIReportCard"
import { useState } from "react"
import { useAuth } from "@/shared/auth/AuthContext"
import { useFormContext } from "react-hook-form"
import type { AnalysisFormValues } from "../page/AnalysisPage"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
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

  // 저장에 쓸 “실제 분석 결과 DTO”를 따로 보관 (중요)
  const [analysisPayload, setAnalysisPayload] = useState<any>(null)

  const { user } = useAuth()
  const { watch } = useFormContext<AnalysisFormValues>()

  const currentBrandId = watch("brandId")
  const myBrandName = watch("brandName") || ""
  const myLogoPath = watch("logoUrl") || "" // 파일 업로드면 S3 URL을 프론트가 몰라서 일단 ""/URL만 사용

  const { mutate: analyzeDetail, isPending: isAnalyzing } =
    useAnalysisQueries.useAnalyzeDetail()
  const { mutate: saveFinal, isPending: isSaving } =
    useAnalysisQueries.useSaveFinal()

  const handleDetailAnalysis = () => {
    if (reportData) {
      setReportData(null)
      setAnalysisPayload(null)
      return
    }
    if (!user) {
      alert("분석을 위해 로그인이 필요합니다.")
      return
    }

    analyzeDetail(
      {
        ...trademark,
        // 핵심: brandName은 '내 브랜드명'
        brandName: myBrandName,
        // 핵심: logoPath는 내 로고 경로(없으면 ""이라도 보내서 흐름 유지)
        logoPath: myLogoPath,
        // brandId는 저장 가능 여부 판단용(없으면 0)
        brandId: currentBrandId ?? 0,
      },
      {
        onSuccess: (data: any) => {
          // /save에 그대로 보낼 “DTO 원본” 저장

          setAnalysisPayload(data)

          setReportData({
            reportId: trademark.id,
            title: `${trademark.trademark_name} 상세 분석`,
            riskScore: trademark.combinedSimilarity,
            // 백엔드 응답은 aiSummary/aiAnalysisSummary 둘 중 하나로 올 수 있음
            summary: data.aiAnalysisSummary || data.aiSummary || "",
            suggestions: data.aiSolution
              ? [data.aiSolution]
              : ["유사 상표가 존재하므로 로고 디자인 수정을 권장합니다."],
            createdAt: new Date().toISOString(),
          })
        },
        onError: () => alert("상세 분석 중 오류가 발생했습니다."),
      }
    )
  }

  const handleSaveResult = () => {
    if (!user || !reportData) return

    if (
      currentBrandId === null ||
      currentBrandId === undefined ||
      currentBrandId === 0
    ) {
      toast.error("먼저 '내 브랜드 등록하기'로 브랜드를 만들어주세요")
      return
    }

    {
      // brandId/logoPath는 혹시 빠졌을 수 있으니 한번 더 안전 주입
      const payloadToSave = {
        ...analysisPayload,
        brandId: currentBrandId,
        logoPath: analysisPayload.logoPath || myLogoPath || "",
      }

      saveFinal(payloadToSave, {
        onError: () => alert("저장 중 오류가 발생했습니다."),
      })
    }
  }

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="group p-5 hover:border-slate-300 transition-all duration-300 hover:shadow-md overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border overflow-hidden">
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
                <h4 className="text-base font-bold text-slate-900">
                  {trademark.trademark_name}
                </h4>
                <span className="text-xs font-bold text-indigo-600">
                  {trademark.combinedSimilarity.toFixed(1)}% 일치
                </span>
              </div>

              <Button
                variant={reportData ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5"
                onClick={handleDetailAnalysis}
                disabled={isAnalyzing}
              >
                <Sparkles
                  className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
                />
                {isAnalyzing
                  ? "분석 중..."
                  : reportData
                    ? "결과 접기"
                    : "AI 정밀 진단"}
              </Button>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-400">출원인:</span>{" "}
              {trademark.applicant}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {reportData && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 20 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <BrandAIReportCard report={reportData} />

              <div className="flex justify-end pt-4 border-t mt-4 border-slate-100">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
                  onClick={handleSaveResult}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    "저장 중..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      분석 리포트 저장하기
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
