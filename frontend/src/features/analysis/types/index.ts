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
