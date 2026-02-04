export interface Category {
  id: string
  label: string
  coreClasses: number[]
}

export const CATEGORY_OPTIONS: Category[] = [
  { id: "전체", label: "전체", coreClasses: [] },
  { id: "IT · 플랫폼", label: "IT · 플랫폼", coreClasses: [9, 35, 42] },
  { id: "기타", label: "기타", coreClasses: [] },
]

export type CategoryId = "전체" | "IT · 플랫폼" | "기타"

export const resolveCategoryId = (categoryStr: string): CategoryId => {
  if (!categoryStr || categoryStr === "전체") return "전체"
  if (categoryStr === "IT · 플랫폼") return "IT · 플랫폼"

  // 분류 번호 기반 판별 (IT 핵심 분류 9, 35, 42 포함 여부)
  const itClasses = [9, 35, 42]
  const hasIT = categoryStr
    .split(/[|()]/) // 구분자 제거
    .map((s) => parseInt(s.trim(), 10))
    .some((num) => itClasses.includes(num))

  return hasIT ? "IT · 플랫폼" : "기타"
}

export const getCoreClassesById = (id: string): number[] => {
  const category = CATEGORY_OPTIONS.find((c) => c.id === id)
  return category?.coreClasses || []
}
