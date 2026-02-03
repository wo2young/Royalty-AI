import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { brandApi } from "./brand.api"
import { brandKeys } from "./brand.keys"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { BrandDetail } from "../types"

export const useBrands = () => {
  return useQuery({
    queryKey: brandKeys.lists(),
    queryFn: brandApi.fetchBrands,
  })
}

// 상세 조회
export const useBrandDetail = (brandId: number) => {
  return useQuery({
    queryKey: brandKeys.detail(brandId),
    queryFn: () => brandApi.fetchBrandById(brandId),
    select: (data: BrandDetail): BrandDetail => {
      const latest = data.historyList?.find(
        (h) => h.aiSummary || h.aiAnalysisSummary
      )

      return {
        ...data,
        parsedDetail: latest
          ? {
              title: latest.version || `${data.brandName} AI 분석`,
              riskScore: latest.textSimilarity ?? 0,
              summary: latest.aiAnalysisSummary || latest.aiSummary || "",
              suggestions: latest.aiSolution ? [latest.aiSolution] : [],
              createdAt: latest.createdAt,
              detailedReport: latest.aiDetailedReport || "",
            }
          : undefined,
      }
    },
  })
}

// 알림 토글
export const useToggleNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ brandId, enabled }: { brandId: number; enabled: boolean }) =>
      brandApi.toggleNotification(brandId, enabled),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(brandId) })
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
    },
  })
}

// 브랜드 추가
export const useCreateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (brandData: FormData) => brandApi.createBrand(brandData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      toast.success("새로운 브랜드가 등록되었습니다.")
    },
    onError: () => {
      toast.error("브랜드 등록에 실패했습니다. 다시 시도해주세요.")
    },
  })
}

// 브랜드 수정
export const useUpdateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      brandId,
      formData,
    }: {
      brandId: number
      formData: FormData
    }) => brandApi.updateBrand(brandId, formData),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(brandId) })
      toast.success("브랜드 정보가 수정되었습니다.")
    },
    onError: () => {
      toast.error("정보 수정 중 오류가 발생했습니다.")
    },
  })
}

// 브랜드 삭제
export const useDeleteBrand = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (brandId: number) => brandApi.deleteBrand(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      toast.success("브랜드가 삭제되었습니다.")
      navigate("/mypage/brand") // 삭제 후 목록으로 이동
    },
    onError: () => {
      toast.error("브랜드 삭제에 실패했습니다.")
    },
  })
}

// BI 조회
export const useBrandIdentity = (brandId: number) => {
  return useQuery({
    queryKey: brandKeys.identity(brandId),
    queryFn: () => brandApi.fetchBrandIdentity(brandId),
    enabled: !!brandId,
  })
}

// BI 분석 실행
export const useAnalyzeIdentity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (brandId: number) => brandApi.analyzeBrandIdentity(brandId),
    onSuccess: (data, brandId) => {
      queryClient.setQueryData(brandKeys.identity(brandId), data)
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(brandId) })
    },
  })
}
