import { ArrowLeft, Bookmark } from "lucide-react"
import { Link } from "react-router-dom"
import { SearchBar } from "../../../shared/components/search-bar/SearchBar"
import { BookmarkCard } from "../components/BookmarkCard"
import { useBookmarks } from "../api/bookmark.queries"
import { Pagination } from "@/shared/components/pagination/Pagination"
import { useBrandFilter } from "@/shared/hook/useBrandFilter"

const ITEMS_PER_PAGE = 12 // 한 페이지에 표시할 카드 개수

export function BookmarksPage() {
  const { data: BookmarkData = [], isLoading, isError } = useBookmarks()

  const {
    searchQuery,
    handleSearch,
    selectedCategory,
    handleCategory,
    filteredData,
    currentPage,
    setCurrentPage,
  } = useBrandFilter(BookmarkData)

  const bookmarkedItems = filteredData.filter((item) => item.bookmarked)

  const totalPages = Math.ceil(bookmarkedItems.length / ITEMS_PER_PAGE)
  const paginatedBrands = bookmarkedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-8">
        <div className="mb-8">
          <Link
            to="/mypage"
            className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            마이페이지로 돌아가기
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-primary" />
                브랜드 북마크
              </h1>
              <p className="text-muted-foreground">
                즐겨찾는 브랜드(로고/상호)를 관리합니다
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              총{" "}
              <span className="font-semibold text-foreground">
                {bookmarkedItems.length}
              </span>
              개의 북마크
            </div>
          </div>
        </div>

        {/* 검색, 필터 부분 */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          category={selectedCategory}
          onCategoryChange={handleCategory}
        />

        {/* 리스트 부분 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedBrands.map((brand) => (
            <BookmarkCard key={brand.patentId} brand={brand} />
          ))}
        </div>

        {/* 결과가 없을 때 */}
        {bookmarkedItems.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        )}

        {/* 페이지네이션 컴포넌트 추가 */}
        {bookmarkedItems.length > 0 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
