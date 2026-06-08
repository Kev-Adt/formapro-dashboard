'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Pago, EstadoFilter } from '@/types'
import AppShell from '@/components/AppShell'
import KpiCard from '@/components/KpiCard'
import PaymentsTable from '@/components/PaymentsTable'
import RevenueBarChart from '@/components/RevenueBarChart'
import { formatCurrency, toCOP } from '@/lib/formatters'

const FILTER_TABS: { label: string; value: EstadoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
]

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

export default function DashboardPage() {
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

  const completed = useMemo(() => pagos.filter((p) => p.estado === 'completed'), [pagos])
  const refundedCount = useMemo(() => pagos.filter((p) => p.estado === 'refunded').length, [pagos])

  const totalRevenue = useMemo(
    () => completed.reduce((s, p) => s + toCOP(p.importe, p.moneda), 0),
    [completed]
  )
  const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0

  const revenueByCurso = useMemo(() => {
    const map: Record<string, number> = {}
    completed.forEach((p) => {
      map[p.curso] = (map[p.curso] ?? 0) + toCOP(p.importe, p.moneda)
    })
    return Object.entries(map)
      .map(([curso, revenue]) => ({ curso, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [completed])

  const filteredPagos = useMemo(() => {
    return pagos
      .filter((p) => {
        const q = search.toLowerCase()
        const matchSearch =
          !q || p.nombre.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
        const matchEstado = estadoFilter === 'all' || p.estado === estadoFilter
        return matchSearch && matchEstado
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [pagos, search, estadoFilter])

  const tableData = useMemo(() => filteredPagos.slice(0, 10), [filteredPagos])

  return (
    <AppShell>
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div
          className="sticky top-14 lg:top-0 z-10 border-b border-[#e2e8f0] px-4 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500">Overview of all FormaPro payments</p>
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

        <div className="p-4 lg:p-8 space-y-6">
          {/* Error banner */}
          {fetchError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700">
              <strong>Supabase error:</strong> {fetchError}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#e2e8f0] rounded-lg h-28 animate-pulse"
                />
              ))
            ) : (
              <>
                <KpiCard
                  title="Total Revenue"
                  value={formatCurrency(totalRevenue, 'COP')}
                  subtitle="USD and EUR converted to COP (approx. rate)"
                  badge="COP"
                />
                <KpiCard
                  title="Total Payments"
                  value={pagos.length.toLocaleString()}
                  subtitle="All transactions"
                />
                <KpiCard
                  title="Total Refunds"
                  value={refundedCount.toLocaleString()}
                  subtitle="Refunded transactions"
                />
                <KpiCard
                  title="Avg. Ticket"
                  value={formatCurrency(avgTicket, 'COP')}
                  subtitle="Per completed COP payment"
                  badge="COP"
                />
              </>
            )}
          </div>

          {/* Filters + Table + Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Table section (2/3 width) */}
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-1">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setEstadoFilter(tab.value)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        estadoFilter === tab.value
                          ? 'text-white'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={estadoFilter === tab.value ? { backgroundColor: '#3525cd' } : {}}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => exportCSV(filteredPagos)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-[#e2e8f0] rounded-lg bg-white hover:bg-gray-50 transition-colors"
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
              {loading ? (
                <div className="bg-white border border-[#e2e8f0] rounded-lg h-64 animate-pulse" />
              ) : (
                <>
                  <PaymentsTable data={tableData} />
                  <div className="flex justify-end mt-2">
                    <Link
                      href="/payments"
                      className="text-sm font-medium hover:underline"
                      style={{ color: '#3525cd' }}
                    >
                      View all →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Chart (1/3 width) */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Revenue by Course</h2>
              <p className="text-xs text-gray-400 mb-4">All currencies converted to COP</p>
              {loading ? (
                <div className="h-64 animate-pulse bg-gray-100 rounded" />
              ) : (
                <RevenueBarChart data={revenueByCurso} moneda="COP" />
              )}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
