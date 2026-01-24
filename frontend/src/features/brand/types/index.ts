export interface Brand {
  id: number
  name: string
  image_path?: string
  category: string
  created_at: string
  description?: string
}

export interface HistoryData {
  historyId: number
  version: string
  imageSimilarity: number
  textSimilarity: number
  createdAt: string
}

export interface BrandReport {
  reportId: number
  title: string
  summary: string
  riskScore: number // 0 ~ 100
  suggestions: string[]
  createdAt: string
}

export interface BrandDetail {
  brandId: number
  brandName: string
  category: string
  description: string
  currentLogoPath: string
  notificationEnabled: boolean
  createdAt: string
  historyList: HistoryData[]
  reportList: BrandReport[]
}
