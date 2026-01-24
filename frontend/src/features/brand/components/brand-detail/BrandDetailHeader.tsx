import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

interface BrandDetailHeaderProps {
  brand: {
    brandName: string
    category: string
    currentLogoPath: string
    description: string
    createdAt: string
  }
}

export function BrandDetailHeader({ brand }: BrandDetailHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200/60">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link
          to="/mypage/brand"
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          나의 브랜드 목록으로
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-200/50">
              <img
                src={brand.currentLogoPath || "/placeholder.svg"}
                alt={brand.brandName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5">
                  {brand.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  등록일: {brand.createdAt}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {brand.brandName}
              </h1>
              <p className="max-w-xl text-balance text-sm leading-relaxed text-muted-foreground">
                {brand.description}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              정보 수정
            </Button>
            <Button size="sm">리포트 다운로드</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
