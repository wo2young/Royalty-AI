import { Building2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Pagination } from "@/shared/components/pagination/Pagination"
import { BookmarkSearch } from "@/features/bookmark/components/BookmarkSearch"
import { BrandList } from "../components/BrandList"

const ITEMS_PER_PAGE = 5

const myBrands = [
  {
    brandId: 1,
    brandName: "테크솔루션 주식회사",
    category: "IT",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description:
      "혁신적인 IT 솔루션을 제공하는 기업으로, 클라우드 서비스 및 AI 기반 소프트웨어 개발을 전문으로 합니다. 글로벌 시장 진출을 목표로 지속적인 기술 혁신을 이어가고 있습니다.",
    createdAt: "2020-01-15T00:00:00",
  },
  {
    brandId: 2,
    brandName: "이노베이션랩",
    category: "MEDICAL",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2026-01-08T00:00:00",
  },
  {
    brandId: 3,
    brandName: "퓨처테크",
    category: "FOOD",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-20T00:00:00",
  },
  {
    brandId: 4,
    brandName: "스마트솔루션",
    category: "COMMERCE",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-15T00:00:00",
  },
  {
    brandId: 5,
    brandName: "디지털웍스",
    category: "CONTENT",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-10T00:00:00",
  },
  {
    brandId: 6,
    brandName: "클라우드허브",
    category: "PET",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-05T00:00:00",
  },
  {
    brandId: 7,
    brandName: "데이터플로우",
    category: "FINANCE",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-11-28T00:00:00",
  },
  {
    brandId: 8,
    brandName: "넥스트젠AI",
    category: "MANUFACTURING",
    logoPath: "",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-11-20T00:00:00",
  },
]

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredBrands = myBrands.filter((brand) => {
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
