import { AnimatePresence, motion, type Variants } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, Sparkles, Save } from "lucide-react"
import type { AnalysisResult } from "../types"
import { useAnalysisQueries } from "../api/analysis.queries"
import { BrandAIReportCard } from "@/features/brands/components/brand-detail/BrandAIReportCard"
import { useState } from "react"
import type { BrandReport } from "@/features/brands/types"
import { useAuth } from "@/shared/auth/AuthContext"
import { useFormContext } from "react-hook-form"
import type { AnalysisFormValues } from "../page/AnalysisPage" 

// ... 애니메이션 설정 생략 (containerVariants, itemVariants)

export function AnalysisResults({ results }: AnalysisResultsProps) {
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
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
  const { user } = useAuth()
  
  // 1. 제네릭 명시로 brandId 필드 인식]
  const { watch } = useFormContext<AnalysisFormValues>()
  const currentBrandId = watch("brandId") 

  const { mutate: analyzeDetail, isPending: isAnalyzing } = useAnalysisQueries.useAnalyzeDetail()
  const { mutate: saveBrand, isPending: isSaving } = useAnalysisQueries.useSaveMyBrand()

  const handleDetailAnalysis = () => {
    if (reportData) { setReportData(null); return; }
    if (!user) { alert("분석을 위해 로그인이 필요합니다."); return; }

    analyzeDetail(
      {
        ...trademark,
        brandName: trademark.trademark_name, 
        logoPath: trademark.imageUrl || "", 
        // 2. null/undefined일 경우 0으로 대체하여 타입 에러 방지]
        brandId: currentBrandId ?? 0, 
      },
      {
        onSuccess: (data) => {
          setReportData({
            reportId: trademark.id,
            title: `${trademark.trademark_name} 상세 분석`,
            riskScore: trademark.combinedSimilarity, 
            summary: data.aiAnalysisSummary,
            suggestions: data.aiSolution ? [data.aiSolution] : ["유사 상표가 존재하므로 로고 디자인 수정을 권장합니다."],
            createdAt: new Date().toISOString(),
          })
        },
        onError: () => alert("상세 분석 중 오류가 발생했습니다.")
      }
    )
  }

  const handleSaveResult = () => {
    if (!user || !reportData) return

    // 3. 엄격한 null 체크: currentBrandId가 반드시 존재해야 함]
    if (currentBrandId === null || currentBrandId === undefined) {
      alert("먼저 '내 브랜드 등록하기'를 통해 브랜드를 생성해야 리포트 저장이 가능합니다.");
      return;
    }

    if (confirm(`'${trademark.trademark_name}' 분석 리포트를 저장하시겠습니까?`)) {
        saveBrand({
            // 4. SaveAnalysisRequest의 필수 number 타입 충족]
            brandId: currentBrandId, 
            patentId: trademark.id,
            trademarkName: trademark.trademark_name, // camelCase 대응
            brandName: trademark.trademark_name,
            logoPath: trademark.imageUrl || "",
            imageUrl: trademark.imageUrl || "",
            applicant: trademark.applicant,
            category: trademark.category || "OTHERS",
            
            // 5. 누락되었던 유사도 필드들 (float 대응)
            textSimilarity: trademark.textSimilarity,
            imageSimilarity: trademark.imageSimilarity,
            soundSimilarity: trademark.soundSimilarity,
            combinedSimilarity: trademark.combinedSimilarity,

            aiSummary: reportData.summary,
            aiDetailedReport: JSON.stringify(reportData),
            aiSolution: [reportData.suggestions[0]], // string[] 대응
            analysisDetail: JSON.stringify(reportData),
            riskLevel: trademark.riskLevel || "미정",
            aiAnalysisSummary: reportData.summary
        }, {
            onSuccess: () => alert("리포트가 히스토리에 저장되었습니다."),
            onError: () => alert("저장 중 오류가 발생했습니다.")
        })
    }
  }

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="group p-5 hover:border-slate-300 transition-all duration-300 hover:shadow-md overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border overflow-hidden">
            {trademark.imageUrl ? (
              <img src={trademark.imageUrl} alt={trademark.trademark_name} className="object-cover w-full h-full" />
            ) : (
              <Building2 className="h-7 w-7 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <h4 className="text-base font-bold text-slate-900">{trademark.trademark_name}</h4>
                <span className="text-xs font-bold text-indigo-600">{trademark.combinedSimilarity.toFixed(1)}% 일치</span>
              </div>
              <Button
                variant={reportData ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5"
                onClick={handleDetailAnalysis}
                disabled={isAnalyzing}
              >
                <Sparkles className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                {isAnalyzing ? "분석 중..." : reportData ? "결과 접기" : "AI 정밀 진단"}
              </Button>
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-400">출원인:</span> {trademark.applicant}
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
                    {isSaving ? "저장 중..." : <><Save className="h-4 w-4" />이 분석 리포트 저장하기</>}
                  </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}