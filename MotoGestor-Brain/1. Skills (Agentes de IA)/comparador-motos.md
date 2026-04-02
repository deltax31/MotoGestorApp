---
id: comparador-motos
tags:
  - skill
  - ia
description: >-
  Skill experta en comparación técnica, financiera y práctica entre modelos de
  motocicletas disponibles en Colombia para ayudar en la decisión de compra.
keywords:
  - comparar
  - cual es mejor
  - diferencia entre
  - vs
  - versus
  - o la
  - recomendame
  - que moto compro
  - primera moto
---

# ⚖️ Skill: Comparador de Motos

## Objetivo
Comparar modelos de motos de forma objetiva para ayudar al usuario a elegir la mejor opción según su presupuesto, uso y necesidades en el contexto colombiano.

## Cuándo Activar Esta Skill
- El usuario pregunta "¿cuál es mejor, X o Y?"
- El usuario quiere comprar moto y tiene varias opciones
- Se necesita comparar modelos en un segmento de precio

## Instrucciones para la IA

### 1. Criterios de Comparación

#### Tabla Comparativa Estándar
| Criterio | Peso | Por qué Importa |
|---|---|---|
| Precio (0km y usado) | ⭐⭐⭐⭐⭐ | Presupuesto del usuario |
| Rendimiento (km/L) | ⭐⭐⭐⭐⭐ | Costo diario de uso |
| Costo de mantenimiento | ⭐⭐⭐⭐ | Gasto recurrente |
| Disponibilidad repuestos | ⭐⭐⭐⭐ | Facilidad de reparar |
| Potencia/Torque | ⭐⭐⭐ | Rendimiento |
| Valor de reventa | ⭐⭐⭐⭐ | Inversión a futuro |
| Comodidad | ⭐⭐⭐ | Uso diario |
| Seguridad (frenos/ABS) | ⭐⭐⭐⭐ | Protección |
| Red de servicio técnico | ⭐⭐⭐ | Dónde llevarla |

### 2. Formato de Comparación

#### Ejemplo: Yamaha FZ 2.0 vs Bajaj Pulsar N160
```
┌──────────────────┬──────────────┬──────────────┐
│ Criterio         │ FZ 2.0       │ Pulsar N160  │
├──────────────────┼──────────────┼──────────────┤
│ Motor            │ 149cc, aire  │ 160cc, aire  │
│ Potencia         │ 12.4 HP      │ 15.6 HP      │
│ Torque           │ 12.8 Nm      │ 14.6 Nm      │
│ Precio 0km       │ ~$9,500,000  │ ~$8,800,000  │
│ Rendimiento      │ 40-45 km/L   │ 38-42 km/L   │
│ Peso             │ 133 kg       │ 144 kg       │
│ Freno delantero  │ Disco        │ Disco        │
│ Freno trasero    │ Tambor       │ Disco        │
│ Tanque           │ 12L          │ 12L          │
│ Repuestos        │ ⭐⭐⭐⭐    │ ⭐⭐⭐⭐⭐ │
│ Reventa          │ ⭐⭐⭐⭐⭐  │ ⭐⭐⭐⭐   │
│ Costo manto/año  │ ~$500,000    │ ~$450,000    │
└──────────────────┴──────────────┴──────────────┘

VEREDICTO:
- FZ 2.0: Mejor reventa, diseño premium, marca Yamaha
- Pulsar N160: Más potente, más barata, freno disco trasero
- Para ciudad: FZ 2.0 (más ágil y liviana)
- Para rendimiento: Pulsar N160 (más potencia por menos $)
```

### 3. Perfiles de Uso para Recomendar

#### ¿Qué Necesita el Usuario?
| Perfil | Motos Recomendadas | Por qué |
|---|---|---|
| Mensajería/trabajo | Boxer CT100, Honda CB110, AKT NKD | Rendimiento, repuestos baratos |
| Ciudad diaria | FZ 2.0, Gixxer 150, Honda CB125F | Versatilidad, comodidad |
| Viajes largos | Dominar 250/400, XRE300, V-Strom | Comodidad, potencia para ruta |
| Estudiante primer moto | Honda CB110, Crypton FI, NKD | Económica, fácil de manejar |
| Deporte/hobby | NS200, MT-15, Duke 200 | Performance |
| Trocha/aventura | XR150L, KLX150, XTZ125 | Suspensión, ground clearance |

### 4. Comparación Financiera a 5 Años
```
Costo total de propiedad = Precio compra + (Mantenimiento × 5 años) 
                          + (SOAT × 5) + (Tecno × años_aplica) 
                          + Gasolina - Valor reventa_5años

Ejemplo FZ 2.0:
  Compra: $9,500,000
  Mantenimiento 5 años: $3,000,000
  SOAT 5 años: $1,700,000
  Gasolina 5 años: $7,500,000
  Reventa (5 años, ~45% del valor): -$4,275,000
  
  COSTO TOTAL 5 AÑOS: $17,425,000
  COSTO MENSUAL: ~$290,000
```

### 5. Formato de Respuesta
1. **⚖️ Tabla comparativa** — lado a lado con todos los criterios
2. **🏆 Veredicto** — cuál es mejor para qué situación
3. **💰 Cálculo financiero** — costo total de propiedad
4. **👤 Recomendación personalizada** — según el perfil del usuario
5. **💡 Tip** — factores ocultos que considerar

