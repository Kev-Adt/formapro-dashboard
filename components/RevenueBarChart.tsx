'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/formatters'

type DataPoint = {
  curso: string
  revenue: number
}

type Props = {
  data: DataPoint[]
  moneda?: string
}

function CustomTooltip({
  active,
  payload,
  label,
  moneda,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  moneda: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-900 mb-1 max-w-[180px] truncate">{label}</p>
      <p className="font-mono" style={{ color: '#3525cd' }}>
        {formatCurrency(payload[0].value, moneda)}
      </p>
    </div>
  )
}

export default function RevenueBarChart({ data, moneda = 'USD' }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="curso"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => {
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
            if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
            return String(v)
          }}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip moneda={moneda} />} cursor={{ fill: '#f5f3ff' }} />
        <Bar dataKey="revenue" fill="#3525cd" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
