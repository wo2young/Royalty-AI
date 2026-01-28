import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { CATEGORY_OPTIONS } from "./constants"

interface CategoryFilterProps {
  selectedId: string
  onSelect: (id: string) => void
  className?: string
}

export function CategoryFilter({
  selectedId,
  onSelect,
  className,
}: CategoryFilterProps) {
  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className={`w-full sm:w-48 h-9 ${className}`}>
        <SelectValue placeholder="카테고리 선택" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_OPTIONS.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
