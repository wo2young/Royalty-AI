import { useNavigate } from "react-router-dom"
import type { Brand } from "../types"
import { BrandItem } from "./BrandItem"
import { EmptyState } from "@/shared/components/EmptyState"
import { Building2, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface BrandListProps {
  brands: Brand[]
  onDelete: (id: number, name: string) => void
  onEdit: (id: number) => void
  onClick: () => void
}

export function BrandList({
  brands,
  onDelete,
  onEdit,
  onClick,
}: BrandListProps) {
  const navigate = useNavigate()

  const handleView = (id: number) => {
    navigate(`/mypage/brand/${id}`)
  }

  if (brands.length === 0) {
    return (
      <EmptyState
        icon={<Building2 size={48} className="text-muted-foreground/40" />}
        title="등록된 브랜드가 없습니다"
        description="나만의 브랜드를 등록하고 로고와 상호를 체계적으로 관리해보세요."
        action={
          <Button onClick={onClick}>
            <Plus className="w-4 h-4 mr-2" />첫 브랜드 등록하기
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {brands.map((brand) => (
        <BrandItem
          key={brand.brandId}
          brand={brand}
          onView={handleView}
          onDelete={() => onDelete(brand.brandId, brand.brandName)}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
