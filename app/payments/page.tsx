'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pago, EstadoFilter } from '@/types'
import Sidebar from '@/components/Sidebar'
import PaymentsTable from '@/components/PaymentsTable'

function exportCSV(rows: Pago[], filename = 'pagos.csv') {
  const headers = ['id_pago', 'nombre', 'email', 'curso', 'importe', 'moneda', 'estado', 'fecha']
  const lines = rows.map((p) =>
    [p.id_pago, p.nombre, p.email, p.curso, p.importe, p.moneda, p.estado, p.fecha]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const ESTADO_OPTIONS: { label: string; value: EstadoFilter }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
]

export default function PaymentsPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('all')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('pagos')
      .select('*')
      .order('fecha', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setFetchError(error.message)
        } else {
          setPagos((data ?? []) as Pago[])
        }
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filteredPagos = useMemo(() => {
    return pagos.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q || p.nombre.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      const matchEstado = estadoFilter === 'all' || p.estado === estadoFilter
      return matchSearch && matchEstado
    })
  }, [pagos, search, estadoFilter])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0" style={{ marginLeft: '280px' }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
            <p className="text-xs text-gray-500">All transactions with filtering and sorting</p>
          </div>
          <div className="relative flex-shrink-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white w-72 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd]"
            />
          </div>
        </div>

        <div className="p-8 space-y-4">
          {/* Error banner */}
          {fetchError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700">
              <strong>Supabase error:</strong> {fetchError}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)}
                className="text-sm border border-[#e2e8f0] rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd]"
              >
                {ESTADO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {loading ? '–' : filteredPagos.length} result{filteredPagos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => exportCSV(filteredPagos)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-[#e2e8f0] rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white border border-[#e2e8f0] rounded-lg h-96 animate-pulse" />
          ) : (
            <PaymentsTable data={filteredPagos} paginated />
          )}
        </div>
      </main>
    </div>
  )
}
