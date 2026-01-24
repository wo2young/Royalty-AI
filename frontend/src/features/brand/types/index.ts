export interface Brand {
  id: number
  name: string
  image_path?: string
  category: string
  created_at: string
  description?: string
}

export interface ChartData {
  date: string
  imageSimilarity: number
  textSimilarity: number
}

export interface BrandReport {
  reportId: number
  title: string
  summary: string
  riskScore: number // 0 ~ 100
  suggestions: string[]
  createdAt: string
}
