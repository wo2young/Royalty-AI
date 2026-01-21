"use client"

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  ReferenceLine,
  Area,
} from "recharts"

interface HistoryDataPoint {
  date: string
  logoSimilarity: number
  nameSimilarity: number
}

interface BrandHistoryChartProps {
  data: HistoryDataPoint[]
}

export function BrandHistoryChart({ data }: BrandHistoryChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {/* 로고 유사도용 그라데이션 */}
            <linearGradient id="colorLogo" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-1))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-1))"
                stopOpacity={0}
              />
            </linearGradient>
            {/* 상호 유사도용 그라데이션 */}
            <linearGradient id="colorName" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-2))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-2))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          {/* 가로선만 남겨 가독성 향상 */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
          />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            dy={10}
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          />

          {/* 위험 기준선 (예: 70% 미만 경고) */}
          <ReferenceLine
            y={70}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{
              value: "주의",
              position: "right",
              fill: "hsl(var(--destructive))",
              fontSize: 10,
            }}
          />

          <Area
            type="monotone"
            dataKey="logoSimilarity"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorLogo)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="nameSimilarity"
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorName)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Legend verticalAlign="top" align="right" height={36} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
