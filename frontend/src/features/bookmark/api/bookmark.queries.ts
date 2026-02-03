import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bookmarkApi } from "./bookmark.api"
import { bookmarkKeys } from "./bookmark.keys"
import { trademarkKeys } from "@/features/trademark/api/trademark.keys"
import { toast } from "sonner"

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
        queryKey: trademarkKeys.all,
        exact: false,
      })
    },
    onError: (error) => {
      console.error("북마크 처리 중 오류 발생:", error)
      toast.error("북마크 처리에 실패했습니다. 다시 시도해주세요.")
    },
  })
}
