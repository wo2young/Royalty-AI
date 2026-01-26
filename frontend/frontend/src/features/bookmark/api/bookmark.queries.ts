import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bookmarkApi } from "./bookmark.api"
import { bookmarkKeys } from "./bookmark.keys"
import type { AxiosError } from "axios"

// 북마크 목록 조회
export const useBookmarks = () => {
  return useQuery({
    queryKey: bookmarkKeys.lists(),
    queryFn: () => bookmarkApi.fetchBookmarks(),
  })
}

// 북마크 추가/제거 통합 뮤테이션
export const useToggleBookmark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      isBookmarked,
    }: {
      id: string
      isBookmarked: boolean
    }) => {
      // 현재 상태가 북마크된 상태라면 제거(DELETE), 아니라면 추가(POST) 호출
      return isBookmarked
        ? bookmarkApi.removeBookmark(id)
        : bookmarkApi.addBookmark(id)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
      console.log(`${data} 성공`)
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error(`${error}가 발생했습니다`)
    },
  })
}
