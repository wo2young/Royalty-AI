import { motion } from "framer-motion"
import { type LucideIcon, Sparkles } from "lucide-react"

interface TabEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  onAction?: () => void
  actionLabel?: string
}

export function TabEmptyState({
  icon: Icon,
  title,
  description,
  onAction,
  actionLabel,
}: TabEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-4xl border border-slate-200/60 bg-white/50 p-12 shadow-xl shadow-slate-200/40 backdrop-blur-sm"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 shadow-inner">
          <Icon className="h-10 w-10 text-slate-400" />
        </div>

        <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mb-8 max-w-70 text-sm leading-relaxed text-slate-500">
          {description}
        </p>

        {onAction && (
          <button
            onClick={onAction}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/30"
          >
            <Sparkles className="h-4 w-4" />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
