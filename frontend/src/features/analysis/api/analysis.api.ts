// analysis.api.ts
import axios from "axios" // [필수] 순정 axios 임포트
import axiosInstance from "@/shared/api/axios" // 기존 인스턴스
import type {
  Analysis,
  AnalysisAIResult,
  AnalysisResult,
  SaveAnalysisRequest,
} from "../types"

export const analysisApi = {
  // 1. 상표 분석
  runAnalysis: async (data: Analysis): Promise<AnalysisResult[]> => {
    const formData = new FormData()
    if (data.brandName) formData.append("brandName", data.brandName)
    formData.append("category", data.category || "ALL")
    if (data.logoFile) formData.append("logoFile", data.logoFile)
    if (data.logoUrl) formData.append("logoUrl", data.logoUrl)

    const token = localStorage.getItem("accessToken");
    const response = await axios.post("http://localhost:8080/api/analysis/run", formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
    return response.data
  },

  // 2. AI 상세분석 (JSON 전송이므로 axiosInstance 사용 유지)
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
        id: selectedTrademark.id, 
      },
      { timeout: 120000 }
    )
    return response.data
  },

  // 3. 내 브랜드 저장 (JSON Blob 방식으로 최적화)
  saveMyBrand: async (data: any) => {
    const formData = new FormData();

    // 모든 텍스트 데이터를 하나의 객체로 묶어 파트(Part) 개수를 줄임
    const requestData = {
        brandName: data.brandName,
        category: data.category,
        brandId: 0,
        patentId: data.patentId || 0,
        aiSummary: data.aiSummary,
        aiDetailedReport: data.aiDetailedReport,
        aiSolution: data.aiSolution,
        riskLevel: data.riskLevel,
        analysisDetail: data.analysisDetail,
        textSimilarity: data.textSimilarity || 0,
        imageSimilarity: data.imageSimilarity || 0
    };

    // JSON 객체를 Blob 형태로 변환하여 'requestDto'라는 이름으로 추가
    formData.append(
        "requestDto", 
        new Blob([JSON.stringify(requestData)], { type: "application/json" })
    );

    // 파일은 별도로 추가
    if (data.logoFile) {
        formData.append("logoFile", data.logoFile);
    }

    const token = localStorage.getItem("accessToken");
    
    // 순정 axios 사용 (boundary 자동 생성을 위해 Content-Type 생략)
    const response = await axios.post("http://localhost:8080/api/analysis/save-basic", formData, {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        }
    });
    return response.data;
  }, // [수정] 빠졌던 쉼표와 괄호 체크

  // 4. 최종 AI 분석 결과 저장
  saveFinalAnalysis: async (data: SaveAnalysisRequest) => {
    return (await axiosInstance.post("/api/analysis/save-analysis", data)).data
  },
}; // [수정] 세미콜론 및 닫는 중괄호 추가