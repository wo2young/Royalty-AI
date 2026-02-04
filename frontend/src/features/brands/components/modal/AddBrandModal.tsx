import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Upload, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { brandFormSchema, type BrandFormValues } from "../../types"
import { Textarea } from "@/shared/components/ui/textarea"
import { useCreateBrand } from "../../api/brand.queries"
import { cn } from "@/lib/utils"
import { useFileDrop } from "@/shared/hook/useFileDrop"

interface AddBrandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBrandModal({ open, onOpenChange }: AddBrandModalProps) {
  const { mutate: createBrand, isPending } = useCreateBrand()

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      brandName: "",
      category: "",
      description: "",
      logoImage: null,
    },
  })

  const { isDragging, dragEvents } = useFileDrop({
    onFileDrop: (file) => {
      form.setValue("logoImage", file)
    },
  })

  // 실시간 미리보기를 위한 값 관찰
  const [brandName, category, logoImage] = useWatch({
    control: form.control,
    name: ["brandName", "category", "logoImage"],
  })

  const onSubmit = (data: BrandFormValues) => {
    const formData = new FormData()
    formData.append("brandName", data.brandName)
    formData.append("category", data.category)
    formData.append("description", data.description || "")

    if (data.logoImage) {
      formData.append("logoImage", data.logoImage)
    }

    createBrand(formData, {
      onSuccess: () => {
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        console.error("등록 실패:", error)
        alert("브랜드 등록 중 오류가 발생했습니다.")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 p-0 overflow-hidden">
        <div className="grid sm:grid-cols-[240px_1fr]">
          {/* Preview 섹션 (UI 동일) */}
          <div className="bg-primary p-6 flex flex-col items-center justify-center text-primary-foreground">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 overflow-hidden">
              {logoImage ? (
                <img
                  src={URL.createObjectURL(logoImage)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-12 h-12 text-white/60" />
              )}
            </div>
            <h3 className="font-semibold text-lg text-center mb-1 truncate w-full px-2">
              {brandName || "브랜드명"}
            </h3>
            <p className="text-sm text-white/70 text-center">
              {category || "카테고리 미선택"}
            </p>
          </div>

          {/* Form 섹션 */}
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl">브랜드 추가</DialogTitle>
              <DialogDescription>새로운 브랜드를 등록하세요</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>브랜드명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="브랜드명을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IT · 플랫폼">
                            IT · 플랫폼
                          </SelectItem>
                          <SelectItem value="커머스">커머스</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Logo Upload 필드 (훅 적용) */}
                <div className="space-y-2">
                  <FormLabel>로고 이미지</FormLabel>
                  <div
                    {...dragEvents}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-primary hover:bg-primary/5",
                      isDragging
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-muted-foreground/20"
                    )}
                  >
                    {logoImage ? (
                      <div className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                        <span className="text-sm truncate max-w-45">
                          {logoImage.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => form.setValue("logoImage", null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            form.setValue(
                              "logoImage",
                              e.target.files?.[0] || null
                            )
                          }
                        />
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">
                          파일을 드래그하거나 클릭하여 업로드
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* 설명 섹션 */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="브랜드에 대한 설명을 입력하세요"
                          rows={2}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "등록 중..." : "브랜드 등록"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
