<<<<<<< HEAD
// trademark.zip/trademark/api/trademark.api.ts

import type { Trademark, TrademarkDetail } from "../lib/trademark-data"

// ✅ 백엔드 서버 주소 (로컬 기준)
const BASE_URL = "http://localhost:8080/trademark"

=======
// trademark.api.ts

// 👇 이제 빨간 줄이 사라질 겁니다!
import { MOCK_TRADEMARKS } from "../constants/mock"
import type { Trademark, TrademarkDetail } from "../lib/trademark-data"

>>>>>>> d665537d5bed2ec8d133052f1d4db78a27085065
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

<<<<<<< HEAD
// ✅ 공통 헤더 생성 함수 (JWT 토큰 자동 포함)
const getHeaders = () => {
 const token = localStorage.getItem("accessToken")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const trademarkApi = {
  // 1. 목록 조회 (GET)
=======
export const trademarkApi = {
>>>>>>> d665537d5bed2ec8d133052f1d4db78a27085065
  getTrademarks: async ({
    page,
    query,
    category,
  }: GetTrademarksParams): Promise<GetTrademarksResponse> => {
<<<<<<< HEAD
    
    // URL 파라미터 생성
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("size", "10") // 한 페이지당 10개
    
    // 프론트엔드 변수(query) -> 백엔드 변수(keyword) 매핑
    if (query) params.append("keyword", query)
    
    // 카테고리 필터 ("전체 카테고리"가 아닐 때만 보냄)
    if (category && category !== "전체 카테고리") {
        params.append("category", category)
    }

    // 실제 API 호출
    const response = await fetch(`${BASE_URL}/list?${params.toString()}`, {
      method: "GET",
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("데이터를 불러오는데 실패했습니다.")
    }

    return response.json()
  },

  // 2. 상세 조회 (GET)
  getTrademarkDetail: async (id: number): Promise<TrademarkDetail> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error("상세 정보를 불러오는데 실패했습니다.")
    }

    return response.json()
  },

  // 3. 북마크 추가 (POST)
  addBookmark: async (patentId: number): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/bookmark/${patentId}`, {
      method: "POST",
      headers: getHeaders(),
    })

    if (!response.ok) throw new Error("북마크 추가 실패")
    return response.json()
  },

  // 4. 북마크 해제 (DELETE)
  removeBookmark: async (patentId: number): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/bookmark/${patentId}`, {
      method: "DELETE",
      headers: getHeaders(),
    })

    if (!response.ok) throw new Error("북마크 해제 실패")
    return response.json()
=======
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
>>>>>>> d665537d5bed2ec8d133052f1d4db78a27085065
  }
}