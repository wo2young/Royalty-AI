"use client"

import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { AlertCircle, CheckCircle2, Building2, Bookmark } from "lucide-react"

const similarTrademarks = [
  {
    patent_id: 1,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    application_date: "2025-11-15",
    registered_date: "2025-12-01",
    similarity: 87,
    status: "등록",
    risk: "high",
    image_url: "https://example.com/image1.png",
  },
  {
    patent_id: 2,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    application_date: "2025-11-15",
    registered_date: "2025-12-01",
    similarity: 78,
    status: "등록",
    risk: "high",
    image_url: "",
  },
  {
    patent_id: 3,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    application_date: "2025-11-15",
    registered_date: "2025-12-01",
    similarity: 65,
    status: "등록",
    risk: "high",
    image_url: "https://example.com/image1.png",
  },
  {
    patent_id: 4,
    trademark_name: "테크플러스코리아",
    applicant: "홍길동",
    application_number: "40-2025-0123456",
    application_date: "2025-11-15",
    registered_date: "2025-12-01",
    similarity: 52,
    status: "등록",
    risk: "high",
    image_url: "https://example.com/image1.png",
  },
]

export function AnalysisResults() {
  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <Card className="p-8 border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-6 bg-indigo-600 rounded-full" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                분석 리포트 요약
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              검토하신 상표와 유사한 성격의 상표가 총{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100 underline underline-offset-4 decoration-indigo-500/30">
                {similarTrademarks.length}개
              </span>
              가 발견되었습니다.
            </p>
          </div>
        </div>

        {/* 위험 상태 카드 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {/* 고위험군 */}
          <div className="relative group overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 transition-all hover:border-red-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                고위험군
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-50">
                1
              </span>
              <span className="text-sm font-bold text-slate-400">건</span>
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-red-500/80">
              Similarity 80% +
            </p>
          </div>

          {/* 중위험군 */}
          <div className="relative group overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 transition-all hover:border-amber-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                중위험군
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-50">
                2
              </span>
              <span className="text-sm font-bold text-slate-400">건</span>
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">
              Similarity 60 - 79%
            </p>
          </div>

          {/* 저위험군 */}
          <div className="relative group overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 transition-all hover:border-emerald-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                안전군
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-50">
                1
              </span>
              <span className="text-sm font-bold text-slate-400">건</span>
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-emerald-500/80">
              Below 60%
            </p>
          </div>
        </div>
      </Card>

      {/* 유사 상표 리스트 */}
      <div className="grid gap-3">
        {similarTrademarks.map((trademark) => (
          <Card
            key={trademark.patent_id}
            className="group p-5 hover:border-slate-300 transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700 overflow-hidden"
          >
            <div className="flex items-center gap-6">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
                {trademark.image_url ? (
                  <img
                    src={trademark.image_url}
                    alt={trademark.trademark_name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-slate-400 group-hover:text-slate-600 transition-colors" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {trademark.trademark_name}
                    </h4>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        trademark.risk === "high"
                          ? "text-indigo-600 dark:text-indigo-400"
                          : trademark.risk === "medium"
                            ? "text-blue-500"
                            : "text-slate-500"
                      }`}
                    >
                      {trademark.similarity}% 일치
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <Bookmark className="h-4 w-4 text-slate-500 hover:text-indigo-600 transition-colors" />
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-[13px]">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-slate-400 font-medium">출원인</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {trademark.applicant}
                    </span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5 text-slate-500">
                    <span className="text-slate-400 font-medium">출원번호</span>
                    <span className="font-mono tracking-tight">
                      {trademark.application_number}{" "}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
