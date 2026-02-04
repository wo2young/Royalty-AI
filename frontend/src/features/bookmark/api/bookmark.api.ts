import axiosInstance from "@/shared/api/axios"
import type { BookmarkedTrademark, BookmarkToggleResponse } from "../types"

export const bookmarkApi = {
  // GET /mypage/bookmark (북마크 목록 조회)
  fetchBookmarks: async (): Promise<BookmarkedTrademark[]> => {
    const { data } =
      await axiosInstance.get<BookmarkedTrademark[]>("/mypage/bookmark")
    return data
  },

  // POST /trademark/bookmark/{patentId} (북마크 추가)
  addBookmark: async (patentId: string): Promise<BookmarkToggleResponse> => {
    const { data } = await axiosInstance.post(`/trademark/bookmark/${patentId}`)
    return data
  },

  // DELETE /trademark/bookmark/{patentId} (북마크 해제)
  removeBookmark: async (patentId: string): Promise<BookmarkToggleResponse> => {
    const { data } = await axiosInstance.delete(
      `/trademark/bookmark/${patentId}`
    )
    return data
  },
}
