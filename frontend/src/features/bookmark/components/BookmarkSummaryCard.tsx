import { Link, useNavigate } from "react-router-dom"
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
import { useMemo } from "react"
import { EmptyState } from "@/shared/components/EmptyState"

export function BookmarkSummaryCard() {
  const navigate = useNavigate()
  const { data: BookmarkData = [], isLoading, isError } = useBookmarks()

  // 북마크된 데이터만 필터링하여 상위 6개 추출
  const summaryData = useMemo(() => {
    return BookmarkData.filter((brand) => brand.bookmarked).slice(0, 6)
  }, [BookmarkData])

  if (isError) {
    return (
      <Card className="shadow-sm border-destructive/50">
        <CardContent className="py-10 text-center text-destructive">
          데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </CardContent>
      </Card>
    )
  }

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
        {summaryData.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-primary hover:bg-primary/10"
          >
            <Link to="/mypage/bookmark">전체보기</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <BookmarkSummarySkeleton />
          </div>
        ) : summaryData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {summaryData.map((brand) => (
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
                <h3 className="font-semibold text-sm mb-1 text-center truncate w-full px-2">
                  {brand.trademarkName}
                </h3>
                <p className="text-xs text-muted-foreground">{brand.code}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Building2 size={40} />}
            title="북마크한 브랜드가 없습니다"
            description="관심 있는 브랜드를 북마크하여 이곳에서 간편하게 확인하세요."
            action={
              <Button onClick={() => navigate("/trademarks")}>
                브랜드 찾아보기
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  )
}
