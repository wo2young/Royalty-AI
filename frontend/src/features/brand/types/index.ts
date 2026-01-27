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

/* 변천사 차트 데이터 */
export interface HistoryData {
  historyId: number
  version: string
  imageSimilarity: number
  textSimilarity: number
  createdAt: string
}

/* 브랜드 AI 분석 */
export interface BrandReport {
  reportId: number
  title: string
  summary: string
  riskScore: number // 0 ~ 100
  suggestions: string[]
  createdAt: string
}

interface MultilingualText {
  kr: string
  en: string
}

/* 다국어 리스트 */
interface MultilingualList {
  kr: string[]
  en: string[]
}

/* 브랜드 BI 핵심 데이터 (identityPayload)*/
export interface BrandIdentityPayload {
  core: MultilingualText
  language: MultilingualText
  brandKeywords: MultilingualList
  copyExamples: MultilingualList
}

/* BI 전체 데이터 */
export interface BrandBIData {
  brandId: number
  brandName: string
  identityPayload: BrandIdentityPayload
  lastBrandName: string
  lastLogoId: number
  logoId: number
  logoImagePath: string | null
}

/* 브랜드 상세 */
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
  logoImage: z.any().optional(), // 파일 검증은 필요에 따라 세밀하게 조절 가능
})

export type BrandFormValues = z.infer<typeof brandFormSchema>
