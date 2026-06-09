'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

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

const RADIAN = Math.PI / 180

function SliceLabel(props: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props
  if (percent < 0.08) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function StatusDonutChart({ data }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)
  const selectedEntry = selected ? data.find((d) => d.estado === selected) ?? null : null
  const selectedPct = selectedEntry ? Math.round((selectedEntry.count / total) * 100) : 0

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="estado"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            label={SliceLabel}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.estado}
                fill={COLORS[entry.estado] ?? '#94a3b8'}
                opacity={selected && selected !== entry.estado ? 0.45 : 1}
                stroke={selected === entry.estado ? 'white' : 'transparent'}
                strokeWidth={selected === entry.estado ? 2 : 0}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={() =>
                  setSelected((prev) => (prev === entry.estado ? null : entry.estado))
                }
              />
            ))}
          </Pie>
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#4b5563' }}>{LABELS[value] ?? value}</span>
            )}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Click detail box */}
      <div className="h-12 flex items-center">
        {selectedEntry ? (
          <div
            className="w-full px-4 py-2.5 rounded-lg border text-sm flex items-center gap-2.5 transition-all"
            style={{
              borderColor: `${COLORS[selectedEntry.estado]}50`,
              backgroundColor: `${COLORS[selectedEntry.estado]}12`,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[selectedEntry.estado] }}
            />
            <span className="font-semibold" style={{ color: COLORS[selectedEntry.estado] }}>
              {LABELS[selectedEntry.estado]}
            </span>
            <span className="text-gray-400">—</span>
            <span className="text-gray-700">{selectedEntry.count} payments</span>
            <span
              className="ml-auto font-mono font-bold"
              style={{ color: COLORS[selectedEntry.estado] }}
            >
              {selectedPct}%
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 w-full text-center">
            Click a slice to see details
          </p>
        )}
      </div>
    </div>
  )
}
