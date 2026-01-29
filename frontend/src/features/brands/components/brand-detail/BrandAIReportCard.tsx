import { Brain, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import type { BrandReport } from "../../types"

interface AIReportProps {
  report: BrandReport
}

export function BrandAIReportCard({ report }: AIReportProps) {
  return (
    <Card className="overflow-hidden border rounded-2xl shadow-lg shadow-slate-200/50">
      <div className="bg-slate-900 p-6 text-white -translate-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-primary-foreground" />
          <span className="text-xs font-medium opacity-80">
            AI 정밀 진단 리포트
          </span>
        </div>
        <h3 className="text-xl font-bold">{report.title}</h3>
      </div>

      <div className="p-6 pb-0 space-y-6 bg-white -translate-y-6">
        {/* 점수 섹션 */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">반려 점수</p>
            <p className={"text-3xl font-black text-indigo-400"}>
              {report.riskScore}점
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">분석 일자</p>
            <p className="text-sm font-medium">
              {report.createdAt.split("T")[0]}
            </p>
          </div>
        </div>

        {/* 요약 내용 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <h4 className="font-bold text-slate-900">AI 분석 요약</h4>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl">
            {report.summary}
          </p>
        </div>

        {/* 제안 사항 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h4 className="font-bold text-slate-900">브랜드 보호 제안</h4>
          </div>
          <ul className="grid gap-2">
            {report.suggestions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
