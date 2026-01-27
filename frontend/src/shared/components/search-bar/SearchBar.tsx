import { CategoryFilter } from "@/shared/components/search-bar/CategoryFilter"
import { Input } from "@/shared/components/ui/input"
import { Search } from "lucide-react"

interface SearchProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
}

export function BookmarkSearch({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
}: SearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center py-6">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="브랜드명 또는 특허번호로 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <CategoryFilter selectedId={category} onSelect={onCategoryChange} />
    </div>
  )
}
