import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Filter, Search } from "lucide-react"

interface BookmarkSearchProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function BookmarkSearch({
  searchQuery,
  onSearchChange,
}: BookmarkSearchProps) {
  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="브랜드명 또는 특허번호로 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            필터
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
