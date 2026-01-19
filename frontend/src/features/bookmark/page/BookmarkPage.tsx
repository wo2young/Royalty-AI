"use client"

import { ArrowLeft, Bookmark } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { BookmarkSearch } from "../components/BookmarkSearch"
import { BookmarkCard } from "../components/BookmarkCard"
import { useBookmarks } from "../api/bookmark.queries"

export function BookmarksPage() {
  const { data, isLoading, isError } = useBookmarks()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  const filteredBrands = useMemo(() => {
    if (!data?.bookmarks) return []

    return data.bookmarks.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "ALL" || brand.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [data, searchQuery, selectedCategory])

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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
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
                {filteredBrands.length}
              </span>
              개의 북마크
            </div>
          </div>
        </div>

        {/* 검색, 필터 부분 */}
        <BookmarkSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* 리스트 부분 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <BookmarkCard key={brand.patentId} brand={brand} />
          ))}
        </div>

        {/* 결과가 없을 때 */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
