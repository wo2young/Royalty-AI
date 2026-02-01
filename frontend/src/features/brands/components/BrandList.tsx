import { useNavigate } from "react-router-dom"
import type { Brand } from "../types"
import { BrandItem } from "./BrandItem"

interface BrandListProps {
  brands: Brand[]
  onDelete: (id: number, name: string) => void
  onEdit: (id: number) => void
  onToggleNotify: (id: number, enabled: boolean) => void
}

export function BrandList({
  brands,
  onDelete,
  onEdit,
  onToggleNotify,
}: BrandListProps) {
  const navigate = useNavigate()

  const handleView = (id: number) => {
    navigate(`/mypage/brand/${id}`)
  }

  if (brands.length === 0) {
    return (
      <div className="flex py-20 h-130 justify-center items-center border rounded-xl bg-muted/10">
        <p className="text-muted-foreground">등록된 브랜드가 없습니다.</p>
      </div>
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
          onToggleNotify={onToggleNotify}
        />
      ))}
    </div>
  )
}
