import { motion } from "framer-motion"
import { Target, MessageSquare, Sparkles, ChevronRight } from "lucide-react"
import type { BrandIdentityPayload } from "../../types"

interface BrandBIProps {
  identityPayload: BrandIdentityPayload
}

export function BrandBIReportCard({ identityPayload }: BrandBIProps) {
  const { core, brandKeywords, copyExamples, language } = identityPayload

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-4">
      {/* Core Identity */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
          <Target className="h-6 w-6 text-slate-900" />
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Core Identity
          </h3>
        </div>
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
              Brand Mission
            </p>
            <h4 className="text-xl font-bold text-slate-400 mt-1">
              {language.kr} / {language.en}
            </h4>
          </div>
          <div className="md:col-span-8 space-y-4">
            <p className="text-2xl font-medium text-slate-800 leading-snug break-keep">
              {core.kr}
            </p>
            <p className="text-lg text-slate-400 font-light italic leading-relaxed">
              "{core.en}"
            </p>
          </div>
        </div>
      </section>

      {/* 브랜드 키워드 */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
          <Sparkles className="h-6 w-6 text-slate-900" />
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Brand Keywords
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {brandKeywords.kr.map((keyword, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group p-6 bg-slate-50 rounded-sm border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300"
            >
              <p className="text-xs text-slate-400 mb-2 font-mono">
                0{idx + 1}
              </p>
              <p className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {keyword}
              </p>
              <p className="text-xs text-slate-400 uppercase mt-1">
                {brandKeywords.en[idx]}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Copywriting Guide */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
          <MessageSquare className="h-6 w-6 text-slate-900" />
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Copywriting Examples
          </h3>
        </div>
        <div className="space-y-4">
          {copyExamples.kr.map((copy, idx) => (
            <div
              key={idx}
              className="flex gap-6 p-8 border border-slate-100 rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-medium text-slate-800 break-keep leading-relaxed">
                  "{copy}"
                </p>
                {copyExamples.en[idx] && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <ChevronRight className="h-4 w-4" />
                    <p className="text-sm italic">{copyExamples.en[idx]}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
