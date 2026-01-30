// trademark-data.ts

export interface Trademark {
  patentId: number
  trademarkName: string
  applicationNumber: string
<<<<<<< HEAD
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
=======
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
>>>>>>> d665537d5bed2ec8d133052f1d4db78a27085065
