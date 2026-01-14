import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { ArrowRight, CheckCircle2, Zap } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center">
      {/* 1. Hero Section: 서비스의 핵심 가치를 한눈에 */}
      <section className="w-full py-20 lg:py-32 bg-linear-to-b from-background to-muted/50">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-6 bg-background shadow-sm">
            <span className="text-primary mr-2">New</span>
            AI 기반 상표 유사도 분석 엔진 업데이트
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            당신의 브랜드 가치를 <br className="hidden sm:inline" />
            <span className="text-primary">AI로 완벽하게</span> 보호하세요
          </h1>
          <p className="mx-auto max-w-175 text-muted-foreground md:text-xl mb-10">
            복잡한 상표 등록 가능성 확인부터 AI 네이밍 추천까지, 단 몇 초 만에
            정확한 분석 결과를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              onClick={() => navigate("/analysis")}
            >
              지금 바로 분석하기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              onClick={() => navigate("/trademarks")}
            >
              기존 상표 둘러보기
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Feature Section: 주요 기능 강조 */}
      <section className="w-full py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              왜 Royalty-AI인가요?
            </h2>
            <p className="text-muted-foreground text-lg">
              성공적인 비즈니스를 위한 스마트한 상표 관리 솔루션
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-xs">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">실시간 분석</h3>
              <p className="text-muted-foreground">
                ML 모델을 통해 수만 건의 상표 데이터를 실시간으로 대조합니다.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-xs">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">정교한 유사도 검사</h3>
              <p className="text-muted-foreground">
                단순 텍스트 일치를 넘어 발음, 관념적 유사성까지 분석합니다.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-xs">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI 네이밍 추천</h3>
              <p className="text-muted-foreground">
                분석 데이터를 바탕으로 등록 가능성이 높은 이름을 추천합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
