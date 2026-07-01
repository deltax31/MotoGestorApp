# Ruta 360 – Buenas Prácticas: React Native (App Móvil B2C)

> **Versión:** 1.0  
> **Stack:** React Native + Expo SDK + TypeScript + InsForge  
> **Alcance:** App móvil para conductores (iOS & Android)  
> **Herramientas de desarrollo:** Stitch (diseño UI) → Antigravity IDE (implementación)

---

## Índice

1. [Estructura de Carpetas](#1-estructura-de-carpetas)
2. [Convenciones de Nomenclatura](#2-convenciones-de-nomenclatura)
3. [Arquitectura de Componentes](#3-arquitectura-de-componentes)
4. [Gestión de Estado](#4-gestión-de-estado)
5. [Navegación](#5-navegación)
6. [Capa de Servicios y API](#6-capa-de-servicios-y-api)
7. [TypeScript: Tipos y Contratos](#7-typescript-tipos-y-contratos)
8. [Sistema de Diseño y Estilos](#8-sistema-de-diseño-y-estilos)
9. [Manejo de Errores y Feedback](#9-manejo-de-errores-y-feedback)
10. [Rendimiento](#10-rendimiento)
11. [Seguridad](#11-seguridad)
12. [Testing](#12-testing)
13. [Control de Versiones y Git](#13-control-de-versiones-y-git)
14. [Variables de Entorno](#14-variables-de-entorno)
15. [Builds y Distribución (EAS)](#15-builds-y-distribución-eas)
16. [Inteligencia del Código: codebase-memory-mcp](#16-inteligencia-del-código-codebase-memory-mcp)

---

## 1. Estructura de Carpetas

La estructura sigue el principio de **colocación por dominio** (feature-first), no por tipo de archivo. Cada módulo del producto vive junto con sus tipos, hooks y servicios propios.

```
ruta360-app/
├── app/                          # Expo Router – rutas de la app
│   ├── (auth)/                   # Grupo: pantallas sin sesión
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/                   # Grupo: navegación principal con tabs
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── documentos.tsx
│   │   ├── mantenimiento.tsx
│   │   ├── asistente.tsx
│   │   └── perfil.tsx
│   ├── vehiculo/
│   │   ├── [id].tsx              # Detalle de vehículo (ruta dinámica)
│   │   └── nuevo.tsx
│   ├── sos/
│   │   └── index.tsx
│   └── _layout.tsx               # Layout raíz (proveedores globales)
│
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # Átomos del sistema de diseño
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts          # Re-exporta todo
│   │   ├── layout/               # Wrappers estructurales
│   │   │   ├── SafeScreen.tsx
│   │   │   └── KeyboardAvoidingWrapper.tsx
│   │   └── [feature]/            # Componentes específicos por módulo
│   │       ├── dashboard/
│   │       │   ├── VehiculoCard.tsx
│   │       │   └── AlertaBadge.tsx
│   │       ├── documentos/
│   │       │   └── DocumentoItem.tsx
│   │       └── sos/
│   │           └── RadarMap.tsx
│   │
│   ├── hooks/                    # Custom hooks globales
│   │   ├── useAuth.ts
│   │   ├── useVehiculo.ts
│   │   ├── useDocumentos.ts
│   │   └── useOCR.ts
│   │
│   ├── services/                 # Lógica de negocio y llamadas externas
│   │   ├── insforge/
│   │   │   ├── client.ts         # Instancia única del cliente InsForge
│   │   │   ├── vehiculos.ts
│   │   │   ├── documentos.ts
│   │   │   ├── mantenimiento.ts
│   │   │   └── sos.ts
│   │   ├── ai/
│   │   │   ├── asistente.ts      # Llamadas al MCP del mecánico IA
│   │   │   └── ocr.ts            # Gemini Flash para OCR de documentos
│   │   └── notificaciones.ts
│   │
│   ├── store/                    # Estado global (Zustand)
│   │   ├── authStore.ts
│   │   ├── vehiculoStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                    # Tipos e interfaces globales
│   │   ├── vehiculo.types.ts
│   │   ├── documento.types.ts
│   │   ├── usuario.types.ts
│   │   ├── sos.types.ts
│   │   └── index.ts
│   │
│   ├── constants/                # Constantes del proyecto
│   │   ├── colores.ts
│   │   ├── tipografia.ts
│   │   ├── rutas.ts
│   │   └── config.ts
│   │
│   └── utils/                    # Funciones puras de utilidad
│       ├── fechas.ts
│       ├── validaciones.ts
│       ├── formatters.ts
│       └── permisos.ts
│
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── .env.local                    # Variables locales (NO commitear)
├── .env.example                  # Plantilla de variables (SÍ commitear)
├── app.config.ts                 # Configuración Expo (usa env vars)
├── tsconfig.json
├── babel.config.js
└── package.json
```

**Reglas de estructura:**
- Cada carpeta de feature tiene su propio `index.ts` que re-exporta sus públicos.
- Los archivos `_layout.tsx` solo contienen estructura de navegación, nunca lógica de negocio.
- Nada de lógica en los archivos de ruta (`app/`); delegar a hooks y servicios.

---

## 2. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `VehiculoCard.tsx`, `DocumentoBadge.tsx` |
| Hooks personalizados | camelCase con prefijo `use` | `useVehiculo.ts`, `useOCR.ts` |
| Servicios | camelCase, sufijo descriptivo | `vehiculosService.ts` |
| Stores Zustand | camelCase, sufijo `Store` | `authStore.ts` |
| Tipos / Interfaces | PascalCase, sufijo `.types.ts` | `vehiculo.types.ts` |
| Constantes de archivo | UPPER_SNAKE_CASE dentro del archivo | `MAX_VEHICULOS_FREE = 1` |
| Archivos de utilidad | camelCase | `fechas.ts`, `validaciones.ts` |
| Rutas dinámicas Expo | corchetes | `[id].tsx` |
| Variables CSS / StyleSheet | camelCase | `primaryColor`, `borderRadius` |

**Idioma del código:** Las variables, funciones y tipos se escriben en **español** para que el dominio del negocio sea legible. Los nombres de librerías y APIs externas permanecen en inglés.

```typescript
// ✅ Correcto
const obtenerVehiculos = async (usuarioId: string): Promise<Vehiculo[]> => { ... }
const [cargando, setCargando] = useState(false)

// ❌ Evitar
const getVehicles = async (userId: string) => { ... }
const [loading, setLoading] = useState(false)
```

---

## 3. Arquitectura de Componentes

### 3.1 Jerarquía de componentes

```
Página (app/)
  └── Composición de Features (src/components/[feature]/)
        └── Componentes UI atómicos (src/components/ui/)
```

### 3.2 Separación de responsabilidades

Cada componente debe tener **una única razón para cambiar**:

```typescript
// ❌ Componente que hace demasiado
export function VehiculoCard({ vehiculoId }: { vehiculoId: string }) {
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  
  useEffect(() => {
    insforge.from('vehiculos').select('*').eq('id', vehiculoId).then(({ data }) => {
      setVehiculo(data?.[0])
    })
  }, [vehiculoId])

  return <View>...</View>
}

// ✅ Componente presentacional (solo renderiza)
export function VehiculoCard({ vehiculo }: { vehiculo: Vehiculo }) {
  return <View>...</View>
}

// ✅ Hook que encapsula la lógica
export function useVehiculo(vehiculoId: string) {
  // Toda la lógica de fetching y estado aquí
}
```

### 3.3 Props: explícitas y tipadas

```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  label: string
  onPress: () => void
  variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma'
  tamaño?: 'sm' | 'md' | 'lg'
  cargando?: boolean
  deshabilitado?: boolean
  icono?: React.ReactNode
}

export function Button({
  label,
  onPress,
  variante = 'primario',
  tamaño = 'md',
  cargando = false,
  deshabilitado = false,
  icono,
}: ButtonProps) {
  // ...
}
```

### 3.4 Componentes de UI: nunca traen datos propios

Los componentes dentro de `src/components/ui/` son **puramente presentacionales**. Reciben todo por props y no llaman a servicios ni stores. Los componentes dentro de `src/components/[feature]/` pueden consumir hooks de datos.

### 3.5 Memo y optimización temprana

Usar `React.memo` solo cuando el perfilado lo justifique. No optimizar de forma prematura.

```typescript
// Solo si el componente renderiza listas grandes o tiene renders costosos
export const DocumentoItem = React.memo(function DocumentoItem({ documento }: Props) {
  return <View>...</View>
})
```

---

## 4. Gestión de Estado

### 4.1 Capas de estado

| Capa | Herramienta | Uso |
|---|---|---|
| Estado servidor | InsForge Realtime + hooks | Datos que vienen del backend |
| Estado global de cliente | Zustand | Sesión, vehículo activo, preferencias UI |
| Estado local de UI | `useState` / `useReducer` | Formularios, toggles, modales |
| Estado de caché | `useMemo` | Transformaciones costosas de datos |

### 4.2 Zustand: estructura de store

```typescript
// src/store/vehiculoStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Vehiculo } from '@/types'

interface VehiculoState {
  vehiculos: Vehiculo[]
  vehiculoActivoId: string | null
  // Acciones
  setVehiculos: (vehiculos: Vehiculo[]) => void
  setVehiculoActivo: (id: string) => void
  agregarVehiculo: (vehiculo: Vehiculo) => void
  eliminarVehiculo: (id: string) => void
}

export const useVehiculoStore = create<VehiculoState>()(
  persist(
    (set) => ({
      vehiculos: [],
      vehiculoActivoId: null,
      setVehiculos: (vehículos) => set({ vehículos }),
      setVehiculoActivo: (vehiculoActivoId) => set({ vehiculoActivoId }),
      agregarVehiculo: (vehiculo) => set((state) => ({ vehiculos: [...state.vehiculos, vehiculo] })),
      eliminarVehiculo: (id) =>
        set((state) => ({ vehículos: state.vehiculos.filter((m) => m.id !== id) })),
    }),
    {
      name: 'ruta360-vehículos',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

### 4.3 Regla de fuente única de verdad

- La base de datos (InsForge/PostgreSQL) es la fuente de verdad para datos persistentes.
- El store de Zustand es **caché local** de lo que ya se obtuvo de InsForge.
- Nunca modificar el store sin hacer también la llamada al servicio correspondiente.

```typescript
// src/hooks/useVehiculo.ts
export function useAgregarVehiculo() {
  const agregarVehiculo = useVehiculoStore((s) => s.agregarVehiculo)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const agregar = async (datos: NuevoVehiculoInput) => {
    setCargando(true)
    setError(null)
    try {
      const vehículo = await vehiculosService.crear(datos)  // 1. Persistir en InsForge
      agregarVehiculo(vehiculo)                              // 2. Actualizar caché local
      return vehículo
    } catch (err) {
      setError('No se pudo registrar la vehículo')
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { agregar, cargando, error }
}
```

---

## 5. Navegación

### 5.1 Expo Router (File-based routing)

La app usa **Expo Router v3** con navegación basada en el sistema de archivos. Las rutas reflejan la estructura de `app/`.

### 5.2 Grupos de rutas

```
(auth)   → Pantallas públicas sin sesión activa
(tabs)   → Pantallas principales con Tab Bar visible
```

### 5.3 Protección de rutas

La protección se centraliza en el `_layout.tsx` raíz:

```typescript
// app/_layout.tsx
import { useAuthStore } from '@/store/authStore'
import { Redirect, Stack } from 'expo-router'

export default function RootLayout() {
  const { sesion, cargando } = useAuthStore()

  if (cargando) return <SplashScreen />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {sesion ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  )
}
```

### 5.4 Navegación tipada

Siempre usar los helpers de Expo Router para navegación tipada. Evitar cadenas de texto hardcodeadas.

```typescript
// ✅ Correcto
import { router } from 'expo-router'
router.push('/vehículo/nueva')
router.push({ pathname: '/vehículo/[id]', params: { id: vehículo.id } })

// ❌ Evitar
navigation.navigate('VehiculoDetalle', { id: vehiculo.id })
```

---

## 6. Capa de Servicios y API

### 6.1 Cliente InsForge: instancia única

```typescript
// src/services/insforge/client.ts
import { createClient } from '@insforge/sdk'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const insforge = createClient({
  baseUrl: process.env.EXPO_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY!,
  // isServerMode: false (default para React Native)
})
```

### 6.2 Servicios por dominio

Cada entidad del negocio tiene su propio archivo de servicio. Los servicios devuelven datos ya tipados; nunca exponen el cliente de InsForge directamente a los componentes.

```typescript
// src/services/insforge/vehiculos.ts
import { insforge } from './client'
import type { Vehiculo, NuevoVehiculoInput } from '@/types'

export const vehiculosService = {
  async listar(usuarioId: string): Promise<Vehiculo[]> {
    const { data, error } = await insforge
      .from('vehiculos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al listar vehículos: ${error.message}`)
    return data ?? []
  },

  async crear(input: NuevoVehiculoInput): Promise<Vehiculo> {
    const { data, error } = await insforge
      .from('vehiculos')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(`Error al crear vehículo: ${error.message}`)
    return data
  },

  async actualizar(id: string, input: Partial<NuevoVehiculoInput>): Promise<Vehiculo> {
    const { data, error } = await insforge
      .from('vehiculos')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar vehículo: ${error.message}`)
    return data
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await insforge.from('vehiculos').delete().eq('id', id)
    if (error) throw new Error(`Error al eliminar vehículo: ${error.message}`)
  },
}
```

### 6.3 Servicio OCR (Gemini Flash)

```typescript
// src/services/ai/ocr.ts
interface ResultadoOCRDocumento {
  placa?: string
  modelo?: string
  anio?: number
  propietario?: string
  fechaVencimiento?: string
  tipoDocumento: 'tarjeta_propiedad' | 'soat' | 'tecnomecanica' | 'odometro'
}

export const ocrService = {
  async procesarImagen(base64Image: string, tipoDocumento: string): Promise<ResultadoOCRDocumento> {
    const { data, error } = await insforge.functions.invoke('ocr-documento', {
      body: { imagen: base64Image, tipo: tipoDocumento },
    })

    if (error) throw new Error(`Error en OCR: ${error.message}`)
    return data as ResultadoOCRDocumento
  },
}
```

---

## 7. TypeScript: Tipos y Contratos

### 7.1 Regla de oro: nunca usar `any`

Configurar `tsconfig.json` con `"strict": true`. Si el tipo no se conoce, usar `unknown` y hacer type-guard explícito.

```typescript
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 7.2 Tipos del dominio

```typescript
// src/types/vehículo.types.ts

export type EstadoDocumento = 'vigente' | 'proximo_vencer' | 'vencido'

export interface Vehiculo {
  id: string
  usuarioId: string
  placa: string
  marca: string
  modelo: string
  anio: number
  cilindraje: number
  color: string
  kilometrajeActual: number
  fotoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface NuevoVehiculoInput {
  placa: string
  marca: string
  modelo: string
  anio: number
  cilindraje: number
  color: string
  kilometrajeActual: number
}

export interface DocumentoVehiculo {
  id: string
  vehiculoId: string
  tipo: 'soat' | 'tecnomecanica' | 'seguro_todo_riesgo'
  numeroPoliza?: string
  aseguradora?: string
  fechaVencimiento: string
  estado: EstadoDocumento
  archivoUrl?: string
  createdAt: string
}
```

### 7.3 Tipos generados desde InsForge

Generar automáticamente los tipos de la base de datos desde el schema de InsForge (PostgreSQL):

```bash
# Ejecutar al modificar el schema de la base de datos
# InsForge expone el schema vía su MCP — pedirle al agente que genere los tipos:
# "Generate TypeScript types from the InsForge database schema"
# O manualmente con pgtyped/supabase-gen apuntando al PostgreSQL de InsForge:
npx supabase gen types typescript \  # herramienta CLI, apunta al PG de InsForge
  --db-url $INSFORGE_DATABASE_URL \
  > src/types/insforge.generated.ts
```

Usar estos tipos como base y extenderlos en los tipos de dominio propios.

### 7.4 Discriminated unions para estados de carga

```typescript
// Patrón para estados asíncronos
type EstadoCarga<T> =
  | { estado: 'cargando' }
  | { estado: 'exito'; datos: T }
  | { estado: 'error'; mensaje: string }

// Uso en componente
function VehiculoDetalle({ id }: { id: string }) {
  const resultado: EstadoCarga<Vehiculo> = useVehiculoDetalle(id)

  if (resultado.estado === 'cargando') return <Skeleton />
  if (resultado.estado === 'error') return <ErrorView mensaje={resultado.mensaje} />

  // TypeScript sabe que resultado.datos: Vehiculo aquí
  return <VehiculoCard vehículo={resultado.datos} />
}
```

---

## 8. Sistema de Diseño y Estilos

### 8.1 Tokens de diseño Ruta 360

```typescript
// src/constants/colores.ts
export const Colores = {
  // Primarios
  coral: '#FF5733',          // Color protagonista – CTAs, acciones principales
  coralOscuro: '#E04020',    // Hover / pressed state del coral
  coralSuave: '#FF8A70',     // Estados deshabilitados / fondos sutiles

  // Soporte
  azulPetroleo: '#1A3A4A',   // Headers, textos sobre fondos claros
  azulPetroleoClaro: '#2C5364',

  // Semánticos
  verde: '#27AE60',           // "Todo en orden" – documentos vigentes
  amarillo: '#F39C12',        // Próximo a vencer
  rojo: '#E74C3C',            // Vencido / error / SOS
  azulInfo: '#2980B9',        // Información neutral

  // Neutros
  arena: '#F5F0E8',           // Fondo principal de pantallas
  arenaMedio: '#E8E2D9',      // Separadores, fondos de cards
  gris: '#8E8E93',            // Textos secundarios
  grisSuave: '#C7C7CC',       // Bordes, placeholders
  blanco: '#FFFFFF',
  negro: '#1C1C1E',
} as const

// src/constants/tipografia.ts
export const Tipografia = {
  familia: {
    display: 'Montserrat_700Bold',   // Headers de marca, títulos principales
    cuerpo: 'RobotoFlex_400Regular', // Textos, datos, UI
    cuerpoBold: 'RobotoFlex_600SemiBold',
  },
  tamaño: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    display: 36,
  },
  lineaAltura: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const
```

### 8.2 StyleSheet: siempre fuera del componente

```typescript
// ✅ Correcto: StyleSheet definido fuera, se crea una sola vez
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.arena,
    padding: 16,
  },
  titulo: {
    fontFamily: Tipografia.familia.display,
    fontSize: Tipografia.tamaño.xl,
    color: Colores.azulPetroleo,
  },
})

// ❌ Evitar: objetos inline que se recrean en cada render
<View style={{ flex: 1, backgroundColor: '#F5F0E8', padding: 16 }}>
```

### 8.3 Espaciado consistente

```typescript
// src/constants/config.ts
export const Espaciado = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const
```

### 8.4 No hardcodear valores de diseño

```typescript
// ❌ Evitar
<View style={{ padding: 16, borderRadius: 12, backgroundColor: '#FF5733' }}>

// ✅ Correcto
<View style={{ 
  padding: Espaciado.md, 
  borderRadius: BorderRadius.md, 
  backgroundColor: Colores.coral 
}}>
```

---

## 9. Manejo de Errores y Feedback

### 9.1 Jerarquía de manejo de errores

1. **Servicio:** Captura el error de InsForge, lanza un `Error` con mensaje legible en español.
2. **Hook:** Captura el error del servicio, lo expone como string en el estado.
3. **Componente:** Muestra el mensaje al usuario; nunca muestra el error técnico crudo.

### 9.2 Feedback visual obligatorio

Toda acción asíncrona debe tener tres estados visibles:

```typescript
// Patrón estándar en hooks de mutación
function useCrearVehiculo() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const crear = async (datos: NuevoVehiculoInput) => {
    setCargando(true)
    setError(null)
    setExito(false)

    try {
      await vehiculosService.crear(datos)
      setExito(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setCargando(false)
    }
  }

  return { crear, cargando, error, exito }
}
```

### 9.3 Mensajes de error en español colombiano

Los mensajes de error que ve el usuario deben ser claros, directos y en español. Nunca exponer mensajes técnicos de la librería.

```typescript
// Mapa de errores de InsForge a mensajes de usuario
const MENSAJES_ERROR: Record<string, string> = {
  'duplicate key value': 'Esta placa ya está registrada en tu cuenta.',
  'JWT expired': 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  'network error': 'Sin conexión a internet. Verifica tu red.',
}

function traducirError(error: Error): string {
  for (const [clave, mensaje] of Object.entries(MENSAJES_ERROR)) {
    if (error.message.toLowerCase().includes(clave)) return mensaje
  }
  return 'Algo salió mal. Intenta de nuevo.'
}
```

---

## 10. Rendimiento

### 10.1 Listas: siempre `FlatList` o `FlashList`

Para listas de más de 10 ítems, usar `FlashList` de Shopify (más eficiente que `FlatList`).

```typescript
import { FlashList } from '@shopify/flash-list'

// ✅ Correcto
<FlashList
  data={vehículos}
  renderItem={({ item }) => <VehiculoCard vehículo={item} />}
  estimatedItemSize={120}
  keyExtractor={(item) => item.id}
/>

// ❌ Evitar para listas largas
<ScrollView>
  {vehículos.map((vehículo) => <VehiculoCard key={vehículo.id} vehículo={vehículo} />)}
</ScrollView>
```

### 10.2 Imágenes: siempre con caché

```typescript
import { Image } from 'expo-image'

// ✅ expo-image tiene caché automático y placeholders
<Image
  source={{ uri: vehículo.fotoUrl }}
  placeholder={require('@/assets/images/vehículo-placeholder.png')}
  contentFit="cover"
  transition={200}
  style={estilos.imagenVehiculo}
/>
```

### 10.3 Evitar re-renders innecesarios en callbacks

```typescript
// ✅ Usar useCallback para funciones pasadas como props a listas
const handlePressVehiculo = useCallback((vehiculoId: string) => {
  router.push({ pathname: '/vehículo/[id]', params: { id: vehiculoId } })
}, [])
```

### 10.4 Lazy loading de módulos pesados

```typescript
// OCR y mapas se cargan solo cuando se necesitan
const RadarSOS = lazy(() => import('@/components/sos/RadarMap'))
```

---

## 11. Seguridad

### 11.1 Variables de entorno: nunca hardcodear secretos

```bash
# .env.example (commitear esto)
EXPO_PUBLIC_INSFORGE_URL=https://your-project.insforge.dev
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here

# Nota: EXPO_PUBLIC_ es visible en el bundle.
# Claves privadas (service_role, etc.) SOLO en el backend (Edge Functions de InsForge).
```

### 11.2 Almacenamiento seguro de tokens

Usar `expo-secure-store` para tokens de sesión y datos sensibles. **Nunca** `AsyncStorage` para secretos.

```typescript
import * as SecureStore from 'expo-secure-store'

// Para tokens y datos sensibles
await SecureStore.setItemAsync('token_usuario', token)
const token = await SecureStore.getItemAsync('token_usuario')

// AsyncStorage solo para preferencias UI no sensibles
await AsyncStorage.setItem('tema_preferido', 'claro')
```

### 11.3 Validación de permisos de cámara y ubicación

```typescript
// src/utils/permisos.ts
import { Camera } from 'expo-camera'
import * as Location from 'expo-location'

export async function solicitarPermisoCamara(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync()
  return status === 'granted'
}

export async function solicitarPermisoUbicacion(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  return status === 'granted'
}

// Siempre verificar antes de usar la funcionalidad
const tienePermiso = await solicitarPermisoCamara()
if (!tienePermiso) {
  // Mostrar explicación al usuario
  return
}
```

### 11.4 RLS (Row Level Security)

InsForge usa PostgreSQL con Row Level Security. El cliente de la app **nunca** debe intentar filtrar por `usuario_id` como única protección; las políticas RLS del servidor garantizan que cada usuario solo acceda a sus propios datos.

---

## 12. Testing

### 12.1 Pirámide de tests para MVP

```
         E2E (Maestro)
        _______________
       /               \      → Flujos críticos: registro, OCR, SOS
      /   Integración   \
     /___________________\    → Hooks con mocks de InsForge
    /                     \
   /       Unitarios       \  → Servicios, utils, formatters
  /_________________________\
```

### 12.2 Tests unitarios: Jest + Testing Library

```typescript
// src/utils/__tests__/fechas.test.ts
import { diasParaVencer, calcularEstadoDocumento } from '../fechas'

describe('calcularEstadoDocumento', () => {
  it('retorna "vencido" si la fecha ya pasó', () => {
    expect(calcularEstadoDocumento('2023-01-01')).toBe('vencido')
  })

  it('retorna "proximo_vencer" si faltan 20 días o menos', () => {
    const en15Dias = new Date(Date.now() + 15 * 86400000).toISOString()
    expect(calcularEstadoDocumento(en15Dias)).toBe('proximo_vencer')
  })

  it('retorna "vigente" si falta más de 30 días', () => {
    const en60Dias = new Date(Date.now() + 60 * 86400000).toISOString()
    expect(calcularEstadoDocumento(en60Dias)).toBe('vigente')
  })
})
```

### 12.3 Qué testear en el MVP

- ✅ Funciones utilitarias (fechas, validaciones, formatters)
- ✅ Lógica de cálculo de estado de documentos
- ✅ Transformaciones de datos del OCR
- ✅ Hooks críticos con mocks de InsForge
- ⏳ Componentes UI: solo en iteraciones posteriores al MVP

---

## 13. Control de Versiones y Git

### 13.1 Estrategia de ramas

```
main          → Producción. Solo merge desde release/*
develop       → Integración. Base para features
feature/*     → Una rama por tarea/feature
fix/*         → Correcciones de bugs
release/*     → Preparación de release (bump de versión, QA final)
```

### 13.2 Commits: Conventional Commits (en español)

```
feat(vehículos): agregar registro por OCR de tarjeta de propiedad
fix(documentos): corregir cálculo de días para vencer en SOAT
refactor(auth): simplificar flujo de login con Google
chore(deps): actualizar expo-camera a v14
docs(readme): agregar instrucciones de configuración local
test(fechas): agregar tests para calcularEstadoDocumento
```

Formato: `tipo(módulo): descripción en infinitivo`

### 13.3 Pull Requests

- Cada PR debe referenciar la tarea/issue correspondiente.
- Máximo 400 líneas cambiadas por PR (idealmente menos).
- Al menos 1 revisión antes de hacer merge a `develop`.
- Los PRs a `main` requieren aprobación explícita.

### 13.4 .gitignore crítico

```gitignore
# Variables de entorno
.env
.env.local
.env.*.local

# Expo
.expo/
dist/

# Node
node_modules/

# iOS / Android nativos
ios/
android/

# Caché
.cache/
*.tsbuildinfo
```

---

## 14. Variables de Entorno

### 14.1 Nomenclatura

- `EXPO_PUBLIC_*` → Visible en el bundle del cliente (InsForge URL, anon key)
- Variables sin prefijo → Solo para scripts de build, nunca en el cliente

### 14.2 Validación al inicio

```typescript
// src/constants/config.ts
function validarConfig() {
  const requeridas = [
    'EXPO_PUBLIC_INSFORGE_URL',
    'EXPO_PUBLIC_INSFORGE_ANON_KEY',
  ] as const

  for (const variable of requeridas) {
    if (!process.env[variable]) {
      throw new Error(
        `Variable de entorno faltante: ${variable}. Revisa tu archivo .env.local`
      )
    }
  }
}

validarConfig()

export const Config = {
  insforge: {
    url: process.env.EXPO_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY!,
  },
  entorno: process.env.NODE_ENV ?? 'development',
} as const
```

---

## 15. Builds y Distribución (EAS)

### 15.1 Perfiles de build

```json
// eas.json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "NODE_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "NODE_ENV": "staging" }
    },
    "production": {
      "autoIncrement": true,
      "env": { "NODE_ENV": "production" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "COMPLETAR", "ascAppId": "COMPLETAR" },
      "android": { "serviceAccountKeyPath": "./google-play-key.json" }
    }
  }
}
```

### 15.2 Flujo de releases

```
1. feat/* → PR → develop (tests automáticos)
2. develop → release/x.x.x (bump versión en app.config.ts)
3. eas build --profile preview (QA interno)
4. release/x.x.x → main (aprobación manual)
5. eas build --profile production
6. eas submit (App Store + Play Store)
```

### 15.3 Versioning semántico

```typescript
// app.config.ts
export default {
  expo: {
    name: 'Ruta 360',
    slug: 'ruta360',
    version: '1.0.0',          // Semver: MAJOR.MINOR.PATCH
    ios: {
      buildNumber: '1',        // Incrementado por EAS con autoIncrement
    },
    android: {
      versionCode: 1,          // Incrementado por EAS con autoIncrement
    },
  },
}
```

---


---

## 16. Inteligencia del Código: codebase-memory-mcp

### 16.1 ¿Qué es y por qué usarlo en Ruta 360?

`codebase-memory-mcp` es un servidor MCP que indexa el proyecto en un **knowledge graph persistente** y expone 14 herramientas que Antigravity puede consultar en tiempo real. En lugar de que el AI lea archivos uno por uno (costoso en tokens), hace queries estructurales al grafo en sub-milisegundos.

Esto se alinea directamente con el principio de **arquitectura cost-driven** del proyecto:

| Método | Tokens (5 queries típicas) |
|---|---|
| File-by-file (grep/read) | ~412,000 tokens |
| codebase-memory-mcp (graph queries) | ~3,400 tokens |
| **Ahorro** | **99.2% menos tokens** |

Características clave para el stack de Ruta 360:
- **TypeScript / TSX con Hybrid LSP** → resolución semántica de tipos para React Native y Next.js
- **Binario estático único** → sin Python, sin Docker, sin dependencias adicionales al proyecto
- **100% local** → el código nunca sale de la máquina (crítico para un producto financiero como Ruta 360)
- **Auto-sync** → detecta cambios en archivos y re-indexa en background automáticamente
- **Integración nativa con Antigravity** → configura el MCP y los hooks en un solo comando

### 16.2 Instalación

```bash
# macOS / Linux (una línea)
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash

# Con visualización 3D del grafo (opcional)
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash -s -- --ui

# Windows (PowerShell)
Invoke-WebRequest -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install.ps1
.\install.ps1
```

El comando `install` auto-detecta Antigravity y configura:
- `.gemini/config/mcp_config.json` → entrada del servidor MCP
- `antigravity-cli/AGENTS.md` → instrucciones para el agente
- Hook de `SessionStart` → recordatorio de uso del grafo al inicio de cada sesión

Reiniciar Antigravity después de la instalación.

### 16.3 Uso en Antigravity

```bash
# Paso 1: Indexar el proyecto (una sola vez, luego auto-sync)
"Index this project"    # o decirle al agente directamente en Antigravity

# El agente llama internamente a:
# index_repository(repo_path="/ruta/a/ruta360-app")
```

Habilitar auto-indexado para que nuevas sesiones no requieran indexar manualmente:

```bash
codebase-memory-mcp config set auto_index true
codebase-memory-mcp config set auto_index_limit 50000
```

### 16.4 Las 14 herramientas MCP disponibles

El agente en Antigravity puede usar estas herramientas automáticamente. Las más relevantes para el día a día:

```bash
# Buscar dónde se usa un símbolo
search_graph(name_pattern=".*VehiculoCard.*", label="Function")

# Trazar cadena de llamadas (quién llama a qué, profundidad configurable)
trace_path(function_name="vehiculosService.crear", direction="both")

# Impacto de un cambio antes de modificar código
detect_changes(repo_path=".")

# Arquitectura general del proyecto
get_architecture()

# Query tipo Cypher para análisis personalizados
query_graph(query="MATCH (f:Function)-[:CALLS]->(g) WHERE f.name = 'useCrearVehiculo' RETURN g.name")

# Ver código fuente de una función por nombre calificado
get_code_snippet(qualified_name="ruta360-app.src.services.insforge.vehiculos.crear")

# Detectar código muerto
query_graph(query="MATCH (f:Function) WHERE NOT EXISTS { (f)<-[:CALLS]-() } RETURN f.name, f.file")
```

### 16.5 Flujo de trabajo recomendado

```
Al clonar el repo por primera vez:
  1. curl ... | bash          (instalar codebase-memory-mcp)
  2. Reiniciar Antigravity
  3. "Index this project"     (primera indexación ~segundos para RN app)
  4. Desarrollo normal        (auto-sync mantiene el grafo actualizado)

Antes de un refactor grande:
  detect_changes()            → ver impacto de los cambios sin commitear
  trace_path("función")       → entender dependencias antes de mover código

Al revisar un PR:
  detect_changes()            → blast radius clasificado por riesgo
```

### 16.6 Artifact de equipo (opcional)

Para que todos en el equipo empiecen con el grafo ya indexado sin re-indexar desde cero:

```bash
# La primera persona que indexa genera el artifact automáticamente en:
# .codebase-memory/graph.db.zst  (SQLite comprimido con zstd, ratio 8-13:1)

# Agregar al .gitignore si NO se quiere compartir (cada dev re-indexa)
echo ".codebase-memory/" >> .gitignore

# O commitear para que el equipo lo use como bootstrap
git add .codebase-memory/
git commit -m "chore: agregar knowledge graph artifact para bootstrap de equipo"
```

El archivo `.gitattributes` se configura automáticamente con `merge=ours` para que commits paralelos no generen conflictos en el artifact binario.

### 16.7 Visualización del grafo (opcional)

Si se instaló con `--ui`:

```bash
codebase-memory-mcp --ui=true --port=9749
# Abrir http://localhost:9749
# Visualización 3D interactiva del grafo completo del proyecto
```

Útil para onboarding de nuevos desarrolladores: pueden explorar visualmente cómo fluyen las llamadas entre servicios, hooks y componentes.

### 16.8 Ignorar archivos del grafo

Crear `.cbmignore` en la raíz del proyecto (misma sintaxis que `.gitignore`):

```gitignore
# .cbmignore
node_modules/
.expo/
dist/
graphify-out/
*.generated.ts      # Tipos auto-generados de InsForge (solo lectura)
```

### 16.9 Actualización

```bash
codebase-memory-mcp update
# El servidor también notifica en el primer tool call si hay una versión nueva disponible
```

---

*Repositorio: [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) · MIT License*

## Resumen de Decisiones de Arquitectura

| Decisión | Elección | Alternativa descartada | Razón |
|---|---|---|---|
| Framework móvil | React Native + Expo | Flutter | Consistencia con Next.js (B2B) |
| Routing | Expo Router v3 | React Navigation | File-based, integración nativa con Expo |
| Estado global | Zustand | Redux Toolkit | Menor boilerplate, mejor DX |
| Backend | InsForge | Supabase / Firebase | PostgreSQL + pgvector + MCP nativo para agentes IA |
| Estilos | StyleSheet nativo | NativeWind/Tailwind | Sin dependencias extra en MVP |
| Listas | FlashList | FlatList | 10x más eficiente en listas largas |
| Imágenes | expo-image | react-native-fast-image | Mantenido por Expo, caché automático |
| Almacenamiento seguro | expo-secure-store | AsyncStorage | Cifrado en el dispositivo |
| Code intelligence | codebase-memory-mcp | Graphify | MCP nativo + 99% menos tokens + 100% local |

---

*Documento generado para el proyecto **Ruta 360** – Colombia*  
*Actualizar este documento cuando se tome una decisión arquitectónica que cambie cualquiera de los patrones aquí descritos.*
