import { useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const myBrands = [
  {
    patentId: "2111530",
    name: "METEO",
    code: "4020150021686",
    category: "COMMERCE",
    date: "2015.03.24",
    image:
      "http://plus.kipris.or.kr/openapi/fileToss.jsp?arg=ad7a17eeeef6e4ea4b5e22ef00dd3e298cd4f29188d8481610d39d5a8261c9fbfd527ffdb2a46e7c79b266c05792fa0315df4f2cded80b6a",
    status: "등록완료",
  },
  {
    patentId: "2",
    name: "이노베이션랩",
    category: "스타트업 상호",
    date: "2026.01.08",
    status: "심사중",
  },
  {
    patentId: "3",
    name: "퓨처테크",
    category: "상표권 등록",
    date: "2025.12.20",
    status: "등록완료",
  },
]

interface MyBrandSelectorProps {
  onAnalyze: () => void
  analyzing: boolean
}

export function MyBrandSelector({
  onAnalyze,
  analyzing,
}: MyBrandSelectorProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        등록된 브랜드 중 분석할 항목을 선택하세요
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {myBrands.map((brand) => (
          <Card
            key={brand.patentId}
            className={cn(
              "cursor-pointer p-4 transition-all hover:border-primary",
              selectedBrand === brand.patentId && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedBrand(brand.patentId)}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-slate-400 group-hover:text-slate-600 transition-colors" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium leading-none">{brand.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {brand.category}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">
                    등록일: {brand.date}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      brand.status === "등록완료"
                        ? "text-green-600"
                        : "text-yellow-600"
                    )}
                  >
                    {brand.status}
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
