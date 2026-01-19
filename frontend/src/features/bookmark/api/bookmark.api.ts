import type {
  BookmarkedTrademark,
  BookmarksResponse,
  BookmarkToggleResponse,
} from "../types"

// 목데이터 사용
const MOCK_DATA: BookmarkedTrademark[] = [
  {
    patentId: "1",
    name: "브랜드명 1",
    code: "출원번호 #0001",
    category: "IT",
    date: "2026.01.15",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    patentId: "2",
    name: "브랜드명 2",
    code: "특허번호 #0002",
    category: "COMMERCE",
    date: "2026.01.14",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: false,
  },
  {
    patentId: "3",
    name: "브랜드명 3",
    code: "특허번호 #0003",
    category: "FOOD",
    date: "2026.01.13",
    isBookmarked: true,
  },
  {
    patentId: "4",
    name: "브랜드명 4",
    code: "특허번호 #0004",
    category: "CONTENT",
    date: "2026.01.12",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    patentId: "5",
    name: "브랜드명 5",
    code: "특허번호 #0005",
    category: "PET",
    date: "2026.01.11",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: false,
  },
  {
    patentId: "6",
    name: "브랜드명 6",
    code: "특허번호 #0006",
    category: "MEDICAL",
    date: "2026.01.10",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: false,
  },
  {
    patentId: "7",
    name: "브랜드명 7",
    code: "특허번호 #0007",
    category: "FINANCE",
    date: "2026.01.09",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    patentId: "8",
    name: "브랜드명 8",
    code: "특허번호 #0008",
    category: "MANUFACTURING",
    date: "2026.01.08",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: false,
  },
  {
    patentId: "9",
    name: "브랜드명 9",
    code: "특허번호 #0009",
    category: "IT",
    date: "2026.01.07",
    image:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    isBookmarked: true,
  },
  {
    patentId: "10",
    name: "브랜드명 10",
    code: "특허번호 #0010",
    category: "COMMERCE",
    date: "2026.01.06",
    image:
      "https://cdn.pixabay.com/photo/2013/11/26/11/27/niagara-falls-218591_1280.jpg",
    isBookmarked: true,
  },
  {
    patentId: "11",
    name: "브랜드명 11",
    code: "특허번호 #0011",
    category: "FOOD",
    date: "2026.01.05",
    image:
      "https://cdn.pixabay.com/photo/2019/03/04/14/35/sydney-4034244_1280.jpg",
    isBookmarked: true,
  },
  {
    patentId: "12",
    name: "브랜드명 12",
    code: "특허번호 #0012",
    category: "IT",
    date: "2026.01.04",
    isBookmarked: true,
  },
]

export const bookmarkApi = {
  // GET /mypage/bookmark
  fetchBookmarks: async (): Promise<BookmarksResponse> => {
    // 실제 서버 연동 시:
    // const { data } = await axiosInstance.get<BookmarksResponse>("/mypage/bookmark");
    // return data;

    return new Promise((resolve) => {
      setTimeout(
        () => resolve({ bookmarks: MOCK_DATA, total: MOCK_DATA.length }),
        500
      )
    })
  },

  // POST /trademark/{id}/bookmark
  addBookmark: async (patentId: string): Promise<BookmarkToggleResponse> => {
    // 실제 서버 연동 시:
    // const { data } = await axiosInstance.post<BookmarkToggleResponse>(`/trademark/${id}/bookmark`);
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => resolve({ isBookmarked: true }), 300)
      console.log("북마크 추가")
    })
  },

  // DELETE /trademark/{id}/bookmark
  removeBookmark: async (patentId: string): Promise<BookmarkToggleResponse> => {
    // 실제 서버 연동 시:
    // const { data } = await axiosInstance.delete<BookmarkToggleResponse>(`/trademark/${id}/bookmark`);
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => resolve({ isBookmarked: false }), 300)
      console.log("북마크 해제")
    })
  },
}
