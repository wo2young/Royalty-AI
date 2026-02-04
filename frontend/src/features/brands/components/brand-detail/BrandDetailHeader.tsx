import { ArrowLeft, Bell, BellOff, FileDown, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { EditBrandModal } from "../modal/EditBrandModal"
import { useDownloadReport } from "../../api/brand.queries"

interface BrandDetailHeaderProps {
  brand: {
    brandId: number
    brandName: string
    category: string
    currentLogoPath: string
    description: string
    createdAt: string
    notificationEnabled: boolean
  }
  hasHistory: boolean
  onEditSubmit: (formData: FormData) => void
  onToggleNotify?: (id: number, enabled: boolean) => void
  isUpdatePending: boolean
}

export function BrandDetailHeader({
  brand,
  hasHistory,
  onToggleNotify,
  onEditSubmit,
  isUpdatePending,
}: BrandDetailHeaderProps) {
  const { mutate: download, isPending } = useDownloadReport()

  const [showBadge, setShowBadge] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const isActive = brand.notificationEnabled
  const isDisableNotify = !hasHistory

  const handleNotifyClick = () => {
    if (isDisableNotify) return
    const nextState = !isActive
    onToggleNotify?.(brand.brandId, nextState)

    if (nextState) {
      setShowBadge(true)
      setTimeout(() => setShowBadge(false), 1000)
    }
  }

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
                  등록일: {brand.createdAt.split("T")[0]}
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

          {/* 버튼 영역 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <AnimatePresence>
                {showBadge && (
                  <motion.span
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -30 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-[10px] font-bold text-white rounded-full"
                  >
                    On
                  </motion.span>
                )}
              </AnimatePresence>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNotifyClick}
                disabled={isDisableNotify}
                className={`gap-2 transition-all ${
                  isActive
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50 hover:text-indigo-700"
                    : ""
                } ${isDisableNotify ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
              >
                {isDisableNotify || !isActive ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4 fill-current animate-[ring_0.5s_ease-in-out]" />
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              정보 수정
            </Button>
            <Button
              size="sm"
              onClick={() => download(brand.brandId)}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {isPending ? "생성 중..." : "리포트 다운로드"}
            </Button>

            {isEditOpen && (
              <EditBrandModal
                key={brand.brandId}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                brand={brand}
                onEdit={(formData) => {
                  onEditSubmit(formData)
                  setIsEditOpen(false)
                }}
                isPending={isUpdatePending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
