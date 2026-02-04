import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/lib/utils"
import { MyBrandSelector } from "../components/AnalysisBrandSelector"
import { AnalysisResults } from "../components/AnalysisResult"
import AnalysisGeneralSelector from "../components/AnalysisGeneralSelector"
import { FormProvider, useForm } from "react-hook-form"
import { useAnalysisQueries } from "../api/analysis.queries"
import type { Analysis, AnalysisResult, SaveBrandResponse } from "../types"
import { useAuth } from "@/shared/auth/AuthContext"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { useLocation } from "react-router-dom"

export type AnalysisFormValues = Analysis

const TABS = [
  { id: "both", label: "종합 분석" },
  { id: "mybrand", label: "나의 브랜드" },
]

export default function TrademarkAnalysisPage() {
  const location = useLocation()

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "both"
  )
  const [analyzed, setAnalyzed] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])

  const { user } = useAuth()

  const { mutate: runAnalysis, isPending: analyzing } =
    useAnalysisQueries.useRunAnalysis()
  const { mutate: saveBrand, isPending: isCreating } =
    useAnalysisQueries.useSaveMyBrand()

  const methods = useForm<AnalysisFormValues>({
    defaultValues: {
      brandName: "",
      category: "전체",
      logoFile: null,
      brandId: null,
      logoUrl: "",
    },
  })

  const handleRegisterBrand = () => {
    if (!user) {
      alert("로그인이 필요한 기능입니다.")
      return
    }

    const brandName = methods.getValues("brandName")
    const category = methods.getValues("category")
    const logoFile = methods.getValues("logoFile")
    const logoUrl = methods.getValues("logoUrl")

    saveBrand(
      { brandName, category, logoFile, logoUrl },
      {
        onSuccess: (res: SaveBrandResponse) => {
          // 백엔드가 brandId를 반환하도록 맞춘 전제
          const returnedBrandId = res?.brandId ?? res?.data?.brandId ?? null

          if (returnedBrandId) {
            methods.setValue("brandId", returnedBrandId)
          }
          toast.success("내 브랜드로 등록되었습니다!")
        },
        onError: (error) => {
          console.error("브랜드 생성 실패:", error)
          toast.error("브랜드 등록 중 오류가 발생했습니다.")
        },
      }
    )
  }

  const onSubmit = (data: AnalysisFormValues) => {
    if (!data.brandName.trim() && !data.logoFile && !data.brandId) {
      toast.error("상호명을 입력하거나 분석할 브랜드를 선택해주세요")
      return
    }

    runAnalysis(data, {
      onSuccess: (response) => {
        setResults(response)
        setAnalyzed(true)
      },
      onError: (error) => {
        console.error("분석 실패:", error)
        toast.error("분석 중 오류가 발생했습니다. 다시 시도해주세요")
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main
        className={cn(
          "container mx-auto px-4 lg:px-6 py-8 md:py-12 transition-all duration-500",
          analyzed ? "max-w-7xl" : "max-w-5xl"
        )}
      >
        <div className="mb-10">
          <h1 className="text-balance text-3xl font-bold tracking-tight mb-3">
            상표 분석
          </h1>
          <p className="text-lg text-muted-foreground">
            유사 상표를 분석하여 등록 가능성을 확인하세요
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div
              className={cn(
                "grid gap-8 transition-all duration-300",
                analyzed ? "lg:grid-cols-2" : "grid-cols-1"
              )}
            >
              <motion.div
                layout
                className={cn(analyzed && "lg:sticky lg:top-8 h-fit")}
              >
                <Card className="shadow-sm overflow-hidden">
                  <div className="p-4 md:px-8">
                    <div className="relative flex w-full p-1 bg-secondary/60 rounded-xl mb-8">
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id)
                            setAnalyzed(false)
                            methods.reset()
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
                            onRegister={handleRegisterBrand}
                            isCreating={isCreating}
                          />
                        ) : (
                          <MyBrandSelector analyzing={analyzing} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>

              {/* 분석 결과 */}
              <AnimatePresence>
                {analyzed && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="space-y-4 translate-y-0 lg:-translate-y-12">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">
                          분석 결과 ({results.length})
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAnalyzed(false)}
                          className="text-muted-foreground"
                        >
                          결과 닫기
                        </Button>
                      </div>
                      <AnalysisResults results={results} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  )
}
