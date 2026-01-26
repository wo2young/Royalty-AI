// trademark-data.ts

export interface Trademark {
  patentId: number
  trademarkName: string
  applicationNumber: string
  status: string
  applicantName: string
  isBookmarked: boolean
}

// 👇 이 부분이 꼭 있어야 mock.ts에서 에러가 안 납니다!
export interface TrademarkDetail extends Trademark {
  applicationDate: string
  agentName: string
  viennaCode: string
  category?: string
}

export const categories = ["전체 카테고리", "IT", "바이오", "커머스", "식품"]