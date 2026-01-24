export interface Brand {
  brandId: number
  brandName: string
  logoPath?: string
  category: string
  createdAt: string
  description?: string
  notificationEnabled: boolean
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
