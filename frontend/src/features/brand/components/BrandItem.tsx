import { Button } from "@/shared/components/ui/button"
import { Building2, Trash2, Edit2, Eye, Bell, BellOff } from "lucide-react"
import type { Brand } from "../types"

interface BrandItemProps {
  brand: Brand
  onView?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onToggleNotify?: (id: number, active: boolean) => void
}

export function BrandItem({
  brand,
  onView,
  onEdit,
  onDelete,
  onToggleNotify,
}: BrandItemProps) {
  const isActive = brand.notificationEnabled

  return (
    <div
      className={`relative flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer group ${
        isActive
          ? "border-indigo-500/50 bg-indigo-50/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
          : "hover:bg-secondary/40 hover:shadow-md"
      }`}
    >
      {isActive && (
        <span className="absolute -top-1 -left-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
        </span>
      )}

      {/* 로고 영역 */}
      <div className="w-16 h-16 rounded-xl bg-secondary border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all overflow-hidden">
        {brand.logoPath ? (
          <img
            src={brand.logoPath}
            alt={brand.brandName}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="font-semibold text-foreground">{brand.brandName}</h3>
        <p className="text-sm text-muted-foreground">{brand.category}</p>
        <p className="text-xs text-muted-foreground">
          등록일: {brand.createdAt.split("T")[0]}
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onToggleNotify?.(brand.brandId, !brand.notificationEnabled)
          }}
          className={`h-8 w-8 transition-colors ${
            brand.notificationEnabled
              ? "text-indigo-500 hover:text-indigo-600 bg-indigo-50"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {brand.notificationEnabled ? (
            <Bell className="w-4 h-4 fill-current animate-ring" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView?.(brand.brandId)}
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit?.(brand.brandId)}
          className="h-8 w-8 text-muted-foreground hover:text-blue-600"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(brand.brandId)
          }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
