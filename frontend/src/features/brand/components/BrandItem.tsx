import { Button } from "@/shared/components/ui/button"
import { Building2, Trash2, Edit2, Eye } from "lucide-react"
import type { Brand } from "../types"

interface BrandItemProps {
  brand: Brand
  onView?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function BrandItem({ brand, onView, onEdit, onDelete }: BrandItemProps) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border hover:bg-secondary/40 hover:shadow-md transition-all cursor-pointer group">
      <div className="w-16 h-16 rounded-xl bg-secondary border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all overflow-hidden">
        {brand.image_path ? (
          <img
            src={brand.image_path}
            alt={brand.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="font-semibold text-foreground">{brand.name}</h3>
        <p className="text-sm text-muted-foreground">{brand.category}</p>
        <p className="text-xs text-muted-foreground">
          등록일: {brand.created_at}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView?.(brand.id)}
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit?.(brand.id)}
          className="h-8 w-8 text-muted-foreground hover:text-blue-600"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete?.(brand.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
