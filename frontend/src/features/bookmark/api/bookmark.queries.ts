import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bookmarkApi } from "./bookmark.api"
import { bookmarkKeys } from "./bookmark.keys"

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
      return isBookmarked
        ? bookmarkApi.removeBookmark(id)
        : bookmarkApi.addBookmark(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
      queryClient.invalidateQueries({
        queryKey: ["trademarks"],
        exact: false,
      })

      console.log("DB 반영 성공 및 화면 갱신 완료")
    },
    onError: (error) => {
      console.error("북마크 처리 중 오류 발생:", error)
      alert("북마크 처리에 실패했습니다.")
    },
  })
}
