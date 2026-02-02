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

  // 2. AI 상세 분석 (분석-only)
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

  // 3. 내 브랜드 기본 저장 (/save-basic) → brandId 반환
  useSaveMyBrand: () => {
    return useMutation({
      mutationFn: (data: {
        brandName: string
        category: string
        logoFile: File | null
        logoUrl?: string
        brandId?: number
        aiSummary?: string
      }) => analysisApi.saveMyBrand(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: brandKeys.all })
      },
    })
  },

  // 4. 분석 결과 저장 (/save)
  useSaveFinal: () => {
    return useMutation({
      mutationFn: (data: SaveAnalysisRequest) => analysisApi.saveFinalAnalysis(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: analysisKeys.lists() })
        queryClient.invalidateQueries({ queryKey: brandKeys.all })
        alert("분석 결과가 성공적으로 저장되었습니다.")
      },
    })
  },
}
