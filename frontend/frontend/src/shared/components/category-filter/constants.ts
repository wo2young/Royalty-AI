export interface Category {
  id: string
  label: string
  coreClasses: number[]
}

export const CATEGORY_OPTIONS: Category[] = [
  { id: "ALL", label: "전체", coreClasses: [] },
  { id: "IT", label: "IT · 플랫폼", coreClasses: [9, 35, 42] },
  { id: "COMMERCE", label: "커머스 · 유통", coreClasses: [35, 25] },
  { id: "FOOD", label: "식품 · 외식", coreClasses: [30, 43] },
  { id: "CONTENT", label: "콘텐츠 · 교육", coreClasses: [41, 9] },
  { id: "PET", label: "반려동물 · 보호", coreClasses: [44, 45, 35] },
  { id: "MEDICAL", label: "의료 · 헬스케어", coreClasses: [44, 10, 5] },
  { id: "FINANCE", label: "금융 · 핀테크", coreClasses: [36, 9, 42] },
  { id: "MANUFACTURING", label: "제조 · 하드웨어", coreClasses: [7, 9, 11] },
]
