export const trademarkKeys = {
  all: ["trademarks"] as const,
  lists: () => [...trademarkKeys.all, "list"] as const,
  // 필터 객체를 JSON 문자열로 변환하거나 객체 그대로 넣어 유일한 키를 만듭니다.
  list: (params: { page: number; query: string; category: string }) =>
    [...trademarkKeys.lists(), params] as const,
  details: () => [...trademarkKeys.all, "detail"] as const,
  detail: (id: number) => [...trademarkKeys.details(), id] as const,
}
