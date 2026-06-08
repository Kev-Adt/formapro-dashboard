type KpiCardProps = {
  title: string
  value: string
  subtitle?: string
  badge?: string
  icon?: React.ReactNode
}

export default function KpiCard({ title, value, subtitle, badge, icon }: KpiCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4 sm:p-6 flex flex-col gap-1 min-w-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {badge && (
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded font-mono leading-none text-[#3525cd] bg-[#eff4ff] border border-[#c7d2fe]">
              {badge}
            </span>
          )}
        </div>
        {icon && <span className="text-gray-300">{icon}</span>}
      </div>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 font-mono tracking-tight break-all">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}
