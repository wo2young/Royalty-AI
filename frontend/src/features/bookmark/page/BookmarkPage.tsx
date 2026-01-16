"use client"

import { ArrowLeft, Bookmark } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { BookmarkSearch } from "../components/BookmarkSearch"
import { BookmarkCard } from "../components/BookmarkCard"

const bookmarkedBrands = [
  {
    id: 1,
    name: "브랜드명 1",
    code: "특허번호 #0001",
    category: "기업 로고",
    date: "2026.01.15",
  },
  {
    id: 2,
    name: "브랜드명 2",
    code: "특허번호 #0002",
    category: "상표권",
    date: "2026.01.14",
  },
  {
    id: 3,
    name: "브랜드명 3",
    code: "특허번호 #0003",
    category: "스타트업 상호",
    date: "2026.01.13",
  },
  {
    id: 4,
    name: "브랜드명 4",
    code: "특허번호 #0004",
    category: "기업 로고",
    date: "2026.01.12",
  },
  {
    id: 5,
    name: "브랜드명 5",
    code: "특허번호 #0005",
    category: "상표권",
    date: "2026.01.11",
  },
  {
    id: 6,
    name: "브랜드명 6",
    code: "특허번호 #0006",
    category: "기업 로고",
    date: "2026.01.10",
  },
  {
    id: 7,
    name: "브랜드명 7",
    code: "특허번호 #0007",
    category: "스타트업 상호",
    date: "2026.01.09",
  },
  {
    id: 8,
    name: "브랜드명 8",
    code: "특허번호 #0008",
    category: "상표권",
    date: "2026.01.08",
  },
  {
    id: 9,
    name: "브랜드명 9",
    code: "특허번호 #0009",
    category: "기업 로고",
    date: "2026.01.07",
  },
  {
    id: 10,
    name: "브랜드명 10",
    code: "특허번호 #0010",
    category: "상표권",
    date: "2026.01.06",
  },
  {
    id: 11,
    name: "브랜드명 11",
    code: "특허번호 #0011",
    category: "스타트업 상호",
    date: "2026.01.05",
  },
  {
    id: 12,
    name: "브랜드명 12",
    code: "특허번호 #0012",
    category: "기업 로고",
    date: "2026.01.04",
  },
]

export function BookmarksPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBrands = bookmarkedBrands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        />

        {/* 리스트 부분 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <BookmarkCard key={brand.id} brand={brand} />
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
