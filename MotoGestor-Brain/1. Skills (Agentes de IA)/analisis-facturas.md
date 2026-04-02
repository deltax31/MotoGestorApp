---
id: analisis-facturas
tags:
  - skill
  - ia
description: >-
  Skill experta en extracción y análisis de datos de facturas de talleres de
  motos en Colombia, incluyendo formatos comunes, IVA, retención y detección de
  cobros irregulares.
keywords:
  - factura
  - recibo
  - cobro
  - le cobraron
  - justo
  - taller
  - cuenta
  - boleta
---

# 🧾 Skill: Análisis de Facturas y Recibos

## Objetivo
Mejorar la extracción automática de datos de facturas/recibos de talleres de motos fotografiadas por el usuario, reconociendo formatos colombianos comunes.

## Cuándo Activar Esta Skill
- El usuario sube una foto de factura en el módulo de mantenimiento
- El usuario quiere validar si le cobraron bien
- Se necesita interpretar datos de un recibo de taller

## Instrucciones para la IA

### 1. Datos a Extraer de Facturas

#### Campos Prioritarios
| Campo | Dónde Buscar | Formato Típico |
|---|---|---|
| Nombre del taller | Encabezado, logo | Texto |
| NIT/RUT | Bajo el nombre | XXX.XXX.XXX-X |
| Fecha | Encabezado o pie | DD/MM/AAAA |
| Tipo de servicio | Cuerpo de factura | Texto descriptivo |
| Costo mano de obra | Desglose | $XX,XXX |
| Costo repuestos | Desglose o líneas | $XX,XXX cada uno |
| Subtotal | Antes de impuestos | $XXX,XXX |
| IVA (19%) | Línea separada | $XX,XXX |
| Total | Final | $XXX,XXX |
| Kilometraje | A veces en observaciones | XX,XXX km |

### 2. Formatos de Factura Comunes en Colombia

#### Recibo Informal (Taller pequeño)
```
Características:
- Papel bond o cuaderno
- Escritura a mano
- Sin IVA desglosado
- Puede no tener NIT
- Firma del mecánico

Datos a extraer: servicio, costo total, taller (nombre)
```

#### Factura POS (Impresora térmica)
```
Características:
- Papel angosto
- Letra pequeña
- NIT y resolución DIAN
- Consecutivo de factura
- Desglose automático

Datos a extraer: todos los campos disponibles
```

#### Factura Electrónica (Concesionario)
```
Características:
- Formato completo
- Código QR DIAN
- Desglose detallado de repuestos
- Garantía mencionada
- IVA discriminado

Datos a extraer: todos los campos + verificar garantía
```

### 3. Mapeo de Servicios

#### Traducciones Comunes de Taller a App
| En la Factura | Tipo en MotoGestor |
|---|---|
| "Cambio aceite", "Lubricantes" | Cambio de aceite |
| "Filtro A/A", "Elemento filtrante" | Filtro de aire |
| "Bandas", "Pastillas" | Frenos delanteros/traseros |
| "Kit arrastre", "Cadena/piñón" | Cadena y piñones |
| "Bujía", "Spark plug" | Bujías |
| "Revisión Gral", "Servicio completo" | Revisión general |
| "Batería", "Acumulador" | Batería |
| "Cauchos", "Neumáticos" | Llantas |

### 4. Validación de Cobros

#### Señales de Alerta
| Señal | Evaluación |
|---|---|
| Total > rango normal sin explicación | ⚠️ Posible cobro excesivo |
| Repuesto sin marca ni referencia | 🟡 Pedir especificación |
| "Revisión computador" en moto carburada | 🔴 Cobro innecesario |
| Mano de obra > costo del repuesto | 🟡 Normal solo en trabajos complejos |
| Múltiples repuestos cambiados de golpe | 🟡 Verificar necesidad real |

### 5. Formato JSON de Salida (para Escaneo IA)
```json
{
  "workshop": "Nombre del taller",
  "cost": 85000,
  "type": "Cambio de aceite",
  "notes": "Aceite Motul 5100 10W-40 + filtro OEM",
  "km": 15200,
  "date": "2026-02-15",
  "items": [
    {"description": "Aceite Motul 5100 1L", "cost": 45000},
    {"description": "Filtro de aceite", "cost": 18000},
    {"description": "Mano de obra", "cost": 22000}
  ]
}
```

### 6. Formato de Respuesta
1. **🧾 Datos extraídos** — resumen de la factura
2. **✅ Validación** — si el cobro está en rango normal
3. **📊 Desglose** — repuestos vs mano de obra
4. **💡 Observación** — si hay algo inusual

