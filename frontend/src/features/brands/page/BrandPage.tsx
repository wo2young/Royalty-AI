import { Building2, ArrowLeft, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { Pagination } from "@/shared/components/pagination/Pagination"
import { SearchBar } from "@/shared/components/search-bar/SearchBar"
import { BrandList } from "../components/BrandList"
import { useBrands, useUpdateBrand } from "../api/brand.queries"
import { Button } from "@/shared/components/ui/button"
import { AddBrandModal } from "../components/modal/AddBrandModal"
import { DeleteBrandModal } from "../components/modal/DeleteBrandModal"
import type { Brand } from "../types"
import { EditBrandModal } from "../components/modal/EditBrandModal"
import { BrandSkeleton } from "../components/skeleons/BrandSkeleton"
import { useBrandFilter } from "../../../shared/hook/useBrandFilter"
import { ConfirmAnalysisModal } from "../components/modal/ConfirmAnalysisModal"

const ITEMS_PER_PAGE = 5

export default function BrandsPage() {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const { data: brands = [], isLoading, isError } = useBrands()
  const { mutate: updateBrand, isPending: isUpdatePending } = useUpdateBrand()

  const {
    searchQuery,
    handleSearch,
    selectedCategory,
    handleCategory,
    filteredData,
    currentPage,
    setCurrentPage,
  } = useBrandFilter(brands)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    name: string
  } | null>(null)

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedBrands = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleEditClick = (id: number) => {
    const target = brands.find((b) => b.brandId === id)
    if (target) setEditTarget(target)
  }

  const handleEditSubmit = (formData: FormData) => {
    if (!editTarget) return

    updateBrand(
      { brandId: editTarget.brandId, formData },
      {
        onSuccess: () => {
          setEditTarget(null)
          setIsConfirmModalOpen(true)
        },
      }
    )
  }

  if (isError) return <div>데이터를 불러오지 못했습니다.</div>

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12 flex-1 flex flex-col">
        {/* 타이틀 */}
        <div className="mb-8 flex-none">
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
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          category={selectedCategory}
          onCategoryChange={handleCategory}
        />

        {/* 나의 브랜드 리스트 */}
        {isLoading ? (
          <div className="flex flex-col gap-4 flex-1">
            {[...Array(5)].map((_, i) => (
              <BrandSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center border rounded-xl">
            데이터 로드 실패
          </div>
        ) : (
          <BrandList
            brands={paginatedBrands}
            onDelete={(id, name) => setDeleteTarget({ id, name })}
            onEdit={handleEditClick}
            onClick={() => setIsAddModalOpen(true)}
          />
        )}

        {/* 페이지네이션 */}
        {!isLoading && filteredData.length > 0 && (
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
      <DeleteBrandModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        brandId={deleteTarget?.id ?? 0}
        brandName={deleteTarget?.name ?? ""}
      />
      {editTarget && (
        <EditBrandModal
          key={editTarget.brandId}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          brand={editTarget}
          onEdit={handleEditSubmit}
          isPending={isUpdatePending}
        />
      )}

      <ConfirmAnalysisModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
      />
    </div>
  )
}
