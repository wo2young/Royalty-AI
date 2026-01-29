export const trademarkKeys = {
  all: ["trademarks"] as const,
  lists: () => [...trademarkKeys.all, "list"] as const,
  // 필터(검색어, 카테고리 등)에 따라 이름표를 다르게 붙임
  list: (filters: string) => [...trademarkKeys.lists(), { filters }] as const,
  details: () => [...trademarkKeys.all, "detail"] as const,
  detail: (id: string) => [...trademarkKeys.details(), id] as const,
}