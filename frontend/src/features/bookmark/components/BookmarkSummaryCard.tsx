import { Link } from "react-router-dom"
import { Building2, FileText } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { useBookmarks } from "../api/bookmark.queries"
import { BookmarkSummarySkeleton } from "./skeletons/BookmarkSummarySkeleton"

export function BookmarkSummaryCard() {
  const { data: BookmarkData = [], isLoading, isError } = useBookmarks()

  const summaryData = [...BookmarkData].slice(0, 6)

  if (isError) return <div>데이터를 불러오지 못했습니다.</div>

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-5 h-5" />
            브랜드 북마크
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            즐겨찾는 브랜드(로고/상호)를 관리합니다
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-primary hover:bg-primary/10"
        >
          <Link to="/mypage/bookmark">전체보기</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading ? (
            <BookmarkSummarySkeleton />
          ) : (
            summaryData.map((brand) => (
              <div
                key={brand.bookmarkId}
                className="flex flex-col items-center justify-center p-6 rounded-xl border bg-background hover:bg-secondary/50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-xl bg-background border flex items-center justify-center mb-4 group-hover:border-primary/50 transition-all overflow-hidden">
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
                <h3 className="font-semibold text-sm mb-1">
                  {brand.trademarkName}
                </h3>
                <p className="text-xs text-muted-foreground">{brand.code}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
