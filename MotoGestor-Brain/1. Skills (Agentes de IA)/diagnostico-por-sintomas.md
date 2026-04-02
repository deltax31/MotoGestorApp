---
id: diagnostico-por-sintomas
tags:
  - skill
  - ia
description: >-
  Skill experta en diagnóstico de fallas mecánicas en motocicletas a partir de
  síntomas descritos por el usuario (ruidos, vibraciones, humo, olores,
  comportamiento anormal).
keywords:
  - ruido
  - vibra
  - vibracion
  - humo
  - olor
  - falla
  - no enciende
  - no arranca
  - se apaga
  - pierde potencia
  - consumo excesivo
  - recalienta
  - calienta
  - frena mal
  - tiembla
  - cascabeleo
  - golpeteo
  - silbido
  - suena raro
  - problema
  - sintoma
---

# 🔍 Skill: Diagnóstico por Síntomas

## Objetivo
Permitir al MotoBot diagnosticar fallas mecánicas en motocicletas a partir de los síntomas que describe el usuario, utilizando árboles de decisión lógicos y conocimiento mecánico experto.

## Cuándo Activar Esta Skill
- El usuario describe un **síntoma**: ruido, vibración, humo, olor, pérdida de potencia, consumo excesivo, etc.
- El usuario dice que algo "no funciona", "suena raro", "se siente diferente"
- El usuario pide ayuda para saber si debe ir al taller o puede resolver solo

## Instrucciones para la IA

### 1. Recopilar Información Inicial
Antes de diagnosticar, SIEMPRE preguntar (si no se ha proporcionado):
- **¿Qué modelo y año de moto tiene?** (verificar en motos registradas)
- **¿Cuántos km tiene actualmente?**
- **¿Cuándo comenzó el síntoma?** (repentino vs gradual)
- **¿En qué condiciones ocurre?** (frío, caliente, en movimiento, al frenar, al acelerar)

### 2. Árboles de Diagnóstico por Síntoma

#### 🔊 RUIDOS
```
Ruido al encender → Motor de arranque (verificar batería, bendix, relay)
Ruido al acelerar → Cadena floja, piñones desgastados, válvulas desajustadas
Ruido al frenar → Pastillas gastadas, disco deformado, material atrapado
Ruido constante → Rodamientos (rueda, dirección, motor), escape suelto
Ruido al girar → Rodamientos de dirección, columna de dirección
Golpeteo en motor → Biela, pistón, holgura excesiva, bajo nivel de aceite
Silbido → Fuga de vacío en carburador/inyección, empaque de escape
Cascabeleo → Cadena de distribución estirada (motos 4T con cadena)
```

#### 💨 HUMO POR EL ESCAPE
```
Humo blanco → Normal al encender en frío / Empaque de culata dañado si persiste
Humo azul → Consumo de aceite: anillos gastados, guías de válvula, retenes
Humo negro → Mezcla rica: carburador desajustado, filtro de aire sucio, inyector
```

#### 🌡️ TEMPERATURA
```
Se calienta mucho → Bajo nivel de refrigerante, termostato pegado, radiador tapado
                     Aceite viejo/nivel bajo, ventilador no enciende (si tiene)
Se calienta rápido → Fuga de refrigerante, bomba de agua, empaque de culata
No calienta → Termostato abierto permanente (poco común en motos)
```

#### ⚡ ARRANQUE
```
No enciende (sin sonido) → Batería muerta, fusible, switch de kill, pata lateral
No enciende (gira pero no prende) → Bujía, combustible, compresión, sensor
Enciende y se apaga → Ralentí bajo, carburador sucio, filtro tapado, IAC
Enciende difícil en frío → Choke/enricher, bujía vieja, válvula de combustible
Enciende difícil en caliente → Mezcla muy rica, válvulas desajustadas
```

#### 🏍️ COMPORTAMIENTO EN MARCHA
```
Pierde potencia gradualmente → Filtro de aire, bujía, cadena, embrague patina
Pierde potencia repentina → Combustible, bobina, CDI, cable acelerador
Vibra mucho → Soportes de motor, desbalanceo de ruedas, cadena
Jala a un lado → Presión de llantas desigual, horquilla torcida, rin
Se sacude al frenar → Disco pandeado, pastillas cristalizadas
Consumo excesivo de gasolina → Carburador rico, filtro, bujía, arrastre de frenos
```

#### 👃 OLORES
```
Olor a quemado → Embrague patinando, cable atrapado, fuga de aceite en escape
Olor a gasolina → Fuga en mangueras, carburador derramando, inyector
Olor eléctrico → Cable derretido, corto circuito, regulador
```

### 3. Niveles de Urgencia en la Respuesta

| Nivel | Indicador | Acción Recomendada |
|---|---|---|
| 🟢 **Leve** | Desgaste normal, ajuste menor | "Puedes seguir usando la moto, pero programa el servicio pronto" |
| 🟡 **Moderado** | Afecta rendimiento o comodidad | "Te recomiendo llevarla al taller esta semana" |
| 🔴 **Urgente** | Seguridad comprometida | "⚠️ NO uses la moto hasta que un mecánico la revise" |

### 4. Formato de Respuesta

Siempre responder con esta estructura:
1. **🔍 Posibles causas** (ordenadas de más probable a menos probable)
2. **🛠️ Verificación rápida** que el usuario puede hacer en casa
3. **💰 Costo estimado** de reparación en COP (rango)
4. **⚠️ Nivel de urgencia** (usar tabla de arriba)
5. **💡 Tip preventivo** para evitar que vuelva a ocurrir

### 5. Preguntas de Seguimiento Inteligentes
Si el diagnóstico inicial no es claro, hacer preguntas específicas:
- "¿El ruido es metálico o sordo?"
- "¿Ocurre solo cuando el motor está frío o también caliente?"
- "¿Cambia con las RPM o es constante?"
- "¿Notaste alguna fuga de líquido debajo de la moto?"
- "¿La moto jala diferente en alguna marcha?"

### 6. Advertencias de Seguridad
- ⚠️ NUNCA sugerir reparaciones que comprometan frenos o dirección sin mecánico
- ⚠️ Si los síntomas indican falla de frenos, URGIR visita inmediata al taller
- ⚠️ Si hay olor a gasolina fuerte, advertir riesgo de incendio
- ⚠️ Si hay fuga de aceite abundante, NO usar la moto

