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
  imagePath: string
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

export type RiskLevel = "낮음" | "보통" | "높음" | "매우 높음"

/* 브랜드 AI 분석 데이터*/
export interface AIAnalysisReport {
  aiAnalysisSummary: string // 전체 분석 요약 정보
  aiDetailedReport: string // 상세 분석 리포트 내용
  aiSolution: string // 충돌 위험 최소화를 위한 솔루션
  riskLevel: RiskLevel // 상표 충돌 위험도 (낮음, 보통 등)
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
  aiSummary: string
  analysis_detail: string
  parsedDetail?: BrandReport
}

export interface BrandReport {
  title: string
  riskScore: number
  summary: string
  suggestions: string[]
  createdAt: string
  detailedReport: string
  riskLevel: RiskLevel
}

export interface AnalysisHistoryResponse {
  history_id: string
  brand_id: string
  version: string | null
  image_path: string
  image_similarity: number
  text_similarity: number
  created_at: string
  ai_summary: string
  analysis_detail: string
  patent_id: string
}

export const brandFormSchema = z.object({
  brandName: z.string().min(1, "브랜드명을 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  description: z.string().optional(),
  logoImage: z.any().optional(), // 파일 검증은 필요에 따라 세밀하게 조절 가능
})

export type BrandFormValues = z.infer<typeof brandFormSchema>
