import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageIcon, Upload, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/shared/components/ui/textarea"
import { brandFormSchema, type BrandFormValues } from "../../types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

interface EditBrandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Brand와 BrandDetail 모두 수용할 수 있도록 필요한 속성만 정의
  brand: {
    brandName: string
    category: string
    description?: string
    currentLogoPath?: string // 상세페이지용
    logoPath?: string // 목록페이지용
  }
  onEdit: (formData: FormData) => void
  isPending?: boolean
}

export function EditBrandModal({
  open,
  onOpenChange,
  brand,
  onEdit,
  isPending,
}: EditBrandModalProps) {
  // 초기 이미지 경로 결정 (상세페이지 혹은 목록페이지 데이터에 따라)
  const initialImage = brand.currentLogoPath || brand.logoPath || ""
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      brandName: brand.brandName,
      category: brand.category,
      description: brand.description || "",
    },
  })

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      fieldChange(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = (values: BrandFormValues) => {
    const formData = new FormData()
    formData.append("brandName", values.brandName)
    formData.append("category", values.category)
    if (values.description) formData.append("description", values.description)
    if (values.logoImage instanceof File) {
      formData.append("logoImage", values.logoImage)
    }
    onEdit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>브랜드 정보 수정</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-4"
          >
            <FormField
              control={form.control}
              name="logoImage"
              render={({ field: { onChange, ...field } }) => (
                <FormItem className="flex flex-col items-center gap-2">
                  <FormLabel className="cursor-pointer">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, onChange)}
                      {...field}
                      value=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>브랜드 이름</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="IT · 플랫폼">IT · 플랫폼</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>브랜드 설명</FormLabel>
                  <FormControl>
                    <Textarea rows={3} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                수정 완료
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
