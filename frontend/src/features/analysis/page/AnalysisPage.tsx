"use client"

import { useState } from "react"
import { Card } from "@/shared/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"
import { MyBrandSelector } from "../components/AnalysisBrandSelector"
import { AnalysisResults } from "../components/AnalysisResult"
import AnalysisGeneralSelector from "../components/AnalysisGeneralSelector"

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
          {/* 타이틀 */}
          <h1 className="text-balance text-4xl md:text-5xl font-bold tracking-tight mb-3">
            상표 분석
          </h1>
          <p className="text-lg text-muted-foreground">
            상표명, 로고 또는 둘 다 입력하여 유사 상표를 분석합니다
          </p>
        </div>

        <Card className="mb-10 shadow-sm">
          <div className="p-4 md:px-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-secondary/60">
                <TabsTrigger value="both">종합 분석</TabsTrigger>
                <TabsTrigger value="mybrand">나의 브랜드</TabsTrigger>
              </TabsList>

              {/* 종합 분석 */}
              <TabsContent value="both" className="mt-8 space-y-6">
                <AnalysisGeneralSelector
                  onAnalyze={handleAnalyze}
                  analyzing={analyzing}
                />
              </TabsContent>

              {/* 나의 브랜드 분석 */}
              <TabsContent value="mybrand" className="mt-8">
                <MyBrandSelector
                  onAnalyze={handleAnalyze}
                  analyzing={analyzing}
                />
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* 분석 결과 */}
        {analyzed && <AnalysisResults />}
      </main>
    </div>
  )
}
