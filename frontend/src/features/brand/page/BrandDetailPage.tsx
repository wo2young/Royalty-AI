import {
  ArrowLeft,
  ImageIcon,
  TrendingDown,
  Info,
  ShieldCheck,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card"
import { Link, useParams } from "react-router-dom"
import { BrandHistoryChart } from "../components/BrandHistoryChart"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

const myBrands = [
  {
    id: 1,
    name: "테크솔루션 주식회사",
    category: "IT",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    description:
      "혁신적인 IT 솔루션을 제공하는 기업으로, 클라우드 서비스 및 AI 기반 소프트웨어 개발을 전문으로 합니다. 글로벌 시장 진출을 목표로 지속적인 기술 혁신을 이어가고 있습니다.",
    created_at: "2020.01.15",
  },
  {
    id: 2,
    name: "이노베이션랩",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "MEDICAL",
    created_at: "2026.01.08",
  },
  {
    id: 3,
    name: "퓨처테크",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "FOOD",
    created_at: "2025.12.20",
  },
  {
    id: 4,
    name: "스마트솔루션",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "COMMERCE",
    created_at: "2025.12.15",
  },
  {
    id: 5,
    name: "디지털웍스",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "CONTENT",
    created_at: "2025.12.10",
  },
  {
    id: 6,
    name: "클라우드허브",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "PET",
    created_at: "2025.12.05",
  },
  {
    id: 7,
    name: "데이터플로우",
    image_path:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    category: "FINANCE",
    created_at: "2025.11.28",
  },
  {
    id: 8,
    name: "넥스트젠AI",
    category: "MANUFACTURING",
    created_at: "2025.11.20",
  },
]

const historyData = [
  { date: "2020.01", logoSimilarity: 100, nameSimilarity: 100 },
  { date: "2022.01", logoSimilarity: 85, nameSimilarity: 92 },
  { date: "2024.01", logoSimilarity: 72, nameSimilarity: 85 },
  { date: "2026.01", logoSimilarity: 65, nameSimilarity: 78 },
]

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()

  const brandData = myBrands.find((b) => b.id === Number(id))

  if (!brandData) {
    return <div className="p-20 text-center">브랜드를 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* 상단 네비게이션 & 헤더 배경 */}
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
                  src={brandData.image_path || "/placeholder.svg"}
                  alt={brandData.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5">
                    {brandData.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    등록일: {brandData.created_at}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {brandData.name}
                </h1>
                <p className="max-w-xl text-balance text-sm leading-relaxed text-muted-foreground">
                  {brandData.description}
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

      <main className="mx-auto max-w-6xl px-4 py-10 bg-background">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 통계 및 요약 */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-none shadow-sm bg-linear-to-br from-slate-900 to-slate-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-80 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> 브랜드 보호 지수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Safe</div>
                <p className="mt-1 text-xs opacity-60">
                  현재 브랜드 유사도 위협이 낮은 상태입니다.
                </p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-white/20">
                  <div className="h-full w-[85%] rounded-full bg-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  최근 변화 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">로고 유사도</span>
                  <span className="flex items-center gap-1 font-semibold text-orange-500">
                    <TrendingDown className="h-4 w-4" /> 65%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">명칭 독창성</span>
                  <span className="font-semibold text-emerald-500">높음</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 차트 영역 */}
          <div className="lg:col-span-2">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    상표 변천사 분석
                  </CardTitle>
                  <CardDescription>
                    시간 경과에 따른 시장 내 유사 상표 추이를 분석합니다
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-87.5 w-full rounded-xl bg-slate-50/50 p-4">
                  {/* 실제 차트 컴포넌트 */}
                  <BrandHistoryChart data={historyData} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-100 p-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">최초 유사도</p>
                    <p className="text-lg font-bold">100%</p>
                  </div>
                  <div className="text-center border-l">
                    <p className="text-xs text-muted-foreground">현재 유사도</p>
                    <p className="text-lg font-bold text-primary">65%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
