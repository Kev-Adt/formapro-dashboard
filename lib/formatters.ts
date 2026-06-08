// Approximate conversion rates to COP (hardcoded)
export const USD_TO_COP = 4200
export const EUR_TO_COP = 4600

export function toCOP(importe: number, moneda: string): number {
  if (moneda === 'USD') return importe * USD_TO_COP
  if (moneda === 'EUR') return importe * EUR_TO_COP
  return importe
}

// COP: decimal style with dot thousands separator, e.g. "150.000 COP"
// USD: currency style with $ prefix,                 e.g. "$60.00 USD"
// EUR: currency style with € prefix (en-US locale),  e.g. "€50.00 EUR"
type CurrencyConfig = {
  locale: string
  style: 'decimal' | 'currency'
  minimumFractionDigits: number
  maximumFractionDigits: number
}

const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  COP: { locale: 'es-CO', style: 'decimal',   minimumFractionDigits: 0, maximumFractionDigits: 0 },
  USD: { locale: 'en-US', style: 'currency',  minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { locale: 'en-US', style: 'currency',  minimumFractionDigits: 2, maximumFractionDigits: 2 },
}

export function formatCurrency(amount: number, moneda: string): string {
  const currency = moneda || 'USD'
  const config = CURRENCY_CONFIG[currency] ?? { locale: 'en-US', style: 'currency' as const, minimumFractionDigits: 2, maximumFractionDigits: 2 }

  const formatted = new Intl.NumberFormat(config.locale, {
    style: config.style,
    ...(config.style === 'currency' ? { currency } : {}),
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(amount)

  return `${formatted} ${currency}`
}

export function formatDate(fecha: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}
