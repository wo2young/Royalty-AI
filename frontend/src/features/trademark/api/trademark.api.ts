// trademark.api.ts

// 👇 이제 빨간 줄이 사라질 겁니다!
import { MOCK_TRADEMARKS } from "../constants/mock"
import type { Trademark, TrademarkDetail } from "../lib/trademark-data"

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

export const trademarkApi = {
  getTrademarks: async ({
    page,
    query,
    category,
  }: GetTrademarksParams): Promise<GetTrademarksResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_TRADEMARKS]

        if (query) {
          const lowerQuery = query.toLowerCase()
          filtered = filtered.filter(item => 
            item.trademarkName.toLowerCase().includes(lowerQuery) || 
            item.applicantName.toLowerCase().includes(lowerQuery)
          )
        }

        if (category && category !== "전체 카테고리") {
          filtered = filtered.filter(item => item.category === category)
        }

        const itemsPerPage = 10
        const totalCount = filtered.length
        const startIndex = (page - 1) * itemsPerPage
        const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage)

        resolve({
          totalCount,
          currentPage: page,
          list: paginatedList
        })
      }, 300) 
    })
  },

  getTrademarkDetail: async (id: number): Promise<TrademarkDetail> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const target = MOCK_TRADEMARKS.find((item) => item.patentId === id)
        if (target) {
          resolve({ ...target })
        } else {
          reject(new Error("상표를 찾을 수 없습니다."))
        }
      }, 300)
    })
  },

  addBookmark: async (patentId: number): Promise<{ message: string }> => {
    return new Promise((resolve) => {
      const target = MOCK_TRADEMARKS.find((item) => item.patentId === patentId)
      if (target) target.isBookmarked = true
      resolve({ message: "북마크가 추가되었습니다." })
    })
  },

  removeBookmark: async (patentId: number): Promise<{ message: string }> => {
    return new Promise((resolve) => {
      const target = MOCK_TRADEMARKS.find((item) => item.patentId === patentId)
      if (target) target.isBookmarked = false
      resolve({ message: "북마크가 해제되었습니다." })
    })
  }
}