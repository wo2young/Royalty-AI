import { useMutation } from "@tanstack/react-query"
import { analysisApi } from "./analysis.api"
import type { Analysis, AnalysisAIResult } from "../types"

export const useAnalysisQueries = {
  // 유사 상표 검색 실행
  useRunAnalysis: () => {
    return useMutation({
      mutationFn: (data: Analysis) => analysisApi.runAnalysis(data),
    })
  },

  // AI 상세 분석 요청
  useAnalyzeDetail: () => {
    return useMutation({
      mutationFn: (
        data: AnalysisAIResult & {
          brandName: string
          logoPath: string
          brandId: number
        }
      ) => analysisApi.analyzeDetail(data),
    })
  },
}
