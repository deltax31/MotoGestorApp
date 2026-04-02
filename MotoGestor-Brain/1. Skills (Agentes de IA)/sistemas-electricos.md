---
id: sistemas-electricos
tags:
  - skill
  - ia
description: >-
  Skill experta en diagnóstico y mantenimiento de sistemas eléctricos de
  motocicletas incluyendo batería, sistema de carga, iluminación, arranque,
  sensores e inyección electrónica.
keywords:
  - bateria
  - luces
  - electrico
  - fusible
  - regulador
  - led
  - arranque
  - carga
  - no prende
  - tablero
  - bombillo
  - direccional
  - sensor
  - check engine
  - inyeccion
---

# ⚡ Skill: Sistemas Eléctricos

## Objetivo
Guiar al usuario en el diagnóstico y comprensión de los sistemas eléctricos de su moto, desde la batería hasta los sensores de inyección, con pasos de verificación que pueda hacer en casa.

## Cuándo Activar Esta Skill
- El usuario tiene problemas eléctricos (batería, luces, arranque)
- El usuario pregunta sobre el sistema de carga
- Problemas con sensores, inyección electrónica o tablero
- El usuario quiere instalar accesorios eléctricos

## Instrucciones para la IA

### 1. Sistema de Carga

#### Componentes y su Función
```
Estátor (generador) → Produce corriente alterna (AC)
Regulador/Rectificador → Convierte AC a DC y regula voltaje (13.5-14.5V)
Batería → Almacena energía DC (12V), arranca motor
CDI/ECU → Control de chispa y/o inyección
```

#### Diagnóstico del Sistema de Carga
| Síntoma | Causa Probable | Verificación |
|---|---|---|
| Batería se descarga rápido | Regulador dañado, estátor débil | Medir voltaje con motor encendido: debe estar entre 13.5-14.5V |
| Batería no carga | Regulador, cables, fusible | Verificar fusible principal y conexiones |
| Luces se atenúan al ralentí | Normal en algunas motos / estátor débil | Si se atenúan mucho, verificar estátor |
| Batería hinchada | Sobrecarga (regulador dañado) | ⚠️ Cambiar batería Y regulador |

### 2. Sistema de Arranque

#### Arranque Eléctrico
```
Botón → Relay de arranque → Motor de arranque (bendix) → Motor
```

| Problema | Diagnóstico |
|---|---|
| Click pero no gira | Batería baja, bornes sulfatados, relay |
| Sin ningún sonido | Fusible, switch de kill, switch de pata lateral, interlock |
| Gira lento | Batería descargada, motor de arranque desgastado |
| Gira bien pero no enciende | Bujía, combustible, compresión, sensor CKP |

#### Switch de Seguridad (Kill/Interlock)
- **Kill switch**: Debe estar en ON (posición RUN)
- **Switch de pata lateral**: La moto no enciende con la pata abajo y cambio puesto
- **Switch de embrague**: Algunas motos requieren embrague presionado para arrancar

### 3. Sistema de Iluminación

#### Bombillos Comunes
| Posición | Tipo Común | Potencia |
|---|---|---|
| Faro principal | H4 (12V, 35/35W o 60/55W) | Halógeno |
| Faro principal LED (conversión) | H4 LED | 25-40W |
| Direccionales | S25 (12V, 10W) o LED | Ámbar |
| Stop/cola | S25 (12V, 21/5W) | Doble filamento |
| Tablero | T10/T5 LED | 1-5W |

#### Problemas Comunes de Luces
| Problema | Causa |
|---|---|
| Faro parpadea | Conexión suelta, regulador, bombillo flojo |
| Direccional rápida | Bombillo quemado en el lado opuesto |
| Luces tenues | Batería baja, masa deficiente |
| LED no funciona | Polaridad invertida, resistencia faltante |

### 4. Sensores en Motos con Inyección

#### Sensores Principales
| Sensor | Función | Síntoma si Falla |
|---|---|---|
| **CKP** (Posición cigüeñal) | Sincroniza chispa e inyección | No enciende |
| **TPS** (Posición acelerador) | Mide apertura del acelerador | Mal ralentí, tirones |
| **IAT** (Temperatura aire) | Ajusta mezcla por temperatura | Mezcla incorrecta |
| **ECT** (Temperatura motor) | Ajusta enriquecimiento frío | Difícil arranque en frío |
| **O2/Lambda** | Mide gases de escape | Consumo alto |
| **MAP** (Presión absoluta) | Mide vacío del motor | Pérdida de potencia |

#### Código de Errores (Check Engine)
- Si la luz del check engine parpadea, contar los parpadeos (código Blink)
- Patrón: parpadeos largos = decenas, cortos = unidades
- Ejemplo: 2 largos + 3 cortos = código 23
- Recomendar escáner OBD si la moto lo soporta

### 5. Batería

#### Tipos de Batería para Motos
| Tipo | Mantenimiento | Vida Útil | Ejemplo |
|---|---|---|---|
| Convencional (ácido) | Rellenar agua destilada | 12-18 meses | YB5L-B |
| Libre mantenimiento (MF) | Ninguno | 18-24 meses | YTX5L-BS |
| Gel | Ninguno | 24-36 meses | YTX5L-BS GEL |
| Litio (LiFePo4) | Ninguno | 36-60 meses | HJTX5L-FP |

#### Cuidado de la Batería
- Verificar voltaje: 12.4-12.8V (motor apagado)
- Limpiar bornes con bicarbonato y agua
- Si no usa la moto por 2+ semanas, desconectar borne negativo
- No dejar que baje de 12.0V (daño permanente)

### 6. Instalación de Accesorios Eléctricos

#### Reglas para Accesorios
1. **Siempre usar relay** para consumos > 10W (faros LED, sirenas)
2. **Usar fusible** apropiado en toda instalación
3. **No exceder capacidad** del estátor (típico 120-250W total)
4. **Conexiones soldadas** o con terminales tipo espada (no torcer cables)
5. **Cable calibre correcto**: 18 AWG para luces, 14 AWG para faros potentes

### 7. Formato de Respuesta
1. **⚡ Diagnóstico** — causa más probable
2. **🔍 Verificación** — pasos que puede hacer solo
3. **🔧 Solución** — reparación o componente a cambiar
4. **💰 Costo** — estimado en COP
5. **⚠️ Seguridad** — advertencias si aplica
6. **🔌 Herramientas** — multímetro, herramientas necesarias

