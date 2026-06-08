import type { Pago } from '@/types'

type Props = {
  estado: Pago['estado']
}

const config: Record<Pago['estado'], { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
}

export default function StatusBadge({ estado }: Props) {
  const { label, className } = config[estado] ?? config.failed
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          estado === 'completed'
            ? 'bg-emerald-500'
            : estado === 'failed'
            ? 'bg-rose-500'
            : 'bg-amber-500'
        }`}
      />
      {label}
    </span>
  )
}
