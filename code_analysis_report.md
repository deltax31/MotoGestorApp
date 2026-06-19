# Informe de Análisis de Código: MotoGestor

Este informe detalla la arquitectura, el stack tecnológico y el funcionamiento a nivel de código de cada sección de la aplicación **MotoGestor**.

---

## 1. Visión General y Arquitectura

El aplicativo es una **Single Page Application (SPA)** desarrollada con tecnologías modernas orientadas al rendimiento y la escalabilidad.

### Stack Tecnológico Principal:
- **Frontend Core**: React 19 con TypeScript, construido y empaquetado mediante Vite.
- **Enrutamiento**: React Router DOM v7 para la navegación en el cliente (`/dashboard`, `/garage`, etc.).
- **Estilos**: TailwindCSS v3.4 complementado con CSS puro (`index.css`) para variables y tokens de diseño.
- **Backend-as-a-Service (BaaS)**: **InsForge**. La aplicación utiliza `@insforge/sdk` y `@insforge/react` para resolver:
  - Autenticación de usuarios (Email/Password).
  - Base de datos (PostgreSQL vía PostgREST).
  - Almacenamiento (Storage) y Funciones Serverless (AI).

### Estructura de Directorios (`src/`):
- `pages/`: Contiene las vistas principales (rutas) de la aplicación.
- `services/`: Encapsula la lógica de comunicación con la base de datos de InsForge.
- `components/`: Componentes UI reutilizables (Sidebar, Layouts, etc.).
- `context/`: Manejo de estado global (ej. `ToastContext` para notificaciones).
- `lib/`: Configuraciones de utilidades (instancia de `insforge.ts`, lógica RAG, utilidades comunes).
- `hooks/`: Custom hooks de React (`useIsMobile`, `useRealtime`).

---

## 2. Análisis por Sección (A nivel de Código)

A continuación se detalla cómo funciona cada módulo basándonos en los archivos de `src/pages` y su integración con los servicios.

### A. Autenticación y Landing (`/`, `/sign-in`, `/sign-up`, `/forgot-password`)
- **Archivos Clave**: `Landing.tsx`, `ResetPassword.tsx`, `App.tsx`
- **Funcionamiento**: 
  - La ruta raíz (`/`) renderiza el componente `<Landing />` si el usuario no está autenticado (`<SignedOut>`).
  - Utiliza los hooks de `@insforge/react` (`useAuth`, `<SignedIn>`, `<SignedOut>`) para proteger las rutas.
  - Si el estado `isSignedIn` es verdadero, la aplicación redirige automáticamente mediante un componente `<Navigate>` hacia el `/dashboard`.
  - El componente `ProtectedRoute` envuelve las rutas privadas y muestra un loader spinner (`spinner-accent`) mientras se valida la sesión en InsForge.

### B. Dashboard Principal (`/dashboard`)
- **Archivos Clave**: `Dashboard.tsx`
- **Funcionamiento**:
  - Es el panel de control central. Se invoca una vez que el usuario ha iniciado sesión.
  - Al montar el componente (`useEffect`), se hacen llamados asíncronos a múltiples servicios (`motorcycleService`, `maintenanceService`, `expenseService`) filtrando por el `user_id` para obtener los datos consolidados.
  - Calcula métricas globales como: total de motos, próximos mantenimientos, alertas de documentos vencidos (SOAT, Tecnomecánica) y total de gastos.

### C. Mi Garaje (`/garage` y `/garage/:id`)
- **Archivos Clave**: `Garage.tsx`, `MotoDetail.tsx`, `services/motorcycleService.ts`
- **Funcionamiento (`Garage.tsx`)**:
  - Muestra la lista de motocicletas registradas del usuario.
  - Permite registrar nuevas motos enviando un objeto `Motorcycle` a `motorcycleService.create()`, el cual inserta los datos en la tabla `motorcycles` de InsForge.
- **Funcionamiento (`MotoDetail.tsx`)**:
  - Captura el `id` de la ruta dinámica (`useParams`).
  - Permite editar la información de la motocicleta y actualizar su kilometraje (`updateKm`).
  - Contiene lógica (`updateWithDocStatus`) para calcular automáticamente el estado de los documentos (SOAT y Tecnomecánica) basándose en las fechas de expiración (`computeDocStatus`).

### D. Mantenimiento (`/maintenance`)
- **Archivos Clave**: `Maintenance.tsx`, `services/maintenanceService.ts`
- **Funcionamiento**:
  - Encargado de gestionar el historial de servicios técnicos y preventivos de las motocicletas.
  - Permite crear nuevos registros de mantenimiento asociados al `id` de una moto específica.
  - El `maintenanceService` realiza operaciones CRUD en la base de datos y puede relacionarse con el kilometraje actual de la moto para predecir futuros servicios (basado en el uso de los Skills de los agentes del proyecto).

### E. Finanzas (`/finances`)
- **Archivos Clave**: `Finances.tsx`, `services/expenseService.ts`
- **Funcionamiento**:
  - Lleva el control de gastos de la motocicleta (gasolina, peajes, repuestos, seguros).
  - Interactúa con la tabla de `expenses`. 
  - A nivel de UI, consolida los gastos y permite visualizarlos categorizados. Al guardar un nuevo gasto, `expenseService.create()` inserta el registro atado al `user_id` y al `moto_id` si aplica.

### F. Asistente IA (`/ai`)
- **Archivos Clave**: `AI.tsx`, `services/aiService.ts`, `services/chatService.ts`, `lib/rag.ts`, `lib/skills.ts`
- **Funcionamiento**:
  - Es un módulo avanzado que integra Inteligencia Artificial.
  - `AI.tsx` gestiona la interfaz del chat.
  - Utiliza `aiService.ts` para enviar las consultas (prompts) del usuario a través de una función de servidor (Serverless Function) alojada en InsForge o directamente usando la API de OpenAI configurada en el backend.
  - El sistema integra técnicas RAG (Retrieval-Augmented Generation) (`lib/rag.ts`) y un sistema de Skills (ej. `alertas-predictivas`, `diagnostico-por-sintomas`) para inyectar contexto técnico y específico sobre motos al modelo de lenguaje antes de que este responda.

### G. Perfil (`/profile`)
- **Archivos Clave**: `Profile.tsx`, `services/profileService.ts`
- **Funcionamiento**:
  - Maneja los datos personales del usuario.
  - Permite actualizar la tabla `profiles` vinculada al sistema de autenticación, gestionando información como nombre, avatar, o preferencias de la app.

---

## 3. Manejo de Estado y Persistencia

- **Base de Datos**: Todos los servicios (ej. `insforge.database.from('table').select()`) hacen uso del cliente de InsForge instanciado en `src/lib/insforge.ts`. Este cliente maneja automáticamente el token JWT del usuario logueado en sus cabeceras, garantizando la seguridad a nivel de base de datos (RLS - Row Level Security).
- **Estado Local**: En las vistas de React se utilizan `useState` para formularios y estados de UI (modales, loaders) y `useEffect` para la hidratación inicial de datos (data fetching).
- **Notificaciones**: El manejo de errores y alertas visuales al guardar información exitosamente se centraliza a través del custom hook expuesto por `ToastContext.tsx`.

## Resumen

El código está estructurado de manera modular siguiendo un patrón de separación de responsabilidades:
1. **Páginas (UI / Vista)** interactúan con el usuario.
2. **Servicios (Controlador / Modelo)** abstraen las llamadas asíncronas a InsForge.
3. **InsForge (Backend)** provee la persistencia y la autenticación.

Esta arquitectura hace que MotoGestor sea una aplicación robusta, fácil de mantener y lista para escalar.
