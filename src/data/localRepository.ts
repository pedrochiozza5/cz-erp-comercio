import type { AppData } from '../domain/types'
import { demoData } from '../domain/seed'

const KEY = 'cz-erp-comercio/v1'
export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string,unknown>
  const collections = ['products','clients','suppliers','sales','purchases','stockMovements','ledger']
  return v.schemaVersion === 1 && collections.every(key => Array.isArray(v[key])) &&
    typeof v.nextSaleNumber === 'number' && typeof v.nextPurchaseNumber === 'number' &&
    (v.products as unknown[]).every(x => !!x && typeof x === 'object' && typeof (x as Record<string,unknown>).sku === 'string' && Number.isFinite((x as Record<string,unknown>).stock))
}
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return demoData()
    const parsed: unknown = JSON.parse(raw)
    if (isAppData(parsed)) return parsed
    // Se conserva el JSON inválido para posible recuperación manual.
    localStorage.setItem(`${KEY}/invalid-backup`, raw)
  } catch { /* Puede no estar disponible el almacenamiento del navegador */ }
  return demoData()
}
export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}
export function backupData(data: AppData) {
  const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = `cz-erp-backup-${new Date().toISOString().slice(0,10)}.json`
  link.click(); URL.revokeObjectURL(url)
}
export async function readBackup(file: File): Promise<AppData> {
  if (file.size > 10 * 1024 * 1024) throw new Error('El archivo supera el máximo de 10 MB para esta demo.')
  const data: unknown = JSON.parse(await file.text())
  if (!isAppData(data)) throw new Error('El JSON no tiene el formato esperado (schemaVersion 1).')
  return data
}
