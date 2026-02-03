import {
  resolveCategoryId,
  type CategoryId,
} from "@/shared/components/search-bar/constants"
import { useMemo, useState } from "react"

export function useBrandFilter<
  T extends { brandName?: string; trademarkName?: string; category: string },
>(data: T[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("전체")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 검색어 필터 (브랜드명 또는 상표명)
      const name = item.brandName || item.trademarkName || ""
      const matchesSearch = name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      // 카테고리 필터 (데이터 원본에 상관없이 '전체/IT/기타'로 판별)
      const itemCategory = resolveCategoryId(item.category)
      const matchesCategory =
        selectedCategory === "전체" || itemCategory === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [data, searchQuery, selectedCategory])

  const handleSearch = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleCategory = (val: string) => {
    setSelectedCategory(val as CategoryId)
    setCurrentPage(1)
  }

  return {
    searchQuery,
    handleSearch,
    selectedCategory,
    handleCategory,
    filteredData,
    currentPage,
    setCurrentPage,
  }
}
