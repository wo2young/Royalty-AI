export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (brandId: number) => [...brandKeys.details(), brandId] as const,
}
