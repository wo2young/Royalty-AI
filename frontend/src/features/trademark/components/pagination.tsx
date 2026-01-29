

import { ChevronLeft, ChevronRight } from "lucide-react"
// 👇 [수정] 경로를 프로젝트 환경(@/shared/...)에 맞췄습니다. 빨간 줄 뜨면 본인 경로로 수정하세요!
import { Button } from "@/shared/components/ui/button" 

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  // 총 페이지가 1개 이하면 숨김
  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: "smooth" }) // 페이지 이동 시 맨 위로 스크롤
  }

  // 페이지 번호 계산 로직 (수정하신 부분 그대로)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 1. 첫 페이지
    pages.push(1)

    // 2. 앞쪽 줄임표 (...)
    if (currentPage > 3) {
      pages.push("...")
    }

    // 3. 현재 페이지 주변
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }

    // 4. 뒤쪽 줄임표 (...)
    if (currentPage < totalPages - 2) {
      pages.push("...")
    }

    // 5. 마지막 페이지
    if (!pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-center gap-2 py-4 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-transparent h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {getPageNumbers().map((page, index) =>
        typeof page === "string" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground text-sm">
            {page}
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className={`h-8 w-8 p-0 ${currentPage !== page ? "bg-transparent border-transparent" : ""}`}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-transparent h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}