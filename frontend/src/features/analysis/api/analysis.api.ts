import axios from "axios"
import axiosInstance from "@/shared/api/axios"
import type {
  Analysis,
  AnalysisResult,
  SaveAnalysisRequest,
  AnalysisAIResponse,
} from "../types"
import { getCoreClassesById } from "@/shared/components/search-bar/constants"

export interface SaveMyBrandBasicRequest {
  brandName: string
  category: string
  logoFile: File | null
  logoUrl?: string
  brandId?: number
  aiSummary?: string
}

export interface AnalyzeDetailRequest extends AnalysisResult {
  brandName: string
  logoPath: string
  brandId: number
}

const BASE_URL = "http://localhost:8080"

export const analysisApi = {
  // 유사 상표 검색
  runAnalysis: async (data: Analysis): Promise<AnalysisResult[]> => {
    const formData = new FormData()
    formData.append("brandName", data.brandName)
    const coreClasses = getCoreClassesById(data.category)

    if (data.category === "기타") {
      formData.append("isOthers", "true")
    } else {
      formData.append("coreClasses", JSON.stringify(coreClasses))
    }

    if (data.logoFile) formData.append("logoFile", data.logoFile)

    const token = localStorage.getItem("accessToken")
    const response = await axios.post(
      `${BASE_URL}/api/analysis/run`,
      formData,
      {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }
    )
    return response.data
  },

  // AI 상세분석
  analyzeDetail: async (
    data: AnalyzeDetailRequest
  ): Promise<AnalysisAIResponse> => {
    const { brandName, logoPath, brandId, ...selectedTrademark } = data

    const response = await axiosInstance.post(
      `/api/analysis/analyze`,
      {
        ...selectedTrademark,
        id: selectedTrademark.id, // AnalysisResult에 id가 있으므로 바로 접근 가능
      },
      {
        params: { brandName, logoPath, brandId }, // URL 템플릿 리터럴 대신 params 객체 사용 (가독성)
        timeout: 120000,
      }
    )
    return response.data
  },

  // 내 브랜드 기본 저장
  saveMyBrand: async (
    data: SaveMyBrandBasicRequest
  ): Promise<{ brandId: number }> => {
    const formData = new FormData()
    const requestData = {
      brandName: data.brandName,
      category: data.category,
      brandId: data.brandId ?? 0,
      logoPath: data.logoUrl || "",
      aiSummary: data.aiSummary || "",
    }

    formData.append(
      "requestDto",
      new Blob([JSON.stringify(requestData)], { type: "application/json" })
    )
    if (data.logoFile) formData.append("logoFile", data.logoFile)

    const token = localStorage.getItem("accessToken")
    const response = await axios.post(
      `${BASE_URL}/api/analysis/save-basic`,
      formData,
      {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }
    )
    return response.data
  },

  // 최종 저장
  saveFinalAnalysis: async (data: SaveAnalysisRequest) => {
    const response = await axiosInstance.post("/api/analysis/save", data)
    return response.data
  },
}
