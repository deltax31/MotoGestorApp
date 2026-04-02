---
id: motor-transmision
tags:
  - skill
  - ia
description: >-
  Skill experta en motores de motocicleta (2T/4T), sistemas de transmisión,
  embrague, sistemas de alimentación (carburador e inyección) y diagnóstico de
  problemas internos del motor.
keywords:
  - motor
  - embrague
  - caja
  - cambios
  - carburador
  - inyeccion
  - piston
  - valvulas
  - transmision
  - patina
  - cilindro
  - compresion
  - biela
  - anillos
  - culata
  - velocidades
---

# ⚙️ Skill: Motor y Transmisión

## Objetivo
Proveer conocimiento profundo sobre el funcionamiento de motores y transmisiones de motos para responder preguntas avanzadas de mecánica y ayudar en diagnósticos complejos.

## Cuándo Activar Esta Skill
- El usuario pregunta sobre el funcionamiento del motor
- Problemas de embrague, caja de cambios o transmisión
- Diferencias entre carburador e inyección
- Preguntas sobre rendimiento, potencia o consumo del motor
- El usuario quiere entender qué pasa dentro de su motor

## Instrucciones para la IA

### 1. Tipos de Motor

#### Motor 4 Tiempos (4T) — Mayoría de motos actuales
```
Admisión → Compresión → Combustión → Escape
- Aceite en cárter separado
- Cambio de aceite cada 2,000-5,000 km
- Válvulas requieren ajuste periódico
- Más eficiente en combustible
```

#### Motor 2 Tiempos (2T) — Motos antiguas/enduro
```
Compresión+Admisión → Combustión+Escape
- Aceite mezclado con gasolina (o bomba de aceite)
- No requiere ajuste de válvulas (no tiene)
- Mayor potencia por cc pero más contaminante
- Cada vez más raro en calle (normativa ambiental)
```

### 2. Componentes del Motor y sus Problemas

#### Pistón y Cilindro
| Problema | Síntoma | Causa |
|---|---|---|
| Anillos desgastados | Humo azul, consumo de aceite | Desgaste natural, sobrecalentamiento |
| Pistón rayado | Pérdida de compresión, ruido | Falta de aceite, contaminación |
| Sobre-medida necesaria | Motor cansado | Desgaste excesivo del cilindro |

#### Válvulas (Solo 4T)
| Problema | Síntoma | Solución |
|---|---|---|
| Válvulas desajustadas | Tictac en motor, pérdida de potencia | Ajustar holgura con galgas |
| Válvulas quemadas | Compresión baja, pérdida de potencia | Rectificar o cambiar válvulas |
| Resortes débiles | RPM altas inestables | Cambiar resortes de válvula |

**Holgura típica de válvulas:**
- Admisión: 0.05-0.10mm (frío)
- Escape: 0.10-0.15mm (frío)
- ⚠️ Siempre verificar especificación del modelo exacto

#### Culata y Empaques
| Problema | Síntoma |
|---|---|
| Empaque de culata dañado | Humo blanco, mezcla aceite-refrigerante, pérdida de compresión |
| Culata alabeada | Fuga de compresión, sobrecalentamiento recurrente |

### 3. Sistema de Embrague

#### Embrague Húmedo (Motos)
```
Funciona sumergido en aceite del motor
Discos de fricción + discos de acero alternados
Accionado por cable (mecánico) o hidráulico
```

| Problema | Síntoma | Causa |
|---|---|---|
| Embrague patina | Motor sube RPM pero moto no acelera | Discos gastados, aceite incorrecto, cable |
| Embrague no desembraga | Marchas difíciles, moto camina sola | Cable desajustado, discos pegados |
| Ruido en embrague | Cascabeleo al soltar embrague | Resortes débiles, canastilla desgastada |

**Aceite y embrague**: Usar SIEMPRE aceite JASO MA/MA2. NUNCA usar aceite con aditivos antifricción (destroza los discos).

### 4. Caja de Cambios

#### Tipos en Motos
- **Manual secuencial**: 1-N-2-3-4-5(-6) — La mayoría de motos
- **Semiautomática**: Sin clutch manual, cambios con pie — Honda Wave, etc.
- **CVT (Variador)**: Scooters — Correa + poleas

| Problema | Síntoma | Causa |
|---|---|---|
| Se sale de marcha | Cambio salta solo a neutral | Horquillas de cambio dobladas, garras desgastadas |
| Falsea al cambiar | Difícil meter cambio | Cable embrague, selector, aceite viejo |
| Ruido en marcha | Zumbido o crujido | Rodamientos, piñones internos desgastados |

### 5. Sistema de Alimentación

#### Carburador
```
Componentes: cuba, flotador, chicler principal, chicler lento, aguja, starter (choke)
Ajuste: tornillo de aire/mezcla, tornillo de ralentí, nivel de flotador
```

| Problema | Causa | Solución |
|---|---|---|
| Gotea gasolina | Flotador pegado, aguja de paso desgastada | Limpiar o cambiar |
| Ralentí inestable | Chicler lento tapado, empaque | Limpieza ultrasónica |
| Se ahoga al acelerar | Membrana rota, chicler principal tapado | Limpiar, verificar membrana |

#### Inyección Electrónica
```
Componentes: bomba de combustible, inyector, cuerpo de aceleración, ECU, sensores
Ventajas: mejor consumo, menos contaminación, arranque en frío superior
```

| Problema | Causa | Solución |
|---|---|---|
| Check engine encendido | Sensor dañado, inyector, ECU | Leer código de error |
| Inyector tapado | Combustible contaminado, sedimentos | Limpieza por ultrasonido o cambio |
| Bomba de combustible | No hay presión de combustible | Verificar relay, fusible, bomba |

### 6. Kit de Arrastre (Transmisión Secundaria)

#### Componentes
- **Piñón delantero** (motriz): Menor cantidad de dientes
- **Corona trasera** (conducida): Mayor cantidad de dientes
- **Cadena**: Conecta ambos

#### Relación de Transmisión
```
Piñón +1 diente = Más velocidad final, menos fuerza
Piñón -1 diente = Más fuerza (arranque), menos velocidad
Corona +2 dientes ≈ Piñón -1 diente
```

**Regla de oro**: Siempre cambiar cadena Y piñones juntos.

### 7. Formato de Respuesta
1. **⚙️ Explicación** clara del sistema o componente
2. **🔍 Diagnóstico** si hay un problema
3. **🔧 Solución** y nivel de dificultad (DIY vs taller)
4. **💰 Costo** estimado de reparación en COP
5. **⚠️ Advertencia** si la reparación es delicada
6. **📚 Dato técnico** interesante para usuarios curiosos

