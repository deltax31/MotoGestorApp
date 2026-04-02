---
id: historial-depreciacion
tags:
  - skill
  - ia
description: >-
  Skill experta en análisis de depreciación de motocicletas usadas en Colombia,
  tracking de valor en el tiempo y proyecciones de valor futuro.
keywords:
  - depreciacion
  - devalua
  - cuando vender
  - perdido valor
  - vale menos
  - cuanto pierde
---

# 📉 Skill: Historial de Valor y Depreciación

## Objetivo
Ayudar al usuario a entender cómo se deprecia su moto con el tiempo y uso, y cuándo es el momento óptimo para vender o renovar.

## Cuándo Activar Esta Skill
- El usuario pregunta cuánto ha perdido de valor su moto
- El usuario quiere saber cuándo vender
- Se necesita calcular depreciación para análisis financiero

## Instrucciones para la IA

### 1. Curvas de Depreciación por Segmento

#### Depreciación Anual Promedio
```
Año 1:  15-20% (mayor pérdida, "sale del concesionario")
Año 2:  8-12%
Año 3:  6-10%
Año 4-5:  5-8%
Año 6-8:  3-6%
Año 9-12: 2-4%
Año 13+:  1-3% (se estabiliza, algunas se "clásican")
```

#### Factor de Marca (multiplica la depreciación base)
| Marca | Factor | Razón |
|---|---|---|
| Honda | 0.85 (menor depreciación) | Alta demanda de usadas |
| Yamaha | 0.90 | Buena reputación |
| Suzuki | 0.95 | Demanda estable |
| Kawasaki | 0.95 | Nicho pero deseada |
| Bajaj | 1.05 | Más depreciación |
| AKT/TVS/Hero | 1.15 (mayor depreciación) | Mercado precio-sensible |

### 2. Cálculo de Valor Actual
```
valor_actual = precio_nuevo × (1 - depreciacion_acumulada) × factor_marca × factor_km × factor_estado

donde:
  factor_km:
    < 10,000 km = 1.05
    10,000-30,000 = 1.00
    30,000-60,000 = 0.93
    60,000-100,000 = 0.85
    > 100,000 = 0.75
    
  factor_estado:
    Excelente = 1.10
    Bueno = 1.00
    Regular = 0.85
    Malo = 0.65
```

### 3. Timeline de Valor (Ejemplo)
```
Honda CB125F — Precio nuevo: $7,200,000

Año  | Valor Estimado | Pérdida Total | % Retenido
0    | $7,200,000     | $0            | 100%
1    | $6,120,000     | $1,080,000    | 85%
2    | $5,400,000     | $1,800,000    | 75%
3    | $4,680,000     | $2,520,000    | 65%
5    | $3,600,000     | $3,600,000    | 50%
7    | $2,880,000     | $4,320,000    | 40%
10   | $2,160,000     | $5,040,000    | 30%
```

### 4. Momento Óptimo para Vender/Renovar

#### Indicadores de que es Buen Momento
- Reparaciones del año superan el 25% del valor actual
- La moto tiene 3-5 años (aún retiene buen valor)
- Sale un modelo nuevo que devalúa el anterior
- El mantenimiento se vuelve cada vez más costoso

#### Indicadores de Mantener
- La moto funciona bien y los gastos son estables
- El costo de cambiar supera el beneficio
- El modelo mantiene buena demanda (Honda, Yamaha)

### 5. Formato de Respuesta
1. **📉 Valor estimado actual** — con rango
2. **📊 Curva de depreciación** — timeline pasado y futuro
3. **💰 Costo de propiedad** — vs valor perdido
4. **🎯 Momento recomendado** — cuándo vender/renovar
5. **💡 Tips** — cómo mantener mejor valor de reventa

