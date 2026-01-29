export interface Bookmark {
  id: string
  patentId: string
  userId: string
  createdAt: string
}

export interface BookmarkedTrademark {
  bookmarkId: number
  patentId: number
  trademarkName: string
  applicant: string
  code: number
  category: string
  createdAt: string
  imageUrl?: string
  isBookmarked: boolean
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
}

export interface BookmarkFilters {
  searchQuery: string
  category?: string
}
