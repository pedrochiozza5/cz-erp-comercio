export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cuenta corriente'
export type PriceTier = 'minorista' | 'mayorista'
export type View = 'dashboard' | 'pos' | 'products' | 'clients' | 'suppliers' | 'purchases' | 'stock' | 'sales' | 'settings'

export interface Product {
  id: string
  sku: string
  barcode: string
  name: string
  category: string
  brand: string
  unit: string
  stock: number
  minStock: number
  cost: number
  price: number
  wholesalePrice: number
  supplierId: string
  active: boolean
  createdAt: string
}
export interface Client {
  id: string
  name: string
  taxId: string
  taxCondition: string
  phone: string
  address: string
  creditLimit: number
  createdAt: string
}
export interface Supplier {
  id: string
  name: string
  taxId: string
  phone: string
  email: string
  createdAt: string
}
export interface SaleItem { productId: string; sku: string; name: string; qty: number; unitPrice: number; subtotal: number }
export interface Sale {
  id: string; number: number; createdAt: string; clientId: string; items: SaleItem[]
  total: number; method: PaymentMethod; tier: PriceTier; note: string
}
export interface PurchaseItem { productId: string; name: string; qty: number; unitCost: number; subtotal: number }
export interface Purchase { id: string; number: number; createdAt: string; supplierId: string; items: PurchaseItem[]; total: number; note: string }
export interface StockMovement {
  id: string; createdAt: string; productId: string; kind: 'venta' | 'compra' | 'ajuste'
  delta: number; reason: string; reference: string
}
export interface LedgerEntry {
  id: string; createdAt: string; clientId: string; kind: 'cargo' | 'pago'; amount: number; note: string; saleId: string
}
export interface AppData {
  schemaVersion: 1
  products: Product[]
  clients: Client[]
  suppliers: Supplier[]
  sales: Sale[]
  purchases: Purchase[]
  stockMovements: StockMovement[]
  ledger: LedgerEntry[]
  nextSaleNumber: number
  nextPurchaseNumber: number
}
export interface CartLine { productId: string; qty: number }
export interface PurchaseLine { productId: string; qty: number; unitCost: number }
