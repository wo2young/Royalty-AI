export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  lists: () => [...bookmarkKeys.all, "list"] as const,
  list: (filters: string) => [...bookmarkKeys.lists(), { filters }] as const,
}
