// trademark.zip/trademark/components/trademark-table.tsx

"use client"

import { Bookmark } from "lucide-react"
import type { Trademark } from "../lib/trademark-data"
import { Badge } from "@/shared/components/ui/badge"

interface TrademarkTableProps {
  trademarks: Trademark[]
  onToggleBookmark: (id: number, currentStatus: boolean) => void
}

export function TrademarkTable({ trademarks, onToggleBookmark }: TrademarkTableProps) {
  return (
    <div className="w-full">
      {/* PC 뷰 */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-18">로고</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">상표명 / 출원번호</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-24">상태</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-48">출원인</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-18">북마크</th>
            </tr>
          </thead>
          <tbody>
            {trademarks.map((trademark) => (
              <tr key={trademark.patentId} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  {/* API에 로고 이미지가 없으므로 이름의 첫 글자를 따서 보여줌 */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium bg-muted text-foreground border border-border">
                    {trademark.trademarkName.charAt(0)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-blue-600 hover:underline cursor-pointer font-medium text-sm">
                      {trademark.trademarkName}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {trademark.applicationNumber}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={trademark.status === "거절" ? "destructive" : "secondary"}>
                    {trademark.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{trademark.applicantName}</td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleBookmark(trademark.patentId, trademark.isBookmarked)
                    }}
                    className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer group"
                  >
                    <Bookmark
                      className={`w-5 h-5 transition-colors ${
                        trademark.isBookmarked
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 뷰 */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {trademarks.map((trademark) => (
          <div
            key={trademark.patentId}
            className="relative border border-border rounded-lg p-3 bg-card flex flex-col items-center text-center gap-2"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark(trademark.patentId, trademark.isBookmarked)
              }}
              className="absolute top-2 right-2 p-2 rounded-full z-10"
            >
              <Bookmark
                className={`w-4 h-4 ${trademark.isBookmarked ? "fill-foreground" : "text-muted-foreground"}`}
              />
            </button>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-medium bg-muted border border-border">
              {trademark.trademarkName.charAt(0)}
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-xs truncate">{trademark.trademarkName}</h3>
              <p className="text-[10px] text-muted-foreground truncate">{trademark.applicantName}</p>
              <div className="mt-2">
                <Badge className="text-[9px] px-1.5 py-0">{trademark.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}