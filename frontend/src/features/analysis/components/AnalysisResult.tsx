import { motion, type Variants } from "framer-motion"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Building2, Bookmark } from "lucide-react"

const similarTrademarks = [
  {
    patent_id: 1,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    similarity: 87,
    image_url: "https://example.com/image1.png",
  },
  {
    patent_id: 2,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    similarity: 78,
    image_url: "",
  },
  {
    patent_id: 3,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    similarity: 65,
    image_url: "https://example.com/image1.png",
  },
  {
    patent_id: 4,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    similarity: 52,
    image_url: "https://example.com/image1.png",
  },
]

// 애니메이션 컨테이너 설정 (자식 요소들에게 stagger 효과 전달)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 각 아이템 사이의 시간 간격 (0.1초)
    },
  },
}

// 개별 카드 아이템 애니메이션 설정
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

export function AnalysisResults() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid gap-3">
        {similarTrademarks.map((trademark) => (
          <motion.div key={trademark.patent_id} variants={itemVariants}>
            <Card className="group p-5 hover:border-slate-300 transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700">
              <div className="flex items-center gap-6">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                  {trademark.image_url ? (
                    <img
                      src={trademark.image_url}
                      alt={trademark.trademark_name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {trademark.trademark_name}
                      </h4>
                      <span className="text-xs font-bold text-indigo-600">
                        {trademark.similarity}% 일치
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full sm:opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Bookmark className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-slate-500">
                    <span>{trademark.applicant}</span>
                    <span className="font-mono text-slate-400 text-xs">
                      {trademark.application_number}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
