interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col flex-1 items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
      {icon}
    </div>
    <h3 className="text-sm font-medium text-foreground">{title}</h3>
    {description && (
      <p className="text-xs text-muted-foreground mt-1 mb-6 text-center">
        {description}
      </p>
    )}
    {action}
  </div>
)
