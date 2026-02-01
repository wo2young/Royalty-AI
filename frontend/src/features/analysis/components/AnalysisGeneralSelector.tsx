import { CategoryFilter } from "@/shared/components/search-bar/CategoryFilter"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Loader2, PlusCircle, Sparkles, Upload, X } from "lucide-react"
import { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import type { AnalysisFormValues } from "../page/AnalysisPage"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GeneralSelectorProps {
  analyzing: boolean
  analyzed: boolean
  onRegister: () => void
  isCreating: boolean
}

export default function AnalysisGeneralSelector({
  analyzing,
  analyzed,
  onRegister,
  isCreating,
}: GeneralSelectorProps) {
  const { register, control, watch, setValue } =
    useFormContext<AnalysisFormValues>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const brandId = watch("brandId")
  const logoFile = watch("logoFile")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("logoFile", file)
      setValue("brandId", null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label htmlFor="brandName">상호명</Label>
        <Input
          {...register("brandName")}
          id="brandName"
          placeholder="분석할 상호명을 입력하세요"
          className="h-11 text-base"
        />
      </div>

      <div className="text-center space-y-2.5">
        <Label>로고 이미지</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all py-8",
            logoFile
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-primary hover:bg-slate-50"
          )}
        >
          {logoFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-primary">
                {logoFile.name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-slate-400"
                onClick={(e) => {
                  e.stopPropagation()
                  setValue("logoFile", null)
                }}
              >
                <X className="mr-1 h-3 w-3" /> 삭제
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 group-hover:bg-primary/10">
                <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                이미지 업로드 또는 드래그
              </p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label>업종 분류</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <CategoryFilter
              selectedId={field.value}
              onSelect={field.onChange}
              className="h-11 w-full"
            />
          )}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={analyzing} className="w-full sm:w-auto">
          <Sparkles className="mr-2 h-4 w-4" />
          {analyzing ? "분석 중..." : "상표 분석"}
        </Button>

        {analyzed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 sm:flex-none"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5 shadow-sm"
              onClick={onRegister}
              disabled={isCreating || !!brandId}
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {brandId ? "내 브랜드 등록 완료" : "내 브랜드 등록하기"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}