import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { brandApi } from "./brand.api"
import { brandKeys } from "./brand.keys"
import { useNavigate } from "react-router-dom"

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
    enabled: !!brandId,
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
      navigate("/mypage/brand") // 삭제 후 목록으로 이동
    },
  })
}
