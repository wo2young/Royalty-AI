import { useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBrands } from "@/features/brands/api/brand.queries"

interface MyBrandSelectorProps {
  onAnalyze: () => void
  analyzing: boolean
}

export function MyBrandSelector({
  onAnalyze,
  analyzing,
}: MyBrandSelectorProps) {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)

  const { data: myBrands, isLoading, isError } = useBrands()

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !myBrands) {
    return (
      <div className="text-center py-10 text-destructive">
        브랜드 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        등록된 브랜드 중 분석할 항목을 선택하세요
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {myBrands.map((brand) => (
          <Card
            key={brand.brandId}
            className={cn(
              "cursor-pointer p-4 transition-all hover:border-primary",
              selectedBrand === brand.brandId && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedBrand(brand.brandId)}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
                {brand.logoPath ? (
                  <img
                    src={brand.logoPath}
                    alt={brand.brandName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-slate-400 group-hover:text-slate-600 transition-colors" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium leading-none">{brand.brandName}</h3>
                <p className="text-xs text-muted-foreground">
                  {brand.category}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">
                    등록일: {brand.createdAt.split("T")[0]}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button
        onClick={onAnalyze}
        disabled={!selectedBrand || analyzing}
        className="w-full sm:w-auto"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {analyzing ? "분석 중..." : "선택한 브랜드 분석"}
      </Button>
    </div>
  )
}
