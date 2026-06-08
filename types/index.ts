export type Pago = {
  id_pago: string
  email: string
  nombre: string
  curso: string
  importe: number
  moneda: string
  estado: 'completed' | 'failed' | 'refunded'
  fecha: string
}

export type EstadoFilter = 'all' | 'completed' | 'failed' | 'refunded'
