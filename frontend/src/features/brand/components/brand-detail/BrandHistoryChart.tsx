import { Card } from "@/shared/components/ui/card"
import { BarChart3 } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import type { HistoryData } from "../../types"

interface BrandHistoryProps {
  data: HistoryData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: HistoryData
  }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-white/96 rounded-xl shadow-lg border-none p-3 min-w-50">
      {data.imagePath && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={data.imagePath}
            alt="Brand logo"
            className="w-full h-24 object-contain bg-gray-50"
          />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-900">{data.createdAt}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-600">로고 유사도</span>
            <span className="text-xs font-semibold text-[#162556]">
              {data.imageSimilarity}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-600">상호 유사도</span>
            <span className="text-xs font-semibold text-[#6366f1]">
              {data.textSimilarity}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BrandHistoryChart({ data }: BrandHistoryProps) {
  const colors = {
    primary: "#162556",
    secondary: "#6366f1",
    grid: "#f1f5f9",
    text: "#64748b",
  }

  return (
    <Card className="border shadow-sm p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-primary font-bold">
          <BarChart3 className="h-5 w-5" /> 상표 변천사 추이
        </h3>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={colors.grid}
              strokeDasharray="0"
            />

            <XAxis
              dataKey="createdAt"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: colors.text, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: colors.text }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: colors.primary,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              height={40}
              iconType="circle"
              wrapperStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: colors.primary,
              }}
            />

            <Area
              name="로고 유사도"
              type="linear"
              dataKey="imageSimilarity"
              stroke={colors.primary}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorImage)"
              dot={{
                r: 4,
                fill: "white",
                stroke: colors.primary,
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, strokeWidth: 0, fill: colors.primary }}
            />
            <Area
              name="상호 유사도"
              type="linear"
              dataKey="textSimilarity"
              stroke={colors.secondary}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorText)"
              dot={{
                r: 4,
                fill: "white",
                stroke: colors.secondary,
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, strokeWidth: 0, fill: colors.secondary }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
