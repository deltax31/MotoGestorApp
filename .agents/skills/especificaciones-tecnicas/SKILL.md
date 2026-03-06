---
name: especificaciones-tecnicas
description: Skill experta en fichas técnicas completas de motocicletas populares en Colombia, incluyendo torques, capacidades de fluidos, presiones, calibraciones y datos de fábrica.
---

# 📊 Skill: Especificaciones Técnicas por Modelo

## Objetivo
Proveer datos técnicos precisos de fábrica para los modelos de motos más populares en Colombia, permitiendo respuestas exactas sobre torques, capacidades, medidas y calibraciones.

## Cuándo Activar Esta Skill
- El usuario pregunta por torques de apriete
- El usuario necesita capacidades de fluidos (aceite, refrigerante)
- El usuario pregunta por presión de llantas
- El usuario necesita medidas específicas de su moto
- El usuario necesita datos para una reparación

## Instrucciones para la IA

### 1. Datos Técnicos que Siempre Cubrir

#### Información General
- Tipo de motor (2T/4T, cilindros, refrigeración)
- Cilindrada real, diámetro × carrera
- Relación de compresión
- Potencia máxima (HP @ RPM)
- Torque máximo (Nm @ RPM)
- Tipo de transmisión y número de velocidades

#### Capacidades de Fluidos
| Fluido | Dato Necesario |
|---|---|
| Aceite de motor | Capacidad total (L), tipo recomendado, viscosidad |
| Refrigerante | Capacidad (L), tipo (si aplica) |
| Combustible | Capacidad del tanque, reserva, octanaje mínimo |
| Líquido de frenos | Tipo (DOT 3/4), capacidad |
| Aceite de horquilla | Tipo, viscosidad, nivel |

#### Torques de Apriete Críticos
| Componente | Rango Típico |
|---|---|
| Tapón de drenaje de aceite | 20-30 Nm |
| Bujía | 12-18 Nm |
| Tuercas de rueda delantera | 50-75 Nm |
| Tuercas de rueda trasera | 80-120 Nm |
| Tornillos de caliper de freno | 25-35 Nm |
| Tuerca de piñón delantero | 50-80 Nm |
| Corona trasera | 30-45 Nm |
| Culata | Según secuencia específica del modelo |

#### Especificaciones de Llantas y Frenos
| Dato | Información |
|---|---|
| Medida llanta delantera | Ejemplo: 80/100-17, 110/70-17 |
| Medida llanta trasera | Ejemplo: 100/90-17, 140/70-17 |
| Presión delantera | 28-33 PSI (según carga) |
| Presión trasera | 33-41 PSI (según carga) |
| Disco delantero | Diámetro, espesor mínimo |
| Pastillas | Espesor mínimo de material (1-2mm) |

### 2. Modelos de Referencia Rápida

#### Honda
```
CB110: Motor 110cc 4T, aire, 9HP, aceite 0.8L 10W-30, tanque 3.7L
CB125F: Motor 125cc 4T, aire, 11HP, aceite 1.0L 10W-30, tanque 13L
XR150L: Motor 149cc 4T, aire, 12HP, aceite 1.0L 10W-40, tanque 12L
CB190R: Motor 184cc 4T, aire, 16HP, aceite 1.2L 10W-40, tanque 12L
```

#### Yamaha
```
Crypton FI: Motor 115cc 4T, aire, 7.1HP, aceite 0.8L 20W-40, tanque 3.5L
FZ 2.0: Motor 149cc 4T, aire, 12.4HP, aceite 1.15L 10W-40, tanque 12L
MT-15: Motor 155cc 4T, líquido, 18.5HP, aceite 1.05L 10W-40, tanque 10L
MT-03: Motor 321cc 4T, líquido, 42HP, aceite 2.4L 10W-40, tanque 14L
```

#### Bajaj
```
Boxer CT100: Motor 99.2cc 4T, aire, 7.9HP, aceite 0.8L 20W-40, tanque 11.8L
Pulsar NS200: Motor 199.5cc 4T, líquido, 24HP, aceite 1.2L 10W-40, tanque 12L
Dominar 250: Motor 248.8cc 4T, líquido, 27HP, aceite 1.5L 10W-40, tanque 13L
Dominar 400: Motor 373.3cc 4T, líquido, 40HP, aceite 1.8L 10W-40, tanque 13L
```

### 3. Reglas de Respuesta
- Si no se tiene el dato exacto del modelo, dar el rango típico para ese cilindraje
- Siempre recomendar verificar con el manual del propietario
- Indicar si la moto tiene diferencias entre versiones (carburador vs inyección)
- Para torques, siempre mencionar usar torquímetro

### 4. Formato de Respuesta
1. **📊 Especificación solicitada** — dato exacto o rango
2. **📐 Contexto** — por qué importa ese dato
3. **⚠️ Precaución** — consecuencias de usar dato incorrecto
4. **📖 Fuente** — "Manual del propietario" o "Especificación estándar"
