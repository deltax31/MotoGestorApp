# Análisis de Viabilidad y Lineamientos: Migración a Diseños "Ruta 360"

Se ha realizado un análisis de las pantallas del proyecto **Ruta 360** (ID: `13192112641270088441`) en StitchMCP y se ha comparado con la base de código frontend actual de **MotoGestorApp**.

## 1. Análisis de Pantallas vs Componentes Actuales

El proyecto de diseño consta de 19 pantallas enfocadas a una experiencia **100% Móvil (Mobile-First)**. Afortunadamente, existe una alta paridad (1 a 1) entre las funcionalidades diseñadas y las páginas construidas actualmente en React:

| Pantalla en Ruta 360 | Componente Actual en React (`src/pages/`) | Estado |
| :--- | :--- | :--- |
| **Landing Page / Login / Registro** | `Landing.tsx` / `ResetPassword.tsx` | Requiere rediseño móvil |
| **Dashboard con Tips Técnicos** | `Dashboard.tsx` | Adaptación de layout |
| **Mi Garaje / Registrar Moto / Editar Moto** | `Garage.tsx` / `MotoDetail.tsx` | Adaptación de layout |
| **Gestión de Mantenimientos / Servicios** | `Maintenance.tsx` | Adaptación de layout |
| **Finanzas Detalladas / Gastos / Historial** | `Finances.tsx` | Adaptación de layout |
| **Asistente IA** | `AI.tsx` | Adaptación de layout |
| **Perfil / Config. (Nav Unificado)** | `Profile.tsx` | Adaptación de layout |
| **Notificaciones** | *No existe página dedicada* | **[NUEVO]** Requiere creación |

## 2. Diferencias Estéticas y de Navegación

### Diseño Actual (Desktop-First)
- **Tema:** Dark mode con acento **Naranja (#f57c00)** y base `#0a0b0f`.
- **Navegación:** Menú lateral (Sidebar de `260px`).
- **Layout:** Contenido expandido horizontalmente con `glassmorphism`.

### Diseño Ruta 360 (Mobile-First)
- **Tema:** Dark mode nativo. Fondo azul medianoche (`#0A0F1A`), primario cian eléctrico (`#00C8D4`), y acento ámbar (`#F59E0B`).
- **Navegación:** Navegación inferior unificada (Bottom Navigation Bar).
- **Layout:** Enfoque vertical, tarjetas compactas, sin sidebar, optimizado para anchos de `390px` a `780px`.

> [!TIP]
> **Viabilidad Técnica: ALTA**
> Acoplar los nuevos diseños es completamente viable y no requiere reescribir la lógica de negocio (hooks, services, state). Todo el cambio se concentra en la capa de presentación (CSS, HTML structure y Layouts).

## 3. Lineamiento Detallado de Migración (Paso a Paso)

Para acoplar el código actual a los diseños de Ruta 360, propongo el siguiente plan de acción:

### Fase 1: Sistema de Diseño (CSS)
1. **Actualizar `index.css`:** Reemplazar las variables de color actuales por la paleta de *Ruta 360*.
2. **Eliminar el Sidebar:** Quitar la variable `--sidebar-w` y adaptar el layout principal para que ocupe el 100% del ancho, limitando el `max-width` para simular/soportar vista móvil en web (ej. `max-width: 480px; margin: 0 auto;`).

### Fase 2: Navegación y Enrutamiento
1. **Crear Bottom Navigation:** Desarrollar un nuevo componente de navegación inferior (`BottomNav.tsx`) que reemplace al sidebar actual.
2. **Actualizar App.tsx/Layout:** Inyectar el `BottomNav` en el layout de las rutas autenticadas.

### Fase 3: Refactorización de Páginas (Mobile-First)
Refactorizar progresivamente cada vista para cumplir con las dimensiones y flujos de las pantallas:
1. **Auth & Landing:** Adaptar `Landing.tsx` para ajustarse al flujo vertical.
2. **Dashboard & Garaje:** Convertir tablas y grillas horizontales en tarjetas verticales iterables.
3. **Mantenimiento & Finanzas:** Implementar los formularios modales y listas de tarjetas compactas.
4. **Perfil & IA:** Ajustar el layout del chat y las opciones de cuenta al diseño unificado.

## User Review Required

> [!IMPORTANT]
> **Decisión de Diseño**
> El frontend actual parece estar optimizado para escritorio (Sidebar). Para adoptar el diseño de **Ruta 360**, transformaremos la web app en una **PWA / Web App Móvil**, centrada y con menú inferior. ¿Estás de acuerdo con eliminar el Sidebar y pasar a un enfoque 100% móvil con Bottom Navigation?

## Open Questions

1. ¿Deseas que preservemos una vista adaptada para escritorio (Responsive), o hacemos que en escritorio se vea como una app móvil centrada en la pantalla?
2. ¿Empezamos por actualizar los colores globales en `index.css` y el layout base, o prefieres que generemos los componentes UI específicos de Stitch primero?
