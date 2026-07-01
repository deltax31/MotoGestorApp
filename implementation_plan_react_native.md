# Plan de Implementación: App Móvil (React Native + Expo) - Ruta 360

De acuerdo con el documento de buenas prácticas de **Ruta 360** y el análisis previo del backend, aquí presento el lineamiento detallado para construir el frontend móvil sin afectar la versión web actual.

## 1. Estrategia de Aislamiento (Control de Versiones)
Para proteger la base de código web actual, trabajaremos en una nueva rama de Git.
- **Acción:** Crearemos y nos moveremos a una rama llamada `feat/ruta360-mobile` (o similar).
- **Setup:** Dentro de esta rama, podemos reemplazar el entorno actual de React (Vite) inicializando un nuevo proyecto de **Expo** en la raíz, o bien crear una carpeta `mobile/` para alojar la app móvil si se prefiere mantener ambos frontends (monorepo). *Recomiendo limpiar el frontend actual en esta rama y generar la estructura de Expo limpia para evitar conflictos.*

## 2. Arquitectura Base (Según Buenas Prácticas)
Aplicaremos estrictamente la estructura definida en el documento:
- **Framework:** React Native con **Expo (SDK + Router v3)**.
- **Tipado:** **TypeScript estricto** (`strict: true`). No se usará `any`. Tipos centralizados en `src/types/`.
- **Enrutamiento (File-based):** Se creará la carpeta `app/` con grupos de rutas:
  - `(auth)/` para login y registro.
  - `(tabs)/` para la navegación principal unificada (Dashboard, Garaje, IA, Perfil).
- **Gestión de Estado:** **Zustand** para la sesión y cachés locales persistidos (`AsyncStorage`), separando claramente el estado global del estado de servidor.

## 3. Conexión con el Backend Actual (InsForge)
El backend actual está perfectamente preparado para la app móvil.
- **Cliente InsForge:** Se creará un singleton en `src/services/insforge/client.ts` usando las variables de entorno de Expo (`EXPO_PUBLIC_INSFORGE_URL`).
- **Migración de Lógica:** Migraremos los servicios actuales de la web (`motorcycleService`, `maintenanceService`, `expenseService`, `aiService`) a la carpeta `src/services/` de la app móvil. La lógica es 100% compatible ya que ambos usan el SDK de TS de InsForge.
- **Flujos asíncronos:** Seguiremos el patrón recomendado en la guía de usar Custom Hooks (ej. `useVehiculo.ts`) para encapsular las llamadas a los servicios y la actualización del store de Zustand.

## 4. UI y Sistema de Diseño
- **Estilos:** Se utilizará un sistema de tokens en `src/constants/colores.ts` (Coral, Azul Petróleo, etc.) y `StyleSheet` o NativeWind (si se prefiere Tailwind en RN).
- **Componentes:** Separación estricta entre componentes de UI puros (presentacionales en `src/components/ui/`) y componentes de negocio o features (`src/components/[feature]/`).

## 5. Fases de Ejecución

1. **Fase 1: Setup y Estructura Base**
   - Creación de la rama en git.
   - Inicialización del proyecto Expo (`npx create-expo-app`).
   - Configuración de TypeScript, Zustand, y SDK de InsForge.
   - Creación de la estructura de carpetas (`app/`, `src/components`, `src/services`, etc.).

2. **Fase 2: Autenticación y Layouts**
   - Implementar el layout raíz (`app/_layout.tsx`) con la protección de rutas.
   - Construir las pantallas de Login/Registro en `(auth)/`.
   - Implementar el Tab Navigation (BottomNav) en `(tabs)/_layout.tsx`.

3. **Fase 3: Integración de Módulos (Vistas Móviles)**
   - **Dashboard & Garaje:** Componentes de listado de motos y tips técnicos.
   - **Mantenimientos & Finanzas:** Formularios optimizados para móvil y listados.
   - **IA Asistente:** Pantalla de chat y conexión al servicio de IA existente.

## User Review Required

> [!IMPORTANT]
> **Decisión de Repositorio/Carpetas**
> Al crear la nueva rama para móvil, ¿deseas que (Opción A) **borremos el código de la web** (carpeta `src`, `index.html`, etc.) en esa rama para inicializar Expo desde cero en la raíz, o (Opción B) **creemos una subcarpeta `mobile/`** manteniendo el código web ahí pero trabajando solo en la subcarpeta?

## Open Questions

1. ¿Qué librería de estilos prefieres para React Native? ¿Usamos el clásico `StyleSheet` de React Native (recomendado para rendimiento) o prefieres instalar `NativeWind` para usar clases de TailwindCSS?
2. ¿Estás de acuerdo con el plan de fases para empezar con la Fase 1 (Setup del proyecto Expo)?
