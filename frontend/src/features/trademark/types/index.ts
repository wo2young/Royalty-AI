export interface Trademark {
  patentId: number
  applicationNumber: string
  trademarkName: string
  imageUrl: string
  applicant: string
  category: string
  applicationDate: string
  registeredDate: string | null
  bookmarked: boolean
}

export interface GetTrademarksParams {
  page: number
  query: string
  category: string
}

export interface GetTrademarksResponse {
  totalCount: number
  currentPage: number
  list: Trademark[]
}
