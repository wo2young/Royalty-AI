import { Building2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Pagination } from "@/shared/components/pagination/Pagination"
import { BookmarkSearch } from "@/features/bookmark/components/BookmarkSearch"
import { BrandList } from "../components/BrandList"

const ITEMS_PER_PAGE = 5

const myBrands = [
  {
    id: 1,
    name: "테크솔루션 주식회사",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "IT",
    created_at: "2026.01.10",
  },
  {
    id: 2,
    name: "이노베이션랩",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "MEDICAL",
    created_at: "2026.01.08",
  },
  {
    id: 3,
    name: "퓨처테크",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "FOOD",
    created_at: "2025.12.20",
  },
  {
    id: 4,
    name: "스마트솔루션",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "COMMERCE",
    created_at: "2025.12.15",
  },
  {
    id: 5,
    name: "디지털웍스",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "CONTENT",
    created_at: "2025.12.10",
  },
  {
    id: 6,
    name: "클라우드허브",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "PET",
    created_at: "2025.12.05",
  },
  {
    id: 7,
    name: "데이터플로우",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "FINANCE",
    created_at: "2025.11.28",
  },
  {
    id: 8,
    name: "넥스트젠AI",
    category: "MANUFACTURING",
    created_at: "2025.11.20",
  },
]

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredBrands = myBrands.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    </div>
  )
}
