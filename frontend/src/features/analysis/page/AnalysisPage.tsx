import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/lib/utils"
import { MyBrandSelector } from "../components/AnalysisBrandSelector"
import { AnalysisResults } from "../components/AnalysisResult"
import AnalysisGeneralSelector from "../components/AnalysisGeneralSelector"

const TABS = [
  { id: "both", label: "종합 분석" },
  { id: "mybrand", label: "나의 브랜드" },
]

export default function TrademarkAnalysisPage() {
  const [activeTab, setActiveTab] = useState("both")
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalyzed(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-6 py-8 md:py-12 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-balance text-4xl md:text-5xl font-bold tracking-tight mb-3">
            상표 분석
          </h1>
          <p className="text-lg text-muted-foreground">
            상표명, 로고 또는 둘 다 입력하여 유사 상표를 분석합니다
          </p>
        </div>

        <Card className="mb-10 shadow-sm overflow-hidden">
          <div className="p-4 md:px-8">
            {/* 탭 영역 */}
            <div className="relative flex w-full p-1 bg-secondary/60 rounded-xl mb-8">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-20">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 컨텐츠 애니메이션 */}
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
                    onAnalyze={handleAnalyze}
                    analyzing={analyzing}
                    analyzed={analyzed}
                  />
                ) : (
                  <MyBrandSelector
                    onAnalyze={handleAnalyze}
                    analyzing={analyzing}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>

        {analyzed && <AnalysisResults />}
      </main>
    </div>
  )
}
