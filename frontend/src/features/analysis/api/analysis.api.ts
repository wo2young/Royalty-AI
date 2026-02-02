// analysis.api.ts
import axios from "axios" // [필수] 순정 axios 임포트
import axiosInstance from "@/shared/api/axios" // 기존 인스턴스
import type { Analysis, AnalysisAIResult, AnalysisResult, SaveAnalysisRequest } from "../types"

type SaveMyBrandBasicRequest = {
  brandName: string
  category: string
  logoFile: File | null
  logoUrl?: string
  brandId?: number
  aiSummary?: string
}

export const analysisApi = {
  // 1. 유사 상표 검색 (/run)
  runAnalysis: async (data: Analysis): Promise<AnalysisResult[]> => {
    const formData = new FormData()
    if (data.brandName) formData.append("brandName", data.brandName)
    // 백엔드가 category를 안 쓰더라도, 기존 UI 유지 차원에서 그대로 전송
    formData.append("category", data.category || "ALL")
    if (data.logoFile) formData.append("logoFile", data.logoFile)
    if (data.logoUrl) formData.append("logoUrl", data.logoUrl)

    const token = localStorage.getItem("accessToken")
    const response = await axios.post("http://localhost:8080/api/analysis/run", formData, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
    return response.data
  },

  // 2. AI 상세분석 (분석-only: DB 저장 X) (/analyze)
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
      {
        ...selectedTrademark,
        // 백엔드 DTO에서 @JsonProperty("id")로 patentId를 받으므로 id 유지
        id: (selectedTrademark as any).id,
      },
      { timeout: 120000 }
    )
    return response.data
  },

  // 3. 내 브랜드 기본 저장 (/save-basic) → brandId 반환
  saveMyBrand: async (data: SaveMyBrandBasicRequest) => {
    const formData = new FormData()

    const requestData = {
      brandName: data.brandName,
      category: data.category,
      brandId: data.brandId ?? 0, // 신규 등록 시 0
      logoPath: data.logoUrl || "", // URL이면 그대로, 파일이면 백엔드에서 S3 업로드 후 저장
      aiSummary: data.aiSummary || "", // (선택) 브랜드 한줄 소개
    }

    formData.append("requestDto", new Blob([JSON.stringify(requestData)], { type: "application/json" }))
    if (data.logoFile) formData.append("logoFile", data.logoFile)

    const token = localStorage.getItem("accessToken")
    const response = await axios.post("http://localhost:8080/api/analysis/save-basic", formData, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })

    return response.data
  },

  // 4. 최종 저장 (/save)
  saveFinalAnalysis: async (data: SaveAnalysisRequest) => {
    return (await axiosInstance.post("/api/analysis/save", data)).data
  },
}
