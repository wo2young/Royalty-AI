import type { BookmarkedTrademark, BookmarkToggleResponse } from "../types"

// 목데이터 사용
const MOCK_DATA: BookmarkedTrademark[] = [
  {
    bookmarkId: 1,
    patentId: 1189120,
    trademarkName: "브랜드명 1",
    applicant: "삼성전자",
    code: 12345678,
    category: "IT",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 2,
    patentId: 1189121,
    trademarkName: "브랜드명 2",
    applicant: "삼성전자",
    code: 12345678,
    category: "COMMERCE",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 3,
    patentId: 1189122,
    trademarkName: "브랜드명 3",
    applicant: "삼성전자",
    code: 12345678,
    category: "FOOD",
    createdAt: "2026-01-21T06:25:45",
    isBookmarked: true,
  },
  {
    bookmarkId: 4,
    patentId: 1189123,
    trademarkName: "브랜드명 4",
    applicant: "삼성전자",
    code: 12345678,
    category: "CONTENT",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 5,
    patentId: 1189124,
    trademarkName: "브랜드명 5",
    applicant: "삼성전자",
    code: 12345678,
    category: "PET",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 6,
    patentId: 1189125,
    trademarkName: "브랜드명 6",
    applicant: "삼성전자",
    code: 12345678,
    category: "MEDICAL",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 7,
    patentId: 1189126,
    trademarkName: "브랜드명 7",
    applicant: "삼성전자",
    code: 12345678,
    category: "FINANCE",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 8,
    patentId: 1189127,
    trademarkName: "브랜드명 8",
    applicant: "삼성전자",
    code: 12345678,
    category: "MANUFACTURING",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 9,
    patentId: 1189128,
    trademarkName: "브랜드명 9",
    applicant: "삼성전자",
    code: 12345678,
    category: "IT",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 10,
    patentId: 1189129,
    trademarkName: "브랜드명 10",
    applicant: "삼성전자",
    code: 12345678,
    category: "COMMERCE",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2013/11/26/11/27/niagara-falls-218591_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 11,
    patentId: 1189130,
    trademarkName: "브랜드명 11",
    applicant: "삼성전자",
    code: 12345678,
    category: "FOOD",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2019/03/04/14/35/sydney-4034244_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 12,
    patentId: 1189131,
    trademarkName: "브랜드명 12",
    applicant: "삼성전자",
    code: 12345678,
    category: "IT",
    createdAt: "2026-01-21T06:25:45",
    isBookmarked: true,
  },
  {
    bookmarkId: 13,
    patentId: 1189132,
    trademarkName: "브랜드명 13",
    applicant: "삼성전자",
    code: 12345678,
    category: "FOOD",
    createdAt: "2026-01-21T06:25:45",
    imageUrl:
      "https://cdn.pixabay.com/photo/2019/03/04/14/35/sydney-4034244_1280.jpg",
    isBookmarked: true,
  },
  {
    bookmarkId: 14,
    patentId: 1189133,
    trademarkName: "브랜드명 14",
    applicant: "삼성전자",
    code: 12345678,
    category: "IT",
    createdAt: "2026-01-21T06:25:45",
    isBookmarked: true,
  },
]

export const bookmarkApi = {
  // GET /mypage/bookmark
  fetchBookmarks: async (): Promise<BookmarkedTrademark[]> => {
    // 실제 서버 연동 시:
    // const { data } = await axiosInstance.get<BookmarksResponse>("/mypage/bookmark");
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_DATA), 500)
    })
  },

  // POST /trademark/bookmark/{patentId}
  addBookmark: async (patentId: string): Promise<BookmarkToggleResponse> => {
    // 실제 서버 연동 시:
    // const { data } = await axiosInstance.post<BookmarkToggleResponse>(`/trademark/bookmark/{patentId}`);
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => resolve({ isBookmarked: true }), 300)
      console.log("북마크 추가")
    })
  },

  // DELETE /trademark/bookmark/{patentId}
  removeBookmark: async (patentId: string): Promise<BookmarkToggleResponse> => {
    // 실제 서버 연동 시:
    // const { data } = await axiosInstance.delete<BookmarkToggleResponse>(`/trademark/bookmark/{patentId}`);
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => resolve({ isBookmarked: false }), 300)
      console.log("북마크 해제")
    })
  },
}
