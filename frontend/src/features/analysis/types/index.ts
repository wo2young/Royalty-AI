export interface Analysis {
  brandName?: string
  logoFile?: File | null
  logoUrl?: string
  category: string
  brandId?: number | null
}

export interface AnalysisResult {
  id: number
  trademark_name: string
  brandId: number
  applicant: string
  category: string
  imageUrl: string
  textSimilarity: number
  imageSimilarity: number
  soundSimilarity: number
  combinedSimilarity: number
  riskLevel: string
  aiAnalysisSummary: string
  aiSummary: string
}

export interface AnalysisAIResult {
  id: number
  trademark_name: string
  applicant: string
  category: string
  combinedSimilarity: number
}

// 기본 저장 (application/x-www-form-urlencoded)
export interface SaveBasicRequest {
  logoPath: string
  brandId: number
  patentId: number
  searchedBrandName: string
  aiSummary: string
}

//  상세 분석 저장 (JSON Body)
export interface SaveAnalysisRequest {
  brandId: number
  patentId: number
  trademarkName: string // camelCase (에러 메시지에 필요하다고 명시됨)
  brandName: string
  logoPath: string
  imageUrl: string
  applicant: string
  category: string

  // 누락되었다고 나온 유사도 필드들 (float 대응)
  textSimilarity: number
  imageSimilarity: number
  soundSimilarity: number
  combinedSimilarity: number

  riskLevel: string
  aiAnalysisSummary: string
  aiDetailedReport: string
  aiSolution: string[]
  analysisDetail: string
  aiSummary: string
}