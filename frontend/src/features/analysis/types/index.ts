export interface Analysis {
  trademark_name: string
  imageUrl: string
  category: string
}

export interface AnalysisResult {
  id: number
  trademark_name: string
  brandId: number
  userId: number
  appllicant: string
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
