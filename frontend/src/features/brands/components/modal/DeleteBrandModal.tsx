import { useDeleteBrand } from "../../api/brand.queries"
import { Loader2, AlertTriangle, X } from "lucide-react"

interface DeleteBrandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandId: number
  brandName: string
}

export function DeleteBrandModal({
  open,
  onOpenChange,
  brandId,
  brandName,
}: DeleteBrandModalProps) {
  const { mutate: deleteBrand, isPending } = useDeleteBrand()

  if (!open) return null

  const handleDelete = () => {
    deleteBrand(brandId, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isPending && onOpenChange(false)}
      />

      {/* 삭제 모달 */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">브랜드 삭제</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              정말로{" "}
              <span className="font-semibold text-slate-900">
                [{brandName}]
              </span>{" "}
              브랜드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 모든
              데이터가 영구적으로 삭제됩니다.
            </p>
          </div>
        </div>

        {/* 삭제 모달 하단 */}
        <div className="flex flex-col-reverse gap-2 bg-slate-50 p-6 sm:flex-row sm:justify-end">
          <button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all sm:w-auto"
          >
            취소
          </button>
          <button
            disabled={isPending}
            onClick={handleDelete}
            className="flex w-full items-center justify-center rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "브랜드 삭제하기"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
