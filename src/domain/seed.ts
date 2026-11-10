import type { AppData, Product, Supplier, Client } from './types'
import { commitSale } from './operations'

const now = () => new Date().toISOString()
const suppliers: Supplier[] = [
  ['s1','Distribuidora La Plata','30-71000001-2','221 410-1234','ventas@ejemplo.com'],
  ['s2','Mayorista Eléctrico Sur','30-71000002-0','11 4300-1500','ventas2@ejemplo.com'],
  ['s3','Ferretería Industrial SA','30-71000003-9','11 4200-3333','contacto@ejemplo.com'],
  ['s4','Artículos del Hogar SRL','30-71000004-7','221 412-3344','hogar@ejemplo.com']
].map(([id,name,taxId,phone,email]) => ({id,name,taxId,phone,email,createdAt:now()}))
const clients: Client[] = [
  ['c1','Consumidor final','', 'Consumidor final','', '',0],
  ['c2','Ferretería San Martín','30-71234567-8','Responsable inscripto','2241 123456','Ranchos, Buenos Aires',900000],
  ['c3','Almacén Don José','20-30111222-3','Monotributista','2241 111222','Ranchos, Buenos Aires',350000],
  ['c4','Constructora del Sur','30-71999888-1','Responsable inscripto','11 4211-5544','Buenos Aires',1200000],
  ['c5','Electricista particular','', 'Consumidor final','2241 553322','',0]
].map(([id,name,taxId,taxCondition,phone,address,creditLimit]) => ({id:String(id),name:String(name),taxId:String(taxId),taxCondition:String(taxCondition),phone:String(phone),address:String(address),creditLimit:Number(creditLimit),createdAt:now()}))
const rows: Array<[string,string,string,string,string,string,number,number,number,number,number,string]> = [
  ['TOR-0640','Tornillo galvanizado 6×40 mm','Ferretería','Genérico','unidad','779100010001',4850,500,37,75,62,'s1'],
  ['TOR-0820','Tornillo autoperforante 8×20 mm','Ferretería','Genérico','unidad','779100010002',2650,400,48,99,81,'s1'],
  ['TUE-M08','Tuerca hexagonal M8','Ferretería','Genérico','unidad','779100010003',5900,500,22,50,42,'s1'],
  ['CAB-250','Cable unipolar 2,5 mm²','Electricidad','Trefilcon','metro','779100010004',680,100,580,1050,900,'s2'],
  ['CAB-150','Cable unipolar 1,5 mm²','Electricidad','Trefilcon','metro','779100010005',390,100,410,790,675,'s2'],
  ['LAMP-9W','Lámpara LED 9W luz fría','Electricidad','Macroled','unidad','779100010006',115,20,1350,2490,2190,'s2'],
  ['TOMA-10','Tomacorriente 10A blanco','Electricidad','Cambre','unidad','779100010007',38,15,2890,4900,4290,'s2'],
  ['DEST-PH2','Destornillador Phillips PH2','Herramientas','Tramontina','unidad','779100010008',24,10,4700,7990,6990,'s3'],
  ['DEST-PH1','Destornillador Phillips PH1','Herramientas','Tramontina','unidad','779100010009',11,12,3900,6990,6090,'s3'],
  ['TAL-750','Taladro percutor 750W','Herramientas','Gamma','unidad','779100010010',6,4,65000,99490,88490,'s3'],
  ['LLA-13','Llave combinada 13 mm','Herramientas','Bahco','unidad','779100010011',17,6,8500,14390,12990,'s3'],
  ['CINT-20','Cinta aisladora negra 20 m','Electricidad','3M','unidad','779100010012',82,30,1100,1990,1690,'s2'],
  ['SILI-280','Silicona transparente 280 ml','Construcción','Suprabond','unidad','779100010013',13,20,3400,5900,5200,'s1'],
  ['PINC-2','Pincel profesional 2 pulgadas','Pinturería','El Galgo','unidad','779100010014',9,15,3200,5690,4990,'s3'],
  ['MATE-AC','Mate acero inoxidable','Hogar','Genérico','unidad','779100010015',32,10,6900,11990,10490,'s4'],
  ['TERMO-1L','Termo acero 1 litro','Hogar','Genérico','unidad','779100010016',18,7,18000,31990,27990,'s4'],
  ['CAND-40','Candado de bronce 40 mm','Cerrajería','Trabex','unidad','779100010017',28,10,8200,14990,13200,'s3'],
  ['MECHA-6','Mecha HSS 6 mm','Herramientas','Bosch','unidad','779100010018',44,15,2150,4190,3690,'s3']
]
const products: Product[] = rows.map(([sku,name,category,brand,unit,barcode,stock,minStock,cost,price,wholesalePrice,supplierId]) => ({
  id: sku, sku,name,category,brand,unit,barcode,stock,minStock,cost,price,wholesalePrice,supplierId,active:true,createdAt:now()
}))
export function demoData(): AppData {
  let data: AppData = { schemaVersion: 1, products: structuredClone(products), clients: structuredClone(clients), suppliers: structuredClone(suppliers), sales:[], purchases:[], stockMovements:[], ledger:[], nextSaleNumber:1, nextPurchaseNumber:1 }
  data = commitSale(data, { lines:[{productId:'LAMP-9W',qty:4},{productId:'CINT-20',qty:2}],clientId:'',method:'Efectivo',tier:'minorista',note:'Venta de ejemplo' })
  data = commitSale(data, { lines:[{productId:'TOR-0640',qty:120},{productId:'CAB-250',qty:40}],clientId:'c2',method:'Cuenta corriente',tier:'mayorista',note:'Pedido de ejemplo' })
  data = commitSale(data, { lines:[{productId:'MATE-AC',qty:2}],clientId:'',method:'Transferencia',tier:'minorista',note:'Venta de ejemplo' })
  return data
}
