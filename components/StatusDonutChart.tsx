'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DataPoint = {
  estado: string
  count: number
}

type Props = {
  data: DataPoint[]
}

const COLORS: Record<string, string> = {
  completed: '#10B981',
  failed: '#F43F5E',
  refunded: '#F59E0B',
}

const LABELS: Record<string, string> = {
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-900">{LABELS[payload[0].name] ?? payload[0].name}</p>
      <p className="font-mono text-gray-600">{payload[0].value} payments</p>
    </div>
  )
}

export default function StatusDonutChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="estado"
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell
              key={entry.estado}
              fill={COLORS[entry.estado] ?? '#94a3b8'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600">{LABELS[value] ?? value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
