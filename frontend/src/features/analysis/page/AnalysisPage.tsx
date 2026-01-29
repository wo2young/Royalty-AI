import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/lib/utils"
import { MyBrandSelector } from "../components/AnalysisBrandSelector"
import { AnalysisResults } from "../components/AnalysisResult"
import AnalysisGeneralSelector from "../components/AnalysisGeneralSelector"
import { FormProvider, useForm } from "react-hook-form"
import { useAnalysisQueries } from "../api/analysis.queries"
import type { AnalysisResult } from "../types"

export interface AnalysisFormValues {
  brandName: string
  category: string
  logoFile: File | null
  logoUrl?: string
  brandId?: number | null
}

const TABS = [
  { id: "both", label: "종합 분석" },
  { id: "mybrand", label: "나의 브랜드" },
]

export default function TrademarkAnalysisPage() {
  const [activeTab, setActiveTab] = useState("both")
  const [analyzed, setAnalyzed] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])

  const { mutate: runAnalysis, isPending: analyzing } =
    useAnalysisQueries.useRunAnalysis()

  const methods = useForm<AnalysisFormValues>({
    defaultValues: {
      brandName: "",
      category: "ALL",
      logoFile: null,
      brandId: null,
    },
  })

  const onSubmit = (data: AnalysisFormValues) => {
    // 유효성 검사: 상호명이나 로고 파일 중 하나는 반드시 있어야 함
    if (!data.brandName.trim() && !data.logoFile && !data.brandId) {
      alert("상호명을 입력하거나 분석할 브랜드를 선택해주세요.")
      return
    }

    // API 호출 (내부적으로 FormData로 변환되어 전송됨)
    runAnalysis(data, {
      onSuccess: (response) => {
        setResults(response) // 결과 저장
        setAnalyzed(true) // 결과 화면 활성화
        console.log(data)
      },
      onError: (error) => {
        console.error("분석 실패:", error)
        alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.")
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-6 py-8 md:py-12 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-balance text-4xl md:text-5xl font-bold tracking-tight mb-3">
            상표 분석
          </h1>
          <p className="text-lg text-muted-foreground">
            유사 상표를 분석하여 등록 가능성을 확인하세요
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Card className="mb-10 shadow-sm overflow-hidden">
              <div className="p-4 md:px-8">
                {/* 탭 영역 */}
                <div className="relative flex w-full p-1 bg-secondary/60 rounded-xl mb-8">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button" // submit 방지
                      onClick={() => {
                        setActiveTab(tab.id)
                        setAnalyzed(false)
                        methods.reset() // 탭 전환 시 초기화
                      }}
                      className={cn(
                        "relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-200",
                        activeTab === tab.id
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                        />
                      )}
                      <span className="relative z-20">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "both" ? (
                      <AnalysisGeneralSelector
                        analyzing={analyzing}
                        analyzed={analyzed}
                      />
                    ) : (
                      <MyBrandSelector analyzing={analyzing} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </form>
        </FormProvider>

        {analyzed && <AnalysisResults results={results} />}
      </main>
    </div>
  )
}
