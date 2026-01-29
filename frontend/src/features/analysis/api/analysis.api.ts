import axiosInstance from "@/shared/api/axios"
import type { Analysis, AnalysisAIResult, AnalysisResult } from "../types"

export const analysisApi = {
  // 상표 분석
  runAnalysis: async (data: Analysis): Promise<AnalysisResult[]> => {
    const formData = new FormData()
    if (data.brandName) formData.append("brandName", data.brandName)
    formData.append("category", data.category)
    if (data.logoFile) formData.append("logoFile", data.logoFile)
    if (data.brandId) formData.append("brandId", String(data.brandId))
    if (data.logoUrl) formData.append("logoUrl", data.logoUrl)

    const response = await axiosInstance.post("/api/analysis/run", formData, {
      headers: { "Content-Type": "multipart/form-data" }, // 파일 포함 시 필수
    })
    return response.data
  },

  // AI 상세분석
  analyzeDetail: async (
    data: AnalysisAIResult & {
      brandName: string
      logoPath: string
      brandId: number
    }
  ) => {
    const { brandName, logoPath, brandId, ...selectedTrademark } = data
    const response = await axiosInstance.post(
      `/api/analysis/analyze?brandName=${encodeURIComponent(brandName)}&logoPath=${encodeURIComponent(logoPath)}&brandId=${brandId}`,
      selectedTrademark
    )
    return response.data
  },
}
