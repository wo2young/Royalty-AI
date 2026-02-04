import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/shared/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
  LineChart,
  Bell,
  Bookmark,
  Sparkles,
  Fingerprint,
} from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  // Framer Motion 애니메이션 설정
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  }

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <motion.div
          className="container px-4 md:px-6 mx-auto text-center"
          {...fadeIn}
        >
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-6 bg-background shadow-sm">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-primary mr-2 font-bold">New</span>
            AI 기반 브랜드 아이덴티티(BI) 분석 런칭
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
            상표 보호의 미래, <br />
            <span className="text-primary">Royalty-AI</span>가 시작합니다
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl mb-10 leading-relaxed">
            단순 검색을 넘어 발음, 관념, 로고 유사도까지 AI가 심층 분석합니다.
            당신의 브랜드가 걸어온 기록부터 등록 보호 알림까지 한 번에
            관리하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full shadow-lg hover:shadow-primary/20 transition-all"
              onClick={() => navigate("/analysis")}
            >
              지금 바로 분석하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 text-lg rounded-full"
              onClick={() => navigate("/trademarks")}
            >
              특허청 상표보기
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 핵심 분석 기능 */}
      <section className="w-full py-24">
        <div className="container px-4 mx-auto">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              비즈니스 성공을 위한 다각도 AI 분석
            </h2>
            <p className="text-muted-foreground text-lg">
              상표 전문가의 시선을 데이터로 구현했습니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* AI 유사성 분석 */}
            <motion.div
              {...fadeIn}
              className="md:col-span-8 p-8 rounded-3xl border bg-card shadow-sm flex flex-col justify-between overflow-hidden relative group"
            >
              <div>
                <div className="p-3 bg-blue-500/10 w-fit rounded-2xl mb-4">
                  <Fingerprint className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  AI 딥러닝 유사성 검사
                </h3>
                <p className="text-muted-foreground max-w-md">
                  단순 텍스트 일치를 넘어 발음, 관념, 로고의 특징점까지 추출하여
                  법적 분쟁 가능성을 사전에 차단합니다.
                </p>
              </div>
              <div className="mt-8 flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  관념 분석
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  발음 유사도
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  로고 분석
                </span>
              </div>
            </motion.div>

            {/* 브랜드 히스토리 */}
            <motion.div
              {...fadeIn}
              className="md:col-span-4 p-8 rounded-3xl border bg-card shadow-sm"
            >
              <div className="p-3 bg-green-500/10 w-fit rounded-2xl mb-4">
                <LineChart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">상표 변천사</h3>
              <p className="text-muted-foreground">
                분석할 때마다 기록되는 로고와 유사도 데이터를 차트로 시각화하여
                브랜드의 성장을 트래킹하세요.
              </p>
            </motion.div>

            {/* BI 분석 */}
            <motion.div
              {...fadeIn}
              className="md:col-span-4 p-8 rounded-3xl border bg-card shadow-sm"
            >
              <div className="p-3 bg-purple-500/10 w-fit rounded-2xl mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">BI 아이덴티티 분석</h3>
              <p className="text-muted-foreground">
                당신의 브랜드 이미지가 시장에서 어떤 가치로 전달되는지 AI가 정밀
                진단합니다.
              </p>
            </motion.div>

            {/* 자동 알림 */}
            <motion.div
              {...fadeIn}
              className="md:col-span-8 p-8 rounded-3xl border bg-card shadow-sm flex items-center justify-between"
            >
              <div className="max-w-md">
                <div className="p-3 bg-orange-500/10 w-fit rounded-2xl mb-4">
                  <Bell className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">유사 상표 등록 알림</h3>
                <p className="text-muted-foreground">
                  등록 예정인 브랜드와 비슷한 데이터가 DB에 수집되면 즉시 알림을
                  보내드립니다.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center animate-pulse">
                  <Bell className="w-10 h-10 text-orange-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 북마크 리스트 섹션 */}
      <section className="w-full py-20">
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div className="flex-1" {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
              <Bookmark className="w-4 h-4" /> 관심 상표 관리
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              수많은 상표 중 <br />
              필요한 것만 골라 담으세요
            </h2>
            <ul className="space-y-4">
              {[
                "관심 있는 상표 북마크 기능",
                "북마크 전용 페이지에서 모아보기",
                "카테고리별 상표 리스트 필터링",
                "특허청 상표 리스트 제공",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-lg text-slate-700">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="flex-1 w-full aspect-video rounded-3xl overflow-hidden shadow-2xl relative"
            {...fadeIn}
          >
            <img
              src="./public/preview.jpg"
              className="w-full h-full object-cover p-1 rounded-3xl"
              alt="Service Preview"
            />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
