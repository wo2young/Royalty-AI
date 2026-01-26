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
import { useState } from "react"
import { Textarea } from "@/shared/components/ui/textarea"
import { useCreateBrand } from "../../api/brand.queries"

interface AddBrandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBrandModal({ open, onOpenChange }: AddBrandModalProps) {
  const { mutate: createBrand, isPending } = useCreateBrand()
  const [isDragging, setIsDragging] = useState(false)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      brandName: "",
      category: "",
      description: "",
      logoImage: null,
    },
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      form.setValue("logoImage", file)
    }
  }

  // 실시간 미리보기를 위한 값 관찰
  const watchedValues = useWatch({
    control: form.control,
    name: ["brandName", "category", "logoImage"],
  })
  const [brandName, category, logoImage] = watchedValues

  const onSubmit = (data: BrandFormValues) => {
    const formData = new FormData()
    formData.append("brandName", data.brandName)
    formData.append("category", data.category)
    if (data.description) formData.append("description", data.description)

    if (data.logoImage) {
      formData.append("logoImage", data.logoImage)
    }

    createBrand(formData, {
      onSuccess: () => {
        console.log(Object.fromEntries(formData))
        onOpenChange(false)
        form.reset()
        //TODO: Toast 알림
      },
      onError: (error) => {
        console.error("등록 실패:", error)
        alert("브랜드 등록 중 오류가 발생했습니다.")
        //TODO: Toast 알림
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 p-0 overflow-hidden">
        <div className="grid sm:grid-cols-[240px_1fr]">
          {/* Preview (UI 유지) */}
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

          {/* Form */}
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
                          <SelectItem value="전체">전체</SelectItem>
                          <SelectItem value="IT · 플랫폼">
                            IT · 플랫폼
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logo Upload 필드 */}
                <div className="space-y-2">
                  <FormLabel>로고 이미지</FormLabel>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary hover:bg-primary/10 ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    {form.watch("logoImage") ? (
                      <div className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                        <span className="text-sm truncate">
                          {form.watch("logoImage")?.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className=" text-muted-foreground hover:text-destructive"
                          onClick={() => form.setValue("logoImage", null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="브랜드에 대한 설명을 입력하세요"
                          rows={2} // 2줄 높이 설정
                          className="resize-none" // 크기 조절 비활성화 (깔끔함)
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
