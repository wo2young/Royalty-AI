import { Card, CardContent } from "@/shared/components/ui/card"
import { Building2 } from "lucide-react"
import BookmarkButton from "./BookmarkButton"
import { useToggleBookmark } from "../api/bookmark.queries"
import type { BookmarkedTrademark } from "../types"

interface BookmarkCardProps {
  brand: BookmarkedTrademark
}

export function BookmarkCard({ brand }: BookmarkCardProps) {
  const { mutate, isPending } = useToggleBookmark()

  const isBookmarked = !!brand.bookmarked

  const handleToggle = () => {
    mutate({
      id: String(brand.patentId),
      isBookmarked: isBookmarked,
    })
  }

  return (
    <Card className="group relative hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
      <div className="absolute top-2 right-2 z-10 opacity-100 transition-opacity">
        <BookmarkButton
          isBookmarked={isBookmarked}
          onToggle={handleToggle}
          isLoading={isPending}
        />
      </div>

      {/* 북마크 카드 */}
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-xl bg-secondary border flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all overflow-hidden">
          {/* 이미지 유무에 따른 조건부 렌더링 */}
          {brand.imageUrl ? (
            <img
              src={brand.imageUrl}
              alt={brand.trademarkName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        <h3 className="font-semibold text-sm text-foreground mb-1">
          {brand.trademarkName}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{brand.code}</p>
        <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
          {brand.category}
        </span>
      </CardContent>
    </Card>
  )
}
