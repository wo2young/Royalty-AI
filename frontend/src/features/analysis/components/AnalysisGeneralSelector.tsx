import { CategoryFilter } from "@/shared/components/category-filter/CategoryFilter"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { FileText, Sparkles, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

interface GeneralSelectorProps {
  onAnalyze: () => void
  analyzing: boolean
}

export default function AnalysisGeneralSelector({
  onAnalyze,
  analyzing,
}: GeneralSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 클릭 시 파일 선택창 열기
  const onUploadClick = () => fileInputRef.current?.click()

  // 파일 선택 완료 시 상태 저장
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  // 드래그 앤 드롭 로직
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) setFile(droppedFile)
  }

  return (
    <div className="space-y-2.5">
      <div className="space-y-2.5">
        {/* 상호명 입력 */}
        <Label htmlFor="both-name" className="text-sm font-medium">
          상호명
        </Label>
        <Input
          id="both-name"
          placeholder="분석할 상호명을 입력하세요"
          className="h-11 text-base"
        />
      </div>

      {/* 로고 이미지 입력 */}
      <div className="space-y-2.5">
        <Label>로고 이미지</Label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onUploadClick}
          className={`
            flex items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "bg-secondary/20 border-slate-200 hover:border-primary/60 hover:bg-secondary/40"}
          `}
        >
          <div className="text-center space-y-3">
            {file ? (
              // 파일이 선택되었을 때의 UI
              <div className="flex flex-col items-center">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-red-500 hover:text-red-600 h-8"
                  onClick={(e) => {
                    e.stopPropagation() // 클릭 이벤트 전파 방지
                    setFile(null)
                  }}
                >
                  <X className="w-3 h-3 mr-1" /> 삭제
                </Button>
              </div>
            ) : (
              // 파일이 없을 때의 UI
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 ring-4 ring-primary/5">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    로고 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, SVG (최대 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 카테고리 분류 */}
      <div className="space-y-2.5">
        <Label htmlFor="both-category" className="text-sm font-medium">
          업종 분류
        </Label>
        <CategoryFilter
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
          className="h-11 text-base w-full sm:w-full"
        />
      </div>

      <Button onClick={onAnalyze} className="w-full mt-2 sm:w-auto">
        <Sparkles className="mr-2 h-4 w-4" />
        {analyzing ? "분석 중..." : "상표 분석"}
      </Button>
    </div>
  )
}
