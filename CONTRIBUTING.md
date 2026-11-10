# Acuerdos del equipo

- Crear ramas `feat/...`, `fix/...`, `refactor/...`, `docs/...` desde `main` actualizada.
- No hacer `push` directamente a `main` salvo el commit inicial.
- Cada Pull Request debe explicar qué cambia, cómo se probó y agregar capturas cuando modifique pantallas.
- `npm run typecheck` y `npm run build` antes de enviar PR.
- Evitar dependencias nuevas sin avisar a la otra persona.
- No mezclar cambios de lógica comercial con un rediseño completo en el mismo PR.
- No incluir `.env`, contraseñas, CUIT de clientes reales, bases exportadas, respaldos JSON ni carpetas `dist/` o `node_modules/`.
- Escribir funciones de negocio en `src/domain/operations.ts`; no incrustar reglas de stock y crédito directamente en los botones.
- Revisar las reglas de stock, cuentas corrientes y validaciones en conjunto antes de migrar a producción.
