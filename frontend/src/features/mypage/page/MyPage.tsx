import MyProfileSidebar from "../components/MyProfileSidebar"
import { BookmarkSummaryCard } from "@/features/bookmark/components/BookmarkSummaryCard"
import { BrandSummaryCard } from "@/features/brand/components/BrandSummaryCard"

export default function MyPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-[340px_1fr] gap-8">
          <MyProfileSidebar />
          <main className="space-y-8">
            <BookmarkSummaryCard />
            <BrandSummaryCard />
          </main>
        </div>
      </div>
    </div>
  )
}
