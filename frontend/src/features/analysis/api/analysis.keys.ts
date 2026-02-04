export const analysisKeys = {
  all: ["analysis"] as const,
  lists: () => [...analysisKeys.all, "list"] as const,
  details: () => [...analysisKeys.all, "detail"] as const,
  detail: (id: number) => [...analysisKeys.details(), id] as const,
}