import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowLeftRight, ArrowRight, BarChart3, Boxes, Check, CircleAlert, Minus, Package, ShoppingBag, Wallet, ArrowUpRight } from 'lucide-react'
import type { AppData, PaymentMethod, View } from './domain/types'
import { balanceFor, dateTime, money } from './domain/operations'

type IconComponent = typeof Package
const qNum = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
const clientName = (data: AppData, id: string) => data.clients.find(c => c.id === id)?.name ?? 'Mostrador'
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function Pill({ children, tone }: { children: ReactNode; tone: 'green' | 'amber' | 'red' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}
function Empty({ icon: Icon, title, desc }: { icon: IconComponent; title: string; desc: string }) {
  return <div className="empty"><Icon size={30} strokeWidth={1.6}/><h3>{title}</h3><p>{desc}</p></div>
}
function KpiCard({ icon: Icon, title, value, detail, color, trend }: { icon: IconComponent; title: string; value: string; detail: string; color: 'blue' | 'green' | 'amber' | 'purple'; trend?: ReactNode }) {
  return <div className="stat"><div className="stat-top"><div className={`stat-icon stat-${color}`}><Icon size={19}/></div>{trend}</div><p>{title}</p><strong>{value}</strong><span>{detail}</span></div>
}
function Trend({ current, previous }: { current: number; previous: number }) {
  // Sin base de comparación (ayer sin ventas) no se muestra porcentaje: sería infinito o engañoso.
  if (previous <= 0) return null
  const pct = (current - previous) / previous * 100
  if (Math.abs(pct) < 1) return <span className="trend trend-flat" title="Igual que ayer"><Minus size={12}/> = ayer</span>
  const up = pct > 0
  const text = Math.abs(pct) > 500 ? '+500%' : `${up ? '+' : '−'}${Math.abs(pct).toFixed(0)}%`
  return <span className={`trend ${up ? 'trend-up' : 'trend-down'}`} title="Ventas de hoy (parcial) vs. el total de ayer">{up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}{Math.abs(pct) > 500 ? '>' : ''}{text} vs ayer</span>
}

export default function Dashboard({ data, onNavigate }: { data: AppData; onNavigate: (v: View) => void }) {
  const activeProducts = data.products.filter(p => p.active)
  const outOfStock = activeProducts.filter(p => p.stock <= 0)
  const stockAlerts = activeProducts.filter(p => p.stock <= p.minStock)
  const lowOnly = stockAlerts.length - outOfStock.length
  const healthy = activeProducts.length - stockAlerts.length

  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(now.getDate() - (6 - i)); return d })
  const totals = new Map<string, { total: number; count: number }>(days.map(d => [dayKey(d), { total: 0, count: 0 }]))
  const weekSales = data.sales.filter(s => totals.has(dayKey(new Date(s.createdAt))))
  weekSales.forEach(s => { const t = totals.get(dayKey(new Date(s.createdAt)))!; t.total += s.total; t.count += 1 })
  const series = days.map(d => ({ date: d, ...totals.get(dayKey(d))! }))
  const todayStats = series[6], yesterdayStats = series[5]
  const weekTotal = weekSales.reduce((s, x) => s + x.total, 0)
  const maxDay = Math.max(...series.map(x => x.total), 0)

  const methods = (['Efectivo', 'Transferencia', 'Tarjeta', 'Cuenta corriente'] as PaymentMethod[])
    .map(m => ({ method: m, total: weekSales.filter(s => s.method === m).reduce((s, x) => s + x.total, 0) }))
    .filter(x => x.total > 0).sort((a, b) => b.total - a.total)

  const debt = data.clients.reduce((sum, c) => sum + Math.max(0, balanceFor(data, c.id)), 0)
  const debtors = data.clients.filter(c => balanceFor(data, c.id) > 0).length
  const stockValue = data.products.reduce((sum, p) => sum + p.stock * p.cost, 0)
  const top = [...data.products].filter(p => p.stock * p.cost > 0).sort((a, b) => b.stock * b.cost - a.stock * a.cost).slice(0, 5)
  const topMax = top[0] ? top[0].stock * top[0].cost : 0
  const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })

  return <div className="dashboard-page">
    <div className="stats-grid">
      <KpiCard icon={Wallet} color="blue" title="Ventas de hoy" value={money(todayStats.total)} detail={`${todayStats.count} ${todayStats.count === 1 ? 'operación' : 'operaciones'} · ayer ${money(yesterdayStats.total)}`} trend={<Trend current={todayStats.total} previous={yesterdayStats.total}/>}/>
      <KpiCard icon={Package} color="green" title="Artículos activos" value={qNum(activeProducts.length)} detail={`${qNum(data.products.length - activeProducts.length)} inactivos en el catálogo`}/>
      <KpiCard icon={CircleAlert} color="amber" title="Alertas de stock" value={qNum(stockAlerts.length)} detail={stockAlerts.length ? `${qNum(outOfStock.length)} sin existencias` : 'Todo por encima del mínimo'}/>
      <KpiCard icon={ArrowLeftRight} color="purple" title="Cuentas a cobrar" value={money(debt)} detail={debtors ? `${debtors} ${debtors === 1 ? 'cliente con saldo' : 'clientes con saldo'}` : 'Sin saldos pendientes'}/>
    </div>

    <div className="two-cols dash-main">
      <section className="panel">
        <div className="panel-head"><div><h2>Ventas de los últimos 7 días</h2><p>{weekSales.length ? `${money(weekTotal)} en ${weekSales.length} ${weekSales.length === 1 ? 'operación' : 'operaciones'}` : 'Evolución diaria de ingresos'}</p></div></div>
        {weekSales.length ? <div className="week-chart" role="img" aria-label="Ventas por día de los últimos 7 días">
          {series.map((d, i) => <div className={`week-col ${i === 6 ? 'is-today' : ''}`} key={i} title={`${d.date.toLocaleDateString('es-AR')}: ${money(d.total)} (${d.count})`}>
            <span className="week-value">{d.total ? money(d.total) : ''}</span>
            <div className="week-track"><div className="week-bar" style={{ height: `${maxDay ? (d.total ? Math.max(3, d.total / maxDay * 100) : 0) : 0}%` }}/></div>
            <span className="week-label">{weekday.format(d.date).replace('.', '')}</span>
          </div>)}
        </div> : <Empty icon={BarChart3} title="Todavía no hay ventas esta semana" desc="El gráfico se completa automáticamente con las ventas que registres en el punto de venta."/>}
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Medios de pago</h2><p>Últimos 7 días</p></div></div>
        {methods.length ? <div className="method-list">
          {methods.map(m => <div className="method-row" key={m.method}><div className="method-top"><span>{m.method}</span><b>{money(m.total)}</b><small>{(m.total / weekTotal * 100).toFixed(0)}%</small></div><div className="bar-bg"><div style={{ width: `${m.total / weekTotal * 100}%` }}/></div></div>)}
        </div> : <Empty icon={Wallet} title="Sin cobros registrados" desc="Verás cómo se reparten efectivo, transferencias, tarjeta y cuenta corriente."/>}
      </section>
    </div>

    <div className="two-cols dash-main">
      <section className="panel">
        <div className="panel-head"><div><h2>Últimas ventas</h2><p>Operaciones más recientes</p></div><button className="text-link" onClick={() => onNavigate('sales')}>Ver todas <ArrowRight size={16}/></button></div>
        {data.sales.length ? <div className="recent-list">{data.sales.slice(0, 5).map(s => <div className="recent-row" key={s.id}><div className="recent-icon"><ShoppingBag size={18}/></div><div className="recent-main"><strong>Venta #{String(s.number).padStart(5, '0')}</strong><span>{clientName(data, s.clientId)} · {dateTime(s.createdAt)}</span></div><b>{money(s.total)}</b></div>)}</div>
          : <Empty icon={ShoppingBag} title="Sin ventas todavía" desc="Registrá tu primera venta desde el punto de venta."/>}
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Estado del inventario</h2><p>Productos activos según su mínimo</p></div><button className="text-link" onClick={() => onNavigate('stock')}>Inventario <ArrowRight size={16}/></button></div>
        {activeProducts.length ? <>
          <div className="health-bar" role="img" aria-label={`${healthy} normales, ${lowOnly} bajo mínimo, ${outOfStock.length} sin stock`}>
            {healthy > 0 && <div className="h-ok" style={{ flex: healthy }}/>}{lowOnly > 0 && <div className="h-low" style={{ flex: lowOnly }}/>}{outOfStock.length > 0 && <div className="h-out" style={{ flex: outOfStock.length }}/>}
          </div>
          <div className="health-legend"><span><i className="h-ok"/>Normal <b>{healthy}</b></span><span><i className="h-low"/>Reponer <b>{lowOnly}</b></span><span><i className="h-out"/>Sin stock <b>{outOfStock.length}</b></span></div>
          {stockAlerts.length ? <div className="alert-list">{stockAlerts.slice(0, 4).map(p => <div className="alert-row" key={p.id}><div><strong>{p.name}</strong><span>{p.sku}</span></div><Pill tone={p.stock <= 0 ? 'red' : 'amber'}>{qNum(p.stock)} {p.unit}</Pill></div>)}</div>
            : <Empty icon={Check} title="Todo en orden" desc="Los artículos están por encima de su mínimo."/>}
        </> : <Empty icon={Boxes} title="Sin artículos activos" desc="Cargá productos en el catálogo para controlar su inventario."/>}
      </section>
    </div>

    <div className="two-cols dash-main">
      <section className="panel">
        <div className="panel-head"><div><h2>Valor del inventario</h2><p>Estimado según último costo cargado</p></div><span className="panel-tag">Costo de reposición ilustrativo</span></div>
        <div className="inventory-total">{money(stockValue)}</div>
        <p className="panel-help">No equivale al valor contable ni incluye impuestos, gastos o mermas.</p>
      </section>
      <section className="panel">
        <div className="panel-head"><div><h2>Artículos con más capital</h2><p>Stock valorizado al costo registrado</p></div></div>
        {top.length ? <div className="mini-bars">{top.map(p => <div className="mini-bar-row" key={p.id}><span title={p.name}>{p.name}</span><div className="bar-bg"><div style={{ width: `${Math.max(4, p.stock * p.cost / topMax * 100)}%` }}/></div><b>{money(p.stock * p.cost)}</b></div>)}</div>
          : <Empty icon={Package} title="Sin stock valorizado" desc="Aparecerán los artículos con existencias y costo cargado."/>}
      </section>
    </div>
  </div>
}
