export interface Bookmark {
  id: string
  patentId: string
  userId: string
  createdAt: string
}

export interface BookmarkedTrademark {
  patentId: string
  name: string
  code: string
  category: string
  date: string
  image?: string
  isBookmarked?: boolean
}

export interface BookmarkToggleRequest {
  id: string
}

export interface BookmarkToggleResponse {
  isBookmarked: boolean
  bookmark?: Bookmark
}

export interface BookmarksResponse {
  bookmarks: BookmarkedTrademark[]
  total: number
}

export interface BookmarkFilters {
  searchQuery: string
  category?: string
}
