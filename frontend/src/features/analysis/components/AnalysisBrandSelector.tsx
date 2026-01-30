import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBrands } from "@/features/brands/api/brand.queries"
import { useFormContext } from "react-hook-form"
import type { AnalysisFormValues } from "../page/AnalysisPage"
import type { Brand } from "@/features/brands/types"

export function MyBrandSelector({ analyzing }: { analyzing: boolean }) {
  const { setValue, watch } = useFormContext<AnalysisFormValues>()
  const selectedBrandId = watch("brandId")

  const { data: myBrands, isLoading, isError } = useBrands()

  const handleBrandSelect = (brand: Brand) => {
    setValue("brandId", brand.brandId)
    setValue("brandName", brand.brandName)
    setValue("logoUrl", brand.logoPath || undefined)
    setValue("category", brand.category)
    // 내 브랜드를 선택하면 직접 업로드한 파일은 초기화
    setValue("logoFile", null)
  }

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {myBrands?.map((brand) => (
          <Card
            key={brand.brandId}
            className={cn(
              "relative cursor-pointer p-4 transition-all hover:border-primary",
              selectedBrandId === brand.brandId
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-slate-200"
            )}
            onClick={() => handleBrandSelect(brand)}
          >
            {selectedBrandId === brand.brandId && (
              <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
            )}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 overflow-hidden border">
                {brand.logoPath ? (
                  <img
                    src={brand.logoPath}
                    alt={brand.brandName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="m-auto h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 truncate">
                  {brand.brandName}
                </h4>
                <p className="text-xs text-slate-500">{brand.category}</p>
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
        type="submit"
        disabled={!selectedBrandId || analyzing}
        className="w-full sm:w-auto h-11 px-8"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        선택한 브랜드 분석
      </Button>
    </div>
  )
}
