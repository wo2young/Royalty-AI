export function BrandSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50 animate-pulse">
      {/* 로고 영역 스켈레톤 */}
      <div className="w-16 h-16 rounded-xl bg-slate-200" />

      {/* 텍스트 영역 스켈레톤 */}
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-3 bg-slate-200 rounded w-1/5" />
      </div>

      {/* 버튼 영역 스켈레톤 */}
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </div>
    </div>
  )
}
