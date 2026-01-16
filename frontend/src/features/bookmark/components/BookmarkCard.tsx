import { Card, CardContent } from "@/shared/components/ui/card"
import { Building2 } from "lucide-react"
import BookmarkButton from "./BookmarkButton" // 아까 만든 버튼 임포트
import { useState } from "react"

interface brandprops {
  id: number
  name: string
  code: string
  category: string
}

export function BookmarkCard({ brand }: { brand: brandprops }) {
  // API연동 전 테스트
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <Card className="group relative hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 북마크 버튼 */}
        <BookmarkButton
          isBookmarked={isBookmarked}
          onToggle={() => setIsBookmarked(!isBookmarked)}
        />
      </div>

      {/* 북마크 카드 */}
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-xl bg-secondary border flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
          <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="font-semibold text-sm text-foreground mb-1">
          {brand.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{brand.code}</p>
        <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
          {brand.category}
        </span>
      </CardContent>
    </Card>
  )
}
