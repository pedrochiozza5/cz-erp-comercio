import type { AppData, CartLine, PaymentMethod, PriceTier, PurchaseLine } from './types'

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export const newId = () => crypto.randomUUID()
export const money = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(amount)
export const dateTime = (iso: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
export const dateShort = (iso: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(iso))
export const balanceFor = (data: AppData, clientId: string) => round(data.ledger.filter(x => x.clientId === clientId).reduce((acc, x) => acc + (x.kind === 'cargo' ? x.amount : -x.amount), 0))

function positive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} debe ser mayor a cero.`)
}
function normalizeLines<T extends { productId: string; qty: number }>(lines: T[]) {
  if (!lines.length) throw new Error('Agregá al menos un producto.')
  if (new Set(lines.map(x => x.productId)).size !== lines.length) throw new Error('Hay artículos duplicados en el pedido.')
  lines.forEach(x => positive(x.qty, 'La cantidad'))
  return lines
}
export function commitSale(data: AppData, input: { lines: CartLine[]; method: PaymentMethod; tier: PriceTier; clientId: string; note: string }): AppData {
  const lines = normalizeLines(input.lines)
  if (input.method === 'Cuenta corriente' && !input.clientId) throw new Error('Elegí un cliente para vender en cuenta corriente.')
  if (input.clientId && !data.clients.some(x => x.id === input.clientId)) throw new Error('El cliente seleccionado no existe.')
  const items = lines.map(line => {
    const product = data.products.find(p => p.id === line.productId)
    if (!product || !product.active) throw new Error('Uno de los productos ya no está disponible.')
    if (product.stock < line.qty) throw new Error(`Stock insuficiente de ${product.name}. Hay ${product.stock} ${product.unit}.`)
    const unitPrice = input.tier === 'mayorista' ? product.wholesalePrice : product.price
    positive(unitPrice, `El precio de ${product.name}`)
    return { productId: product.id, sku: product.sku, name: product.name, qty: line.qty, unitPrice, subtotal: round(unitPrice * line.qty) }
  })
  const total = round(items.reduce((sum, item) => sum + item.subtotal, 0))
  if (input.method === 'Cuenta corriente') {
    const client = data.clients.find(c => c.id === input.clientId)!
    if (client.creditLimit > 0 && balanceFor(data, client.id) + total > client.creditLimit) throw new Error(`La operación supera el límite de crédito de ${client.name}.`)
  }
  const date = new Date().toISOString()
  const saleId = newId()
  const number = data.nextSaleNumber
  return {
    ...data, nextSaleNumber: number + 1,
    products: data.products.map(p => ({ ...p, stock: round(p.stock - (lines.find(l => l.productId === p.id)?.qty ?? 0)) })),
    sales: [{ id: saleId, number, createdAt: date, clientId: input.clientId, method: input.method, tier: input.tier, items, total, note: input.note }, ...data.sales],
    stockMovements: [...items.map(item => ({ id: newId(), createdAt: date, productId: item.productId, kind: 'venta' as const, delta: -item.qty, reason: 'Venta confirmada', reference: `V-${number.toString().padStart(5, '0')}` })), ...data.stockMovements],
    ledger: input.method === 'Cuenta corriente' ? [{ id: newId(), createdAt: date, clientId: input.clientId, kind: 'cargo' as const, amount: total, note: `Venta interna N.º ${number}`, saleId }, ...data.ledger] : data.ledger
  }
}
export function commitPurchase(data: AppData, input: { lines: PurchaseLine[]; supplierId: string; note: string }): AppData {
  if (!data.suppliers.some(s => s.id === input.supplierId)) throw new Error('Elegí un proveedor.')
  const lines = normalizeLines(input.lines)
  const items = lines.map(line => {
    const product = data.products.find(p => p.id === line.productId)
    if (!product) throw new Error('Producto inexistente.')
    positive(line.unitCost, 'El costo')
    return { productId: product.id, name: product.name, qty: line.qty, unitCost: line.unitCost, subtotal: round(line.qty * line.unitCost) }
  })
  const date = new Date().toISOString(), number = data.nextPurchaseNumber
  return {
    ...data, nextPurchaseNumber: number + 1,
    products: data.products.map(p => {
      const line = lines.find(l => l.productId === p.id)
      return line ? { ...p, stock: round(p.stock + line.qty), cost: line.unitCost, supplierId: input.supplierId } : p
    }),
    purchases: [{ id: newId(), number, createdAt: date, supplierId: input.supplierId, items, total: round(items.reduce((sum, i) => sum + i.subtotal, 0)), note: input.note }, ...data.purchases],
    stockMovements: [...items.map(i => ({ id: newId(), createdAt: date, productId: i.productId, kind: 'compra' as const, delta: i.qty, reason: 'Ingreso de compra', reference: `C-${number.toString().padStart(5, '0')}` })), ...data.stockMovements]
  }
}
export function adjustStock(data: AppData, productId: string, delta: number, reason: string): AppData {
  const product = data.products.find(p => p.id === productId)
  if (!product) throw new Error('Producto inexistente.')
  if (!Number.isFinite(delta) || delta === 0) throw new Error('Ingresá una variación distinta de cero.')
  if (product.stock + delta < 0) throw new Error('El ajuste dejaría el stock en negativo.')
  if (!reason.trim()) throw new Error('Indicá el motivo del ajuste.')
  return {
    ...data,
    products: data.products.map(p => p.id === productId ? { ...p, stock: round(p.stock + delta) } : p),
    stockMovements: [{ id: newId(), createdAt: new Date().toISOString(), productId, kind: 'ajuste', delta, reason: reason.trim(), reference: 'AJUSTE' }, ...data.stockMovements]
  }
}
export function registerPayment(data: AppData, clientId: string, amount: number, note: string): AppData {
  positive(amount, 'El cobro')
  const client = data.clients.find(c => c.id === clientId)
  if (!client) throw new Error('Cliente inexistente.')
  if (round(amount) > balanceFor(data, clientId)) throw new Error('El cobro supera el saldo pendiente.')
  return { ...data, ledger: [{ id: newId(), createdAt: new Date().toISOString(), clientId, kind: 'pago', amount: round(amount), note: note.trim() || 'Cobro en cuenta corriente', saleId: '' }, ...data.ledger] }
}
