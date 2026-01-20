import { Bookmark } from "lucide-react"

interface BookmarkButtonProps {
  isBookmarked: boolean
  onToggle: () => void
  isLoading?: boolean
}

export default function BookmarkButton({
  isBookmarked,
  onToggle,
  isLoading = false,
}: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      disabled={isLoading}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
    >
      <Bookmark
        className={`w-5 h-5 transition-all ${
          isBookmarked ? "fill-primary text-primary" : "text-gray-400"
        } ${isLoading ? "animate-pulse" : ""}`}
      />
    </button>
  )
}
