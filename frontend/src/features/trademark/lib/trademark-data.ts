// trademark-data.ts

export interface Trademark {
  patentId: number
  trademarkName: string
  applicationNumber: string
  applicant: string     
  isBookmarked: boolean
  imageUrl?: string     
}

export interface TrademarkDetail extends Trademark {
  applicationDate: string
  category?: string
  registeredDate?: string

  //  백엔드에서 아직 안 주는 값들은 에러 방지를 위해 '?'(선택) 처리
  agentName?: string
  viennaCode?: string
}

export const categories = ["전체 카테고리", "09", "35", "42"]