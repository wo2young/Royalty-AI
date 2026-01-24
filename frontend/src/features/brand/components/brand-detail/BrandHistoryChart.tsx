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

interface HistoryDataPoint {
  date: string
  imageSimilarity: number
  textSimilarity: number
}

interface BrandHistoryChartProps {
  data: HistoryDataPoint[]
}

export function BrandHistoryChart({ data }: BrandHistoryChartProps) {
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
              dataKey="date"
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
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.96)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                padding: "12px",
              }}
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
              type="monotone"
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
              type="monotone"
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
