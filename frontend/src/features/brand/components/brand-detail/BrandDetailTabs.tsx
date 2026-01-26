import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LayoutDashboard, BarChart3, Brain, Fingerprint } from "lucide-react"

const tabs = [
  { id: "summary", label: "종합분석", icon: LayoutDashboard },
  { id: "ai", label: "AI분석", icon: Brain },
  { id: "history", label: "변천사", icon: BarChart3 },
  { id: "bi", label: "BI", icon: Fingerprint },
]

export function BrandDetailTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl w-fit border border-slate-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-300 rounded-xl",
              isActive ? "text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="h-4 w-4 z-10" />
            <span className="z-10">{tab.label}</span>

            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white shadow-sm border border-slate-200/50 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
