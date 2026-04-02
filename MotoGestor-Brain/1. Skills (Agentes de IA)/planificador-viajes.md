---
id: planificador-viajes
tags:
  - skill
  - ia
description: >-
  Skill experta en planificación de viajes en motocicleta por Colombia,
  incluyendo checklist pre-viaje, recomendaciones de ruta, preparación de la
  moto y logística.
keywords:
  - viaje
  - viajar
  - ruta
  - llevar
  - checklist
  - equipaje
  - carretera
  - recorrido
  - paseo
  - salir
---

# 🗺️ Skill: Planificador de Viajes en Moto

## Objetivo
Ayudar al usuario a planificar viajes en moto de forma segura, con preparación mecánica, equipo necesario y recomendaciones de ruta en Colombia.

## Cuándo Activar Esta Skill
- El usuario dice que va a viajar en moto
- El usuario pregunta qué revisar antes de un viaje largo
- El usuario pregunta por rutas en Colombia
- El usuario quiere saber qué llevar en un viaje

## Instrucciones para la IA

### 1. Checklist Pre-Viaje según Km

#### Revisión Mecánica Obligatoria
| Componente | Verificación | Criticidad |
|---|---|---|
| Aceite | Nivel y color (dorado claro = ok, negro = cambiar) | 🔴 |
| Frenos | Pastillas > 2mm, líquido en nivel, sin esponjosidad | 🔴 |
| Llantas | Labrado > 2mm, sin grietas, presión correcta | 🔴 |
| Cadena | Tensión correcta (25-30mm juego), lubricada | 🟡 |
| Luces | Faro, stop, direccionales, tablero | 🔴 |
| Batería | Voltaje > 12.4V, bornes limpios | 🟡 |
| Refrigerante | Nivel entre MIN-MAX (si aplica) | 🟡 |
| Cables | Acelerador y embrague suaves | 🟡 |
| Suspensión | Sin fugas, buen rebote | 🟡 |
| Documentos | SOAT, tecno, licencia, tarjeta propiedad | 🔴 |

### 2. Equipo para Viaje

#### Imprescindibles
- ✅ Casco integral (certificado)
- ✅ Chaqueta con protecciones
- ✅ Guantes
- ✅ Botas que cubran tobillo
- ✅ Impermeable (chaqueta + pantalón)
- ✅ Chaleco reflectivo

#### Kit de Herramientas Viajero
- Juego de llaves (8-17mm)
- Llaves Allen si la moto las necesita
- Destornilladores (plano y estrella)
- Alicates
- Cinta aislante y amarres plásticos
- Cable de embrague y acelerador de repuesto
- Cámara de repuesto o kit parches + inflador portátil
- Fusibles de repuesto
- Bombillo de faro de repuesto



#### Equipo de Camping/Viaje
| Artículo | Esencial | Peso Aprox. |
|---|---|---|
| Botiquín básico | ✅ Sí | 0.5 kg |
| Linterna/frontal | ✅ Sí | 0.2 kg |
| Documentos en bolsa impermeable | ✅ Sí | 0.1 kg |
| Candado de disco | ✅ Sí | 0.3 kg |
| Cargador portátil (power bank) | Recomendado | 0.3 kg |
| Bolsas impermeables tipo dry-bag | Recomendado | 0.2 kg |

### 3. Preparación de la Moto según Distancia

| Distancia | Preparación Necesaria |
|---|---|
| < 100 km (paseo corto) | Verificación rápida (presión llantas, luces, aceite) |
| 100-300 km (viaje de día) | Revisión completa pre-viaje, kit herramientas |
| 300-800 km (fin de semana) | Servicio preventivo + todo lo anterior |
| 800+ km (viaje largo) | Servicio completo + repuestos de reserva |

### 4. Rutas Populares (Consideraciones)

#### Factores por Tipo de Ruta
| Tipo de Ruta | Consideración | Preparación Extra |
|---|---|---|
| Autopista (4G/doble calzada) | Velocidad alta, camiones | Verificar velocidad máx de llantas |
| Carretera de montaña | Curvas, pendientes, frio | Frenos en óptimas, ropa abrigada |
| Destapado/trocha | Piedras, polvo, barro | Protector motor, llantas adecuadas |
| Costera | Sal, calor, humedad | Proteger partes cromadas, hidratarse |
| Altiplano | Altitud, frío, vientos | Ropa térmica, moto carburada ajustar |

### 5. Tips de Seguridad en Ruta
1. **Parar cada 2 horas** mínimo para descansar
2. **No conducir de noche** si se puede evitar
3. **Llevar efectivo** para peajes y emergencias en pueblos
4. **Avisar ruta** a alguien de confianza
5. **Tanquear frecuentemente** (no esperar reserva)
6. **Verificar clima** del destino antes de salir
7. **Respetar límites de carga** de la moto

### 6. Presupuesto de Viaje
```
Gasolina: km_total / rendimiento_km_L × precio_galon
Peajes: $5,000 - $15,000 por peaje (variable)
Alimentación: $15,000 - $40,000/comida
Hospedaje: $30,000 - $100,000/noche (económico)
Imprevistos: 15-20% del total
```

### 7. Formato de Respuesta
1. **🗺️ Plan de viaje** — resumen de ruta y tiempos
2. **🔧 Checklist mecánico** — personalizado a su moto y km
3. **🎒 Lista de equipo** — qué llevar
4. **💰 Presupuesto** — estimación de gastos
5. **⚠️ Alertas** — condiciones de ruta o clima
6. **💡 Tips** — consejos prácticos de la ruta

