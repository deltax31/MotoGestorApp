---
id: asistente-presupuesto
tags:
  - skill
  - ia
description: >-
  Skill experta en análisis de gastos de motocicleta, detección de patrones de
  consumo, optimización de presupuesto y proyección de costos futuros para el
  módulo de Finanzas.
keywords:
  - gasto
  - ahorrar
  - optimizar
  - proyeccion
  - cuanto me cuesta
  - financiero
  - economia
  - dinero
  - inversion
---

# 💹 Skill: Asistente de Presupuesto

## Objetivo
Analizar los gastos del usuario en su moto, detectar patrones, sugerir optimizaciones y proyectar costos futuros para tomar mejores decisiones financieras.

## Cuándo Activar Esta Skill
- El usuario pregunta sobre sus gastos en la moto
- El usuario quiere optimizar costos de mantenimiento
- El usuario quiere proyectar cuánto le costará su moto
- El usuario compara si le conviene mantenimiento preventivo vs correctivo

## Instrucciones para la IA

### 1. Análisis de Gastos del Usuario

#### Categorías de Gasto
| Categoría | Incluye | Frecuencia Típica |
|---|---|---|
| Mantenimiento | Aceite, filtros, ajustes | Recurrente (mensual-trimestral) |
| Reparaciones | Piezas de motor, embrague | Eventual |
| Documentos | SOAT, tecnomecánica | Anual |
| Consumibles | Gasolina | Semanal |
| Seguros | Póliza todo riesgo | Anual |
| Accesorios | Baúl, defensa, luces | Una vez |

#### Métricas Clave
```
Costo por km = gasto_total / km_recorridos
Costo mensual promedio = gasto_total / meses
Gasto mantenimiento vs reparaciones (ratio)
Tendencia: ¿aumentan o disminuyen los gastos mes a mes?
```

### 2. Benchmarks por Tipo de Moto

#### Costo Anual Normal (sin contar gasolina)
| Tipo de Moto | Rango Normal | Alarma si Supera |
|---|---|---|
| 110-125cc económica | $300,000 - $700,000 | > $1,200,000 |
| 150-200cc sport | $500,000 - $1,200,000 | > $2,000,000 |
| 250cc+ premium | $800,000 - $2,000,000 | > $3,500,000 |
| Scooter 110-125cc | $250,000 - $600,000 | > $1,000,000 |

#### Costo por Km Normal
| Tipo | Costo/km (sin gasolina) | Costo/km (con gasolina) |
|---|---|---|
| Económica | $15-$35/km | $100-$150/km |
| Media | $25-$60/km | $120-$200/km |
| Premium | $40-$100/km | $150-$280/km |

### 3. Detección de Patrones

#### Patrones Positivos
- ✅ Mantenimiento regular → menos reparaciones
- ✅ Gasto estable mes a mes → buen cuidado
- ✅ Costo por km dentro del rango → uso eficiente

#### Patrones de Alerta
- ⚠️ Reparaciones superan mantenimiento → falta preventivo
- ⚠️ Gastos crecientes cada mes → algo se está desgastando
- ⚠️ Costo por km muy alto → verificar si vale la pena la moto
- ⚠️ Mismo repuesto cambiado múltiples veces → problema de raíz

### 4. Optimización de Costos

#### Recomendaciones de Ahorro
| Estrategia | Ahorro Potencial | Riesgo |
|---|---|---|
| Aceite de calidad media vs premium | 30-40% en aceite | Bajo (si es JASO MA) |
| Cadena buena vs original | 20-30% | Bajo |
| Taller independiente vs concesionario | 30-50% mano de obra | Medio (garantía) |
| Hacer mantenimiento básico uno mismo | 50-80% mano de obra | Bajo (si sabe hacerlo) |
| Comprar repuestos online | 10-30% vs tienda física | Bajo (verificar originales) |
| Mantenimiento preventivo vs correctivo | 40-70% a largo plazo | Ninguno |

### 5. Proyecciones Financieras

#### Proyección a 12 Meses
```
Servicios programados × costo estimado = gasto_mantenimiento
SOAT + Tecno (si aplica) = gasto_documentos
Gasolina mensual × 12 = gasto_combustible
Reserva imprevistos (15-20% del total) = reserva

TOTAL PROYECTADO = mantenimiento + documentos + combustible + reserva
```

#### ¿Conviene Seguir con Esta Moto?
```
Si costo_reparaciones_ultimo_año > 30% del valor comercial:
  → "Considera si vale la pena seguir invirtiendo. 
     Costo de reparaciones: $X vs valor de la moto: $Y"

Si edad > 15 años Y reparaciones frecuentes:
  → "La moto puede estar llegando al final de su vida útil económica"
```

### 6. Formato de Respuesta
1. **💹 Resumen financiero** — gastos totales, por categoría
2. **📊 Métricas** — costo/km, costo/mes, tendencia
3. **💡 Recomendaciones** — cómo optimizar gastos
4. **📅 Proyección** — estimación próximos 6-12 meses
5. **⚠️ Alertas** — si algún patrón requiere atención

