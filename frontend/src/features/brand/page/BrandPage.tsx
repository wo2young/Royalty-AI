import { Building2, ArrowLeft, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Pagination } from "@/shared/components/pagination/Pagination"
import { BookmarkSearch } from "@/features/bookmark/components/BookmarkSearch"
import { BrandList } from "../components/BrandList"
import { useBrands } from "../api/brand.queries"
import { Button } from "@/shared/components/ui/button"
import { AddBrandModal } from "../components/modal/AddBrandModal"

const ITEMS_PER_PAGE = 5

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: brands = [], isLoading, isError } = useBrands()

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch =
      brand.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "ALL" || brand.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE)
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // 검색 시 페이지 리셋
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1) // 카테고리 변경 시 페이지 리셋
  }

  if (isLoading) return <div>로딩 중...</div>
  if (isError) return <div>데이터를 불러오지 못했습니다.</div>

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
        {/* 타이틀 */}
        <div className="mb-8">
          <Link
            to="/mypage"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            마이페이지로 돌아가기
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                나의 브랜드
              </h1>
              <p className="text-muted-foreground">
                등록한 브랜드(로고/상호)를 관리합니다
              </p>
            </div>
            <Button
              className="gap-2 shadow-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              브랜드 추가
            </Button>
          </div>
        </div>

        {/* 검색 및 카테고리 필터 */}
        <BookmarkSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* 나의 브랜드 리스트 */}
        <BrandList brands={paginatedBrands} />

        {/* 페이지네이션 */}
        {filteredBrands.length > 0 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 나의 브랜드 추가 모달 */}
      <AddBrandModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  )
}
