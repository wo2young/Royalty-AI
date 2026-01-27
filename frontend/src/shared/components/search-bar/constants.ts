export interface Category {
  id: string
  label: string
  coreClasses: number[]
}

export const CATEGORY_OPTIONS: Category[] = [
  { id: "ALL", label: "전체", coreClasses: [] },
  { id: "IT", label: "IT · 플랫폼", coreClasses: [9, 35, 42] },
  { id: "OTHERS", label: "기타", coreClasses: [] },
]
