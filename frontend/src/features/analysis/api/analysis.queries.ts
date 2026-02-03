import { useMutation } from "@tanstack/react-query"
import { analysisApi } from "./analysis.api"
import type {
  Analysis,
  SaveAnalysisRequest,
  AnalyzeDetailRequest,
  SaveMyBrandBasicRequest,
} from "../types" // 모든 타입은 types/index.ts 또는 api 파일에서 가져옵니다.
import { queryClient } from "@/shared/api/queryClient"
import { brandKeys } from "@/features/brands/api/brand.keys"
import { analysisKeys } from "./analysis.keys"
import { toast } from "sonner"

export const useAnalysisQueries = {
  // 유사 상표 검색
  useRunAnalysis: () => {
    return useMutation({
      mutationFn: (data: Analysis) => analysisApi.runAnalysis(data),
    })
  },

  // AI 상세 분석 (AnalyzeDetailRequest 타입 적용으로 any 제거)
  useAnalyzeDetail: () => {
    return useMutation({
      mutationFn: (data: AnalyzeDetailRequest) =>
        analysisApi.analyzeDetail(data),
    })
  },

  // 내 브랜드 기본 저장 (SaveMyBrandBasicRequest 타입 적용)
  useSaveMyBrand: () => {
    return useMutation({
      mutationFn: (data: SaveMyBrandBasicRequest) =>
        analysisApi.saveMyBrand(data),
      onSuccess: () => {
        // 내 브랜드 목록 캐시 갱신
        queryClient.invalidateQueries({ queryKey: brandKeys.all })
      },
    })
  },

  // 최종 분석 결과 저장
  useSaveFinal: () => {
    return useMutation({
      mutationFn: (data: SaveAnalysisRequest) =>
        analysisApi.saveFinalAnalysis(data),
      onSuccess: () => {
        // 분석 리스트 및 브랜드 정보 동기화
        queryClient.invalidateQueries({ queryKey: analysisKeys.lists() })
        queryClient.invalidateQueries({ queryKey: brandKeys.all })
        toast.success("분석 결과가 성공적으로 저장되었습니다.")
      },
    })
  },
}
