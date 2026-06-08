'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pago } from '@/types'
import Sidebar from '@/components/Sidebar'
import KpiCard from '@/components/KpiCard'
import RevenueBarChart from '@/components/RevenueBarChart'
import StatusDonutChart from '@/components/StatusDonutChart'
import { formatCurrency, formatDate, toCOP } from '@/lib/formatters'

export default function AnalyticsPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('pagos')
      .select('*')
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

  const revenueByCurso = useMemo(() => {
    const map: Record<string, number> = {}
    completed.forEach((p) => {
      map[p.curso] = (map[p.curso] ?? 0) + toCOP(p.importe, p.moneda)
    })
    return Object.entries(map)
      .map(([curso, revenue]) => ({ curso, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [completed])

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {}
    pagos.forEach((p) => {
      map[p.estado] = (map[p.estado] ?? 0) + 1
    })
    return Object.entries(map).map(([estado, count]) => ({ estado, count }))
  }, [pagos])

  const bestCurso = revenueByCurso[0]

  const busiestDay = useMemo(() => {
    if (pagos.length === 0) return null
    const map: Record<string, number> = {}
    pagos.forEach((p) => {
      const day = p.fecha.slice(0, 10)
      map[day] = (map[day] ?? 0) + 1
    })
    const [day, count] = Object.entries(map).sort((a, b) => b[1] - a[1])[0]
    return { day, count }
  }, [pagos])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0" style={{ marginLeft: '280px' }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 border-b border-[#e2e8f0] px-8 py-4"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-500">Revenue and payment trends</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Error banner */}
          {fetchError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700">
              <strong>Supabase error:</strong> {fetchError}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#e2e8f0] rounded-lg h-28 animate-pulse"
                />
              ))
            ) : (
              <>
                <KpiCard
                  title="Best Selling Course"
                  value={bestCurso?.curso ?? '–'}
                  subtitle={
                    bestCurso
                      ? `${formatCurrency(bestCurso.revenue, 'COP')} revenue (converted)`
                      : 'No completed payments'
                  }
                  badge="COP"
                />
                <KpiCard
                  title="Busiest Day"
                  value={busiestDay ? formatDate(busiestDay.day) : '–'}
                  subtitle={busiestDay ? `${busiestDay.count} payments` : 'No data'}
                />
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Revenue by course */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Revenue by Course</h2>
              <p className="text-xs text-gray-400 mb-4">All currencies converted to COP</p>
              {loading ? (
                <div className="h-64 animate-pulse bg-gray-100 rounded" />
              ) : (
                <RevenueBarChart data={revenueByCurso} moneda="COP" />
              )}
            </div>

            {/* Status distribution */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Payment Status</h2>
              <p className="text-xs text-gray-400 mb-4">Distribution by status</p>
              {loading ? (
                <div className="h-64 animate-pulse bg-gray-100 rounded" />
              ) : (
                <StatusDonutChart data={statusDistribution} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
