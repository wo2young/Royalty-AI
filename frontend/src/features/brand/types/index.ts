import * as z from "zod"

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

export const brandFormSchema = z.object({
  brandName: z.string().min(1, "브랜드명을 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  description: z.string().optional(),
  logoFile: z.any().optional(), // 파일 검증은 필요에 따라 세밀하게 조절 가능
})

export type BrandFormValues = z.infer<typeof brandFormSchema>
