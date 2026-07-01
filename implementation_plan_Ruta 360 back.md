# Análisis de Viabilidad y Lineamientos: Migración a Diseños "Ruta 360"

Se ha realizado un análisis integral de las pantallas del proyecto **Ruta 360** (ID: `13192112641270088441`) y se ha comparado con la base de código actual (**MotoGestorApp**), evaluando tanto la capa de **Frontend** como la de **Backend (InsForge)**.

## 1. Análisis de Backend y Servicios (InsForge)

Tras analizar los servicios actuales en `src/services/` (`motorcycleService`, `maintenanceService`, `expenseService`, `aiService`) y los tipos en `src/types/index.ts`, **la viabilidad de acoplar el backend actual a las nuevas pantallas móviles es EXTREMADAMENTE ALTA (Plug & Play)**.

| Pantalla "Ruta 360" | Soporte en Backend Actual (InsForge) | Estado de Integración |
| :--- | :--- | :--- |
| **Mi Garaje / Registrar / Editar Moto** | Soportado al 100% por la tabla `motorcycles` y `motorcycleService.ts`. | ✔️ Listo para conectar |
| **Gestión de Mantenimientos** | Soportado al 100% por la tabla `maintenance` y `maintenanceService.ts`. | ✔️ Listo para conectar |
| **Finanzas / Gastos / Historial** | Soportado al 100% por la tabla `expenses` y `expenseService.ts`. | ✔️ Listo para conectar |
| **Asistente IA** | Soportado por `aiService.ts` (Claude Sonnet 4.5 + RAG + Skills). | ✔️ Listo para conectar |
| **Perfil y Auth** | Soportado por tabla `profiles` e `InsForge Auth`. | ✔️ Listo para conectar |
| **Dashboard (Tips Técnicos)** | Generación dinámica soportada por `aiService` o consultando datos de motos. | ✔️ Listo para conectar |
| **Notificaciones** | **No existe una tabla `notifications` nativa.** | ⚠️ **Requiere estrategia** |

### Conclusión sobre el Backend:
No se requiere realizar migraciones complejas ni crear nuevas tablas (salvo la decisión sobre notificaciones). La estructura de datos actual (`Motorcycle`, `Maintenance`, `Expense`, `Profile`) contiene todos los campos necesarios (ej: `soat_expiry`, `cost`, `km_at_service`, `category`) que demandan los nuevos diseños.

## 2. Diferencias Estéticas y de Navegación (Frontend)

El mayor trabajo residirá en la refactorización de la capa visual:
- **Tema Actual (Desktop):** Dark mode con acento **Naranja (#f57c00)** y base `#0a0b0f`. Sidebar lateral.
- **Tema Ruta 360 (Mobile):** Dark mode nativo. Fondo azul medianoche (`#0A0F1A`), primario cian eléctrico (`#00C8D4`), y acento ámbar (`#F59E0B`). Navegación inferior (BottomNav).

## 3. Lineamiento Detallado de Migración (Paso a Paso)

Para acoplar el código actual a los diseños de Ruta 360 minimizando fricciones, propongo el siguiente plan de acción:

### Fase 1: Arquitectura Base y Sistema de Diseño
1. **Actualizar `index.css`:** Reemplazar paleta naranja por la paleta *Ruta 360* (Cian/Ámbar/Midnight Blue).
2. **Reestructurar Layout:** Eliminar el Sidebar (`--sidebar-w`) y adoptar un layout móvil estricto (Bottom Navigation) centrado en pantalla para navegadores de escritorio (`max-width: 480px`).
3. **Estrategia de Notificaciones:** Implementar las "Notificaciones" como un estado derivado local (ej: alertas de SOAT vencido o mantenimientos próximos calculados desde `motorcycles` al vuelo) en lugar de crear una tabla nueva temporalmente.

### Fase 2: Componentes y Vistas Principales (Mobile-First)
Refactorizar progresivamente cada vista para cumplir con las dimensiones y flujos de las pantallas conectando los servicios de InsForge ya existentes:
1. **Auth & Landing:** Adaptar el formulario de inicio de sesión y registro al flujo vertical.
2. **Navegación Unificada:** Crear el `BottomNav` con links a (Dashboard, Garaje, IA, Perfil).
3. **Dashboard & Garaje:** Convertir las UI actuales en tarjetas verticales compactas.
4. **Mantenimientos & Finanzas:** Implementar los formularios (Registrar Gasto, Registrar Servicio Múltiple) usando los mismos payloads que ya envían `expenseService.create()` y `maintenanceService.create()`.

## User Review Required

> [!IMPORTANT]
> **Decisión sobre Notificaciones**
> Actualmente no tenemos una tabla de notificaciones en la base de datos de InsForge. Para la pantalla de "Notificaciones", ¿prefieres que (A) creemos un nuevo servicio/tabla de Notificaciones en el backend, o (B) que las generemos dinámicamente en el frontend basándonos en fechas de SOAT, Tecno y Mantenimientos próximos?

## Open Questions

1. Teniendo claro que el backend ya soporta todo el modelo de datos, ¿estás de acuerdo con el plan de modificar el layout global (eliminar sidebar, implementar BottomNav y paleta azul/cian)?
2. ¿Empezamos aplicando los estilos base globales en `index.css` y el layout de navegación, o prefieres abordar una pantalla específica primero?
