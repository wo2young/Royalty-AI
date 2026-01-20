import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"

import { Badge } from "@/shared/components/ui/badge"
import { Building2, ArrowLeft, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Pagination } from "@/shared/components/pagination/Pagination"
import { BookmarkSearch } from "@/features/bookmark/components/BookmarkSearch"

const ITEMS_PER_PAGE = 5

const myBrands = [
  {
    id: 1,
    name: "테크솔루션 주식회사",
    category: "IT",
    date: "2026.01.10",
    status: "등록완료",
  },
  {
    id: 2,
    name: "이노베이션랩",
    category: "MEDICAL",
    date: "2026.01.08",
    status: "심사중",
  },
  {
    id: 3,
    name: "퓨처테크",
    category: "FOOD",
    date: "2025.12.20",
    status: "등록완료",
  },
  {
    id: 4,
    name: "스마트솔루션",
    category: "COMMERCE",
    date: "2025.12.15",
    status: "등록완료",
  },
  {
    id: 5,
    name: "디지털웍스",
    category: "CONTENT",
    date: "2025.12.10",
    status: "심사중",
  },
  {
    id: 6,
    name: "클라우드허브",
    category: "PET",
    date: "2025.12.05",
    status: "등록완료",
  },
  {
    id: 7,
    name: "데이터플로우",
    category: "FINANCE",
    date: "2025.11.28",
    status: "반려",
  },
  {
    id: 8,
    name: "넥스트젠AI",
    category: "MANUFACTURING",
    date: "2025.11.20",
    status: "등록완료",
  },
]

export function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredBrands = myBrands.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const STATUS_CONFIG = {
    등록완료: {
      label: "등록완료",
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50",
    },
    심사중: {
      label: "심사중",
      className:
        "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50",
    },
    반려: {
      label: "반려",
      className: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
    },
  } as const

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

    if (!config) {
      return <Badge variant="secondary">{status}</Badge>
    }

    return (
      <Badge
        variant="outline" // 테두리가 있는 스타일이 더 정돈되어 보입니다
        className={`${config.className} px-2 py-0.5 font-medium shadow-sm transition-none`}
      >
        {/* 작은 점(Dot)을 추가하면 시각적 인지가 더 빠릅니다 */}
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
        {config.label}
      </Badge>
    )
  }

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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
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

        {/* 나의 브랜드 상태 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {myBrands.length}
              </div>
              <div className="text-sm text-muted-foreground">전체 브랜드</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {myBrands.filter((b) => b.status === "등록완료").length}
              </div>
              <div className="text-sm text-muted-foreground">등록완료</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {myBrands.filter((b) => b.status === "심사중").length}
              </div>
              <div className="text-sm text-muted-foreground">심사중</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {myBrands.filter((b) => b.status === "반려").length}
              </div>
              <div className="text-sm text-muted-foreground">반려</div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 카테고리 필터 */}
        <BookmarkSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* 나의 브랜드 리스트 */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-3">
            {paginatedBrands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center gap-4 p-5 rounded-xl border hover:border-primary/50 hover:bg-secondary/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary border flex items-center justify-center shrink-0 group-hover:border-primary/50 group-hover:bg-background transition-all">
                  <Building2 className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="font-semibold text-foreground">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {brand.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    등록일: {brand.date} · {getStatusBadge(brand.status)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    수정
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
