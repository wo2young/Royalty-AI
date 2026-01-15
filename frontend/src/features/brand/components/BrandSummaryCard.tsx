import { Link } from "react-router-dom"
import { Building2, ExternalLink } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

// 샘플 데이터 (추후 API로 변경)
const myBrands = [
  {
    id: 1,
    name: "테크솔루션 주식회사",
    category: "기업 로고 등록",
    date: "2026.01.10",
    status: "등록완료",
  },
  {
    id: 2,
    name: "아노베이션랩",
    category: "스타트업 상호",
    date: "2026.01.08",
    status: "심사중",
  },
  {
    id: 3,
    name: "큐시테크",
    category: "상표명 등록",
    date: "2025.12.20",
    status: "등록완료",
  },
]

export function BrandSummaryCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-5 h-5" />내 브랜드
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
            <Link to="/user/brands">전체보기</Link>
          </Button>
          <Button size="sm" className="gap-2 shadow-sm">
            <span>+</span> 브랜드 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {myBrands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center gap-4 p-5 rounded-xl border hover:bg-secondary/40 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary border flex items-center justify-center shrink-0 group-hover:bg-background transition-all">
              <Building2 className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <h3 className="font-semibold text-foreground">{brand.name}</h3>
              <p className="text-sm text-muted-foreground">{brand.category}</p>
              <p className="text-xs text-muted-foreground">
                등록일: {brand.date} · {brand.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary"
              >
                <ExternalLink className="w-4 h-4" /> 수정
              </Button>
              <Button variant="outline" size="sm">
                상세보기
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
