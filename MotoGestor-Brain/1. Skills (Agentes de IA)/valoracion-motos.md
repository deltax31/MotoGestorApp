---
id: valoracion-motos
tags:
  - skill
  - ia
description: >-
  Skill experta en estimación de precio comercial de motocicletas usadas en
  Colombia basándose en modelo, año, kilometraje, estado general y ciudad.
keywords:
  - cuanto vale mi moto
  - vender
  - valorar
  - precio usado
  - reventa
  - cuanto puedo pedir
  - comprar usada
---

# 💎 Skill: Valoración de Motos (Compra/Venta)

## Objetivo
Estimar el precio comercial de una moto usada en el mercado colombiano, ayudando al usuario a tomar decisiones informadas al comprar o vender.

## Cuándo Activar Esta Skill
- El usuario pregunta "¿cuánto vale mi moto?"
- El usuario quiere comprar una moto usada y necesita referencia
- El usuario quiere vender y no sabe qué precio poner
- Se solicita comparación de valor entre modelos

## Instrucciones para la IA

### 1. Factores de Valoración

#### Factor Principal: Depreciación por Edad
| Año | Depreciación Acumulada (desde precio 0km) |
|---|---|
| 1er año | 15-20% |
| 2do año | 25-35% |
| 3er año | 35-45% |
| 5to año | 45-55% |
| 7mo año | 55-65% |
| 10+ años | 65-80% |

#### Factor Secundario: Kilometraje
| Km | Ajuste |
|---|---|
| < 10,000 km | +5% (bajo uso) |
| 10,000-30,000 km | Base (uso normal) |
| 30,000-60,000 km | -5 a -10% |
| 60,000-100,000 km | -10 a -20% |
| > 100,000 km | -20 a -35% |

#### Otros Factores
| Factor | Efecto en Precio |
|---|---|
| Color popular (negro, rojo) | +2-5% |
| Color impopular (verde, naranja) | -3-5% |
| Documentos al día | +5% (vs sin tecno/soat) |
| Único dueño | +5-10% |
| Accesorios premium | +3-8% |
| Marcas de accidente | -10 a -30% |
| Motor modificado | -5 a -15% (incertidumbre) |
| Factura original | +3-5% |

### 2. Valores de Referencia por Modelo

#### Tabla de Depreciación Promedio
```
Fórmula simplificada:
Valor_estimado = Precio_nuevo × (1 - depreciacion_edad) × factor_km × factor_estado

Ejemplo: Yamaha FZ 2.0, 2023, 15,000 km, buen estado
  Precio nuevo: $9,500,000
  Depreciación 3 años: 40%
  Factor km (15,000 = normal): 1.0
  Factor estado (bueno): 1.0
  
  Valor ≈ $9,500,000 × 0.60 × 1.0 = $5,700,000
  Rango: $5,200,000 - $6,200,000
```

### 3. Marcas con Mejor Valor de Reventa
| Ranking | Marca | Razón |
|---|---|---|
| 1️⃣ | Honda | Confiabilidad percibida, alta demanda |
| 2️⃣ | Yamaha | Calidad y diseño, buena reputación |
| 3️⃣ | Suzuki | Mecánica confiable |
| 4️⃣ | Kawasaki | Nicho performance |
| 5️⃣ | Bajaj | Popular pero depreciación mayor |
| 6️⃣ | AKT/TVS/Hero | Mayor depreciación, mercado precio-sensible |

### 4. Checklist para Compradores

#### Documentos a Verificar
- [ ] Tarjeta de propiedad a nombre del vendedor
- [ ] SOAT vigente
- [ ] Tecnomecánica vigente (si aplica)
- [ ] Sin comparendos pendientes (SIMIT)
- [ ] Sin prendas o embargos (certificado de tradición)
- [ ] Factura original (primera venta)
- [ ] Historial de mantenimiento (si tiene)

#### Inspección Mecánica
- [ ] Arranque en frío (sin ruidos raros)
- [ ] Humo de escape normal
- [ ] Frenos efectivos
- [ ] Suspensión sin fugas
- [ ] Tablero sin luces de alerta
- [ ] Cadena y piñones (desgaste)
- [ ] Llantas con labrado
- [ ] Chasis sin fisuras o soldaduras

### 5. Formato de Respuesta
1. **💎 Valor estimado** — rango bajo-alto
2. **📊 Factores** — qué sube o baja el precio
3. **📈 Tendencia** — si el modelo se aprecia o no
4. **💡 Consejo** — precio justo para la negociación
5. **✅ Checklist** — verificaciones antes de cerrar

