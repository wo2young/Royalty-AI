"use client"

import { Bookmark } from "lucide-react"
import type { Trademark } from "../lib/trademark-data"
import { Badge } from "@/shared/components/ui/badge"

interface TrademarkTableProps {
  trademarks: Trademark[]
  onToggleBookmark: (id: string) => void
}

export function TrademarkTable({ trademarks, onToggleBookmark }: TrademarkTableProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-24">로고</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">상표명</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-32">카테고리</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-32">등록일자</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-24">출원인</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm w-20">북마크</th>
          </tr>
        </thead>
        <tbody>
          {trademarks.map((trademark) => (
            <tr key={trademark.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${trademark.logoColor} border border-border`}>
                  {trademark.logo}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                    {trademark.name}
                  </span>
                  {trademark.isExpiring && (
                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 text-xs">
                      소멸 예정
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground text-sm">{trademark.category}</td>
              <td className="py-3 px-4 text-blue-600 text-sm">{trademark.registrationDate}</td>
              <td className="py-3 px-4 text-muted-foreground text-sm">{trademark.applicant}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => onToggleBookmark(trademark.id)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      trademark.isBookmarked
                        ? "fill-foreground text-foreground"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
