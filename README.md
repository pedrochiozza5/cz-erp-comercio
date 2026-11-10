# CZ ERP Comercio · V1.0 local (prototipo)

Sistema de gestión comercial para comercios multiproducto, ferreterías, repuesteras y distribuidores. Interfaz React + TypeScript + Vite, con datos locales de demostración **sin backend ni base de datos**.

> ⚠️ **Solo desarrollo y pruebas.** No utilizar con clientes reales, inventarios productivos, facturación fiscal ni contabilidad. Los registros de venta son **comprobantes internos sin validez fiscal**. No está conectado a ARCA.

## Requisitos

- Node.js **22.12 o superior** (preferimos una versión 22 actualizada) y npm
- Git + VS Code (recomendados)
- Navegador moderno

## Empezar en Windows (PowerShell)

```powershell
cd cz-erp-comercio-v1
npm install
npm run dev
```

Abrir la URL que muestra Vite, habitualmente `http://127.0.0.1:5173/`.

```powershell
npm run typecheck
npm run build
```

`npm install` requiere internet la primera vez. Se recomienda generar y subir el `package-lock.json` con el primer commit para instalaciones repetibles; **no se incluye lockfile** porque este paquete fue preparado sin acceso al registro npm.

## Incluye

| Área | Funcionalidad en V1 |
|---|---|
| Panel general | Ventas del día, alertas de stock, valor de mercadería y cuentas a cobrar |
| Catálogo | Alta/edición, SKU, barras, marca, rubro, precios minoristas/mayoristas, estado |
| POS | Carrito, cantidades, precios por segmento, distintos medios de pago, descuento de stock |
| Clientes | Alta/edición, datos fiscales de referencia, crédito, saldos y registro de cobros |
| Proveedores | Alta/edición y relación con artículos |
| Compras | Ingreso de múltiples artículos, costo registrado y aumento de stock |
| Inventario | Ajustes manuales con motivo, alertas y movimientos de compras/ventas |
| Ventas | Historial y detalle de operaciones internas |
| Respaldos | Exportación/importación JSON y restauración de datos ficticios |

Todos los productos y clientes iniciales son inventados para pruebas. **La demostración no incorpora ventas fiscales, impuestos, devoluciones, pagos a proveedores, costo promedio, cuotas, descuentos, remitos, trazabilidad de números de serie, multi-depósito ni inventario concurrente.**

## Arquitectura

```text
src/
  domain/
    types.ts         # Contratos y modelos comerciales
    operations.ts    # Lógica pura: venta, compra, ajustes, cobros
    seed.ts          # Datos de ejemplo
  data/
    localRepository.ts  # Persistencia temporal en localStorage / backups
  App.tsx            # Interfaces de la V1
  styles.css         # Diseño adaptativo
  main.tsx           # Montaje React
```

En V2 se reemplaza el repositorio local por llamadas a una API (NestJS) con PostgreSQL. La lógica de ventas deberá ejecutarse en el servidor con **transacciones ACID, validación de stock, permisos y auditoría**. No confiar en el navegador como autoridad para precios o existencias.

## Importante sobre los datos

- Cada computadora/navegador guarda **su propio** catálogo, ventas y saldos; **GitHub sincroniza código, NO datos**.
- Limpiar datos del sitio, navegar en modo incógnito o cambiar de perfil puede hacer que los datos desaparezcan.
- Exportá respaldos JSON antes de reiniciar datos. No los subas a repositorios.
- `localStorage` no es base de datos comercial ni reemplaza backups seguros.
- La validación de un archivo importado es básica (solo formato de demo); no importes archivos desconocidos.
- No expongas esta aplicación fuera de la PC como si fuera producción.

## Trabajar entre dos personas con GitHub

1. Crear un repositorio **privado** (por ejemplo `cz-erp-comercio`) en GitHub.
2. Desde esta carpeta inicializar Git:

```powershell
git init
git add .
git commit -m "feat: prototipo V1 local de ERP comercio"
git branch -M main
git remote add origin https://github.com/USUARIO/cz-erp-comercio.git
git push -u origin main
```

3. GitHub → repositorio → Settings → Collaborators → Add people → invitar al hermano por su usuario GitHub.
4. Él clona el repositorio y corre `npm install` y `npm run dev`.
5. Trabajen con ramas separadas y Pull Requests:

```powershell
git checkout main
git pull origin main
git checkout -b feat/inventario
# editar código...
git add .
git commit -m "feat: mejorar inventario"
git push -u origin feat/inventario
```

Después, abrir un **Pull Request** a `main`, revisar los cambios y fusionar. No subir `node_modules`, `.env`, respaldos, datos fiscales reales ni credenciales.

### Reparto inicial del trabajo

- Persona A: UX/UI, productos, POS, responsive.
- Persona B: modelo comercial, inventario, compras, cuentas corrientes, validaciones y pruebas.
- Ambos: revisar PR de la otra persona y acordar estructura antes de reescribir archivos compartidos.

## Próximos hitos

- Inspeccionar el viejo .exe, hacer copia segura e identificar motor y datos disponibles.
- Implementar backend transaccional, permisos, sesiones, auditoría y PostgreSQL.
- Migración de catálogo y clientes con mapeo SKU/unidades, comparación de stock y totales.
- Facturación electrónica ARCA con ambiente de homologación y asesoramiento contable.
- Integraciones de impresoras/códigos de barras, multi-depósito y listas por cliente.

## Licencia

Código inicial de demostración para uso del equipo. Elegir una licencia si se decide publicar de forma abierta.
