# Pruebas manuales V1 (antes de cada release)

Realizar con datos de demostración y el navegador abierto en `http://127.0.0.1:5173/`.

- [ ] El dashboard muestra artículos, ventas del día y saldos.
- [ ] Buscar producto por nombre, SKU y código de barras.
- [ ] Crear artículo con SKU nuevo; editarlo y desactivarlo.
- [ ] Intentar agregar SKU duplicado: debe rechazarse.
- [ ] Hacer una venta en efectivo: registra la operación y descuenta stock.
- [ ] Intentar vender más unidades de las disponibles: debe rechazarse.
- [ ] Registrar venta a cuenta corriente sin cliente: debe rechazarse.
- [ ] Registrar venta a cliente con crédito, verificar su saldo.
- [ ] Intentar sobrepasar el crédito de cliente: debe rechazarse.
- [ ] Registrar un pago parcial de cuenta corriente: baja el saldo.
- [ ] Intentar cobrar más que el saldo: debe rechazarse.
- [ ] Crear proveedor, registrar compra, verificar costo y stock.
- [ ] Ajuste de stock negativo que exceda existencias: debe rechazarse.
- [ ] Ajustar stock con motivo: debe aparecer en movimientos.
- [ ] Exportar respaldo; modificar artículo; restaurar respaldo y verificar valor original.
- [ ] Recargar el navegador y confirmar persistencia local.
- [ ] Probar móvil con ancho 390px; menú, catálogo y carrito accesibles.
- [ ] Verificar que ningún documento interno mencione CAE ni pretenda ser factura autorizada.

**Limitación esperada:** abrir desde otro navegador o PC no replica cambios; los datos no están sincronizados.
