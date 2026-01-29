import { Link, useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { useBrands } from "../api/brand.queries"
import { BrandSummarySkeleton } from "./skeleons/BrandSummarySkeleton"

export function BrandSummaryCard() {
  const { data: brands = [], isLoading, isError } = useBrands()
  const navigate = useNavigate()

  const summaryData = [...brands].slice(0, 3)

  if (isError) return <div>데이터를 불러오지 못했습니다.</div>

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-5 h-5" />
            나의 브랜드
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            등록한 브랜드(로고/상호)를 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-primary hover:bg-primary/10"
          >
            <Link to="/mypage/brand">전체보기</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <BrandSummarySkeleton />
        ) : (
          summaryData.map((brand) => (
            <div
              key={brand.brandId}
              className="flex items-center gap-4 p-5 rounded-xl border hover:bg-secondary/40 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary border flex items-center justify-center shrink-0 group-hover:bg-background transition-all overflow-hidden">
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
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  {brand.brandName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {brand.category}
                </p>
                <p className="text-xs text-muted-foreground">
                  등록일: {brand.createdAt.split("T")[0]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/mypage/brand/${brand.brandId}`)}
                >
                  상세보기
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
