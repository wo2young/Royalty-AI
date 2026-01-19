"use client"

import { useState } from "react"

// 1. 컴포넌트 및 데이터 Import
// (파일 경로 구조에 따라 '../components/...' 부분은 조정이 필요할 수 있습니다)
import { SearchFilters } from "../components/search-filters"
import { TrademarkTable } from "../components/trademark-table"
import { Pagination } from "../components/pagination"
import { trademarks as initialData, categories } from "../lib/trademark-data"

export default function TrademarkListPage() {
  // 2. 상태(State) 관리
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리")
  const [currentPage, setCurrentPage] = useState(1)
  const [trademarks, setTrademarks] = useState(initialData) // 북마크 상태 변경을 위해 로컬 state로 관리

  // 페이지당 보여줄 아이템 개수
  const itemsPerPage = 10

  // 3. 필터링 로직 (검색어 + 카테고리)
  const filteredTrademarks = trademarks.filter((item) => {
    // 카테고리 매칭 확인
    const matchesCategory =
      selectedCategory === "전체 카테고리" || item.category === selectedCategory

    // 검색어 매칭 확인 (상표명 또는 출원인)
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.applicant.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // 4. 페이지네이션 로직
  const totalPages = Math.ceil(filteredTrademarks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentTrademarks = filteredTrademarks.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  // 5. 이벤트 핸들러

  // 검색어 변경 시 페이지를 1페이지로 초기화
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  // 카테고리 변경 시 페이지를 1페이지로 초기화
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  // 북마크 토글 기능
  const handleToggleBookmark = (id: string) => {
    setTrademarks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isBookmarked: !t.isBookmarked } : t
      )
    )
  }

  // 6. 화면 렌더링
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 헤더 영역 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">상표 모니터링</h1>
        <p className="text-muted-foreground">
          등록된 상표들의 상태를 확인하고 관리하세요.
        </p>
      </div>

      {/* 검색 및 필터 컴포넌트 */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      {/* 상표 목록 테이블 컴포넌트 */}
      <TrademarkTable
        trademarks={currentTrademarks}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* 페이지네이션 컴포넌트 (데이터가 있을 때만 표시) */}
      {filteredTrademarks.length > 0 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  )
}