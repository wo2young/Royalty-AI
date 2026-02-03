// 유사 상표 검색 폼 데이터 (API 요청용)
export interface Analysis {
  brandName: string
  category: string
  logoFile: File | null
  logoUrl?: string
  brandId?: number | null
}

// 검색 결과 목록 요소
export interface AnalysisResult {
  id: number
  trademark_name: string
  name: string
  applicant: string
  category: string
  imageUrl: string
  riskLevel: "안전" | "주의" | "위험"
  combinedSimilarity: number
  imageSimilarity: number
  textSimilarity: number
  soundSimilarity: number
  aiAnalysisSummary: string | null
  aiDetailedReport: string | null
  aiSolution: string | null
  aiSummary: string | null
}

// AI 상세 분석 요청 (AnalysisResult 확장)
export interface AnalyzeDetailRequest extends AnalysisResult {
  brandName: string
  logoPath: string
  brandId: number
}

// 내 브랜드 기본 저장 요청 (회원가입/수정 시)
export interface SaveMyBrandBasicRequest {
  brandName: string
  category: string
  logoFile: File | null
  logoUrl?: string
  brandId?: number
  aiSummary?: string
}

// 브랜드 저장 응답
export interface SaveBrandResponse {
  brandId?: number
  data?: {
    brandId?: number
  }
  message?: string
}

// 최종 분석 결과 저장 요청
export interface SaveAnalysisRequest {
  brandId: number
  patentId: number
  riskLevel: string
  similarityScore: number
  aiAnalysisSummary: string
  aiDetailedReport: string
  aiSolution: string
}

// AI 상세 분석 응답
export interface AnalysisAIResponse extends AnalysisResult {
  brandName: string
  analysisDetail: string
}

// UI 리포트 카드용
export interface BrandReport {
  reportId?: number
  title: string
  riskScore: number
  summary: string
  suggestions: string[]
  createdAt: string
  detailedReport?: string
}

export interface DetailAnalysisResponse {
  aiAnalysisSummary?: string
  aiSummary?: string
  aiSolution?: string
  aiDetailedReport?: string
  brandId?: number
  logoPath?: string
}
