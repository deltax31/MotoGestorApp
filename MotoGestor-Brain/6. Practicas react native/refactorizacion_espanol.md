# Registro de Refactorización a Español (Ruta360 Mobile)

**Fecha**: 7 de Julio de 2026
**Objetivo**: Refactorización de la estructura de la aplicación móvil (Ruta360 Mobile) para adoptar un lenguaje y nombramiento de archivos y rutas en español, mejorando la coherencia del proyecto para el equipo de desarrollo.

## Resumen de Cambios

### 1. Refactorización de la Estructura de Rutas (Expo Router)
Se han reemplazado las rutas en inglés por sus equivalentes en español dentro del directorio `ruta360-mobile/src/app/(tabs)` y sus subdirectorios:
- `dashboard.tsx` ➔ `inicio.tsx`
- `ai.tsx` ➔ `asistente.tsx`
- `finances.tsx` ➔ `finanzas.tsx`
- `profile.tsx` ➔ `perfil.tsx`
- Carpeta `garage/` ➔ `garaje/`
- Carpeta `maintenance/` ➔ `mantenimientos/`
- Carpeta `finances/` (fuera de tabs) ➔ `finanzas/`
- Actualización de los layouts `_layout.tsx` para reflejar las nuevas rutas y nombres de pestañas en español.

### 2. Refactorización de Componentes (`ruta360-mobile/src/components`)
Se han traducido y reorganizado los componentes de UI y de negocio:
- Componentes de interfaz compartida agrupados en `src/components/ui/`:
  - `animated-icon` ➔ `IconoAnimado`
  - `app-tabs` ➔ `TabsApp`
  - `collapsible` ➔ `Colapsable`
  - `external-link` ➔ `EnlaceExterno`
  - `web-badge` ➔ `EtiquetaWeb`
  - `hint-row` ➔ `FilaPista`
  - `themed-text` ➔ `TextoTema`
  - `themed-view` ➔ `VistaTema`
- Componentes específicos agrupados en nuevas carpetas en español (p. ej., `dashboard/`, `mantenimiento/`).

### 3. Refactorización de Gestión de Estado (`ruta360-mobile/src/store`)
Los stores de Zustand han sido renombrados para su uso en español:
- `aiStore.ts` ➔ `asistenteStore.ts`
- `authStore.ts` ➔ `autenticacionStore.ts`
- `financeStore.ts` ➔ `finanzasStore.ts`
- `garageStore.ts` ➔ `vehiculoStore.ts`
- `maintenanceStore.ts` ➔ `mantenimientoStore.ts`

### 4. Refactorización de Servicios API (`ruta360-mobile/src/services/insforge`)
Los archivos de los servicios de integración con InsForge se renombraron y adaptaron al español:
- `vehiculos.ts`
- `finanzas.ts`
- `mantenimientos.ts`
- `perfiles.ts`

### 5. Adaptación de Tipos y Constantes
- **Constantes**: Archivos base como `theme.ts` pasaron a `espaciado.ts` y `tipografia.ts`.
- **Tipos**: Creación y organización de las interfaces de TypeScript en `src/types/`.
- Limpieza de hooks de temas que ya no se usan o se consolidaron.

## Conclusión
La refactorización ha sido de carácter estructural y de nomenclatura (archivos, carpetas, componentes e importaciones), conservando la arquitectura de estado con Zustand y la integración con InsForge. Todas las importaciones fueron corregidas para reflejar las nuevas rutas.
