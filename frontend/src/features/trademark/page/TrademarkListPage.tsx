import { useState } from "react"
import { Search } from "lucide-react"
import { TrademarkTable } from "../components/trademark-table"
import { Pagination } from "../components/pagination"
import { categories } from "../lib/trademark-data"
import { useTrademarks } from "../api/trademark.queries"

export default function TrademarkListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: response, isLoading } = useTrademarks({
    page: currentPage,
    query: searchQuery,
    category: selectedCategory,
  })

  const trademarks = response?.list || []
  const totalCount = response?.totalCount || 0
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1

  console.log(response)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-6 py-10 md:px-16 md:py-12 max-w-6xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">상표 리스트</h1>
        <p className="text-muted-foreground text-lg">
          등록된 상표들을 확인하세요.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="상표명 또는 출원인 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-8 mb-4">
        <p className="text-muted-foreground">
          총 <span className="text-foreground font-medium">{totalCount}개</span>
          의 상표
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">
          데이터를 불러오는 중...
        </div>
      ) : (
        <>
          <TrademarkTable trademarks={trademarks} />

          {trademarks.length > 0 ? (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
        </>
      )}
    </div>
  )
}
