'use client'

import { useState, useMemo } from 'react'
import type { Pago } from '@/types'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'

type SortKey = 'fecha' | 'importe'
type SortDir = 'asc' | 'desc'

type Props = {
  data: Pago[]
  paginated?: boolean
}

const PAGE_SIZE = 10

export default function PaymentsTable({ data, paginated = false }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortKey === 'fecha') {
        const diff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        return sortDir === 'asc' ? diff : -diff
      }
      const diff = a.importe - b.importe
      return sortDir === 'asc' ? diff : -diff
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const displayed = paginated ? sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : sorted

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) {
      return (
        <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDir === 'asc' ? (
      <svg className="w-3.5 h-3.5" style={{ color: '#3525cd' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5" style={{ color: '#3525cd' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Course</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">
                <button
                  className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  onClick={() => toggleSort('importe')}
                >
                  Amount
                  <SortIcon col="importe" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                <button
                  className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  onClick={() => toggleSort('fecha')}
                >
                  Date
                  <SortIcon col="fecha" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No payments found
                </td>
              </tr>
            ) : (
              displayed.map((p) => (
                <tr key={p.id_pago} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[100px] truncate">
                    {p.id_pago}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{p.email}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{p.curso}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(p.importe, p.moneda)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estado={p.estado} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(p.fecha)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e8f0] bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of{' '}
            {sorted.length} payments
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium border border-[#e2e8f0] rounded-md disabled:opacity-40 hover:bg-white transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-medium border border-[#e2e8f0] rounded-md disabled:opacity-40 hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
