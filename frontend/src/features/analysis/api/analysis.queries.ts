import { useMutation } from "@tanstack/react-query"
import { analysisApi } from "./analysis.api"
import type { Analysis, AnalysisAIResult, SaveAnalysisRequest } from "../types"
import { queryClient } from "@/shared/api/queryClient"
import { brandKeys } from "@/features/brands/api/brand.keys"
import { analysisKeys } from "./analysis.keys"

export const useAnalysisQueries = {
  // 1. 유사 상표 검색
  useRunAnalysis: () => {
    return useMutation({
      mutationFn: (data: Analysis) => analysisApi.runAnalysis(data),
    })
  },

  // 2. AI 상세 분석
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

  // [수정] 3. 내 브랜드 저장 (useSaveBasic -> useSaveMyBrand)
  useSaveMyBrand: () => {
    return useMutation({
      mutationFn: (data: {
        brandName: string
        category: string
        logoFile: File | null
        patentId?: number
        aiSummary?: string
        aiDetailedReport?: string
        aiSolution?: string
        riskLevel?: string
        analysisDetail?: string
        textSimilarity?: number
        imageSimilarity?: number
      }) => analysisApi.saveMyBrand(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: brandKeys.all })
      },
    })
  },

  // 4. 최종 AI 저장
  useSaveFinal: () => {
    return useMutation({
      mutationFn: (data: SaveAnalysisRequest) =>
        analysisApi.saveFinalAnalysis(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: analysisKeys.lists() })
        queryClient.invalidateQueries({ queryKey: brandKeys.all })
        alert("분석 결과가 성공적으로 저장되었습니다.")
      },
    })
  },
}