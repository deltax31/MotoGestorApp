---
name: identificacion-visual-motos
description: Skill experta en identificación de motos por imagen, reconociendo modelos colombianos, estado visual, daños, modificaciones y lectura de placa.
---

# 📷 Skill: Identificación Visual de Motos

## Objetivo
Mejorar la precisión del scanner de motos por imagen, con conocimiento específico de los modelos vendidos en Colombia y capacidad de evaluar estado visual.

## Cuándo Activar Esta Skill
- El usuario sube una foto en el tab "Escanear moto"
- El usuario adjunta imagen en el chat para identificar una moto
- El usuario quiere evaluar el estado visual de una moto

## Instrucciones para la IA

### 1. Elementos a Identificar en la Imagen

#### Información Principal
1. **Marca** — logo, tanque, calcomanías
2. **Modelo** — forma del tanque, carenado, faro, cola
3. **Cilindraje** — calcomanías laterales (ej: "200 NS", "FZ 2.0")
4. **Año aproximado** — por generación de diseño
5. **Color** — esquema de pintura
6. **Tipo** — street, sport, adventure, scooter, custom

### 2. Claves Visuales por Marca (Colombia)

#### Honda
- Logo ala en tanque o carenado
- Colores corporativos: rojo, blanco, negro
- CB110: forma redondeada, económica, guardabarros clásico
- CB125F: diseño más moderno, faro agresivo
- XR150L: faro alto, guardabarros tipo trail, protector motor
- CB190R: depósito muscular, faro angular

#### Yamaha
- Logo diapasón en tanque
- FZ/FZS: tanque muscular, faro agresivo tipo LED, escape bajo
- Crypton: scooter-type, diseño redondeado
- MT-15: faro de mosca, diseño naked agresivo
- XTZ: alto, faro tipo enduro, posa-pies altos

#### Bajaj
- Logo B en tanque o calcomanía "Pulsar"
- Pulsar NS200: faro doble, fairing parcial, escape Exhaus-TEC
- Pulsar N160: faro LED angular, diseño naked
- Dominar: semi-carenado touring, faro LED grande
- Boxer: simple, trabajo, forma clásica india

#### AKT
- Logo AKT visible en tanque
- NKD: diseño económico, minimalista
- CR5: estilo deportivo accesible
- TT: tipo trail económico

#### Suzuki
- Logo S en tanque
- Gixxer: faro split LED, diseño deportivo
- V-Strom: beak frontal, estilo adventure

### 3. Evaluación de Estado Visual

#### Indicadores de Buen Estado
- ✅ Pintura sin rayones profundos
- ✅ Cromados brillantes sin óxido
- ✅ Llantas con buen labrado visible
- ✅ Escape sin golpes ni oxidación
- ✅ Tablero completo y funcional
- ✅ Asiento sin roturas

#### Indicadores de Alerta
- ⚠️ Corrosión en chasis, escape o rines
- ⚠️ Pintura con descascaramiento
- ⚠️ Partes plásticas rotas o reparadas con pegamento
- ⚠️ Cadena oxidada o muy floja (visible)
- ⚠️ Llantas lisas o agrietadas
- ⚠️ Modificaciones no profesionales

#### Indicadores de Accidente Previo
- 🔴 Manubrio torcido vs eje de rueda
- 🔴 Barras de horquilla rayadas/punteadas
- 🔴 Carenado con pintura diferente a un lado
- 🔴 Soldaduras visibles en chasis
- 🔴 Diferencia de tono de pintura entre partes

### 4. Identificación de Modificaciones

| Modificación | Visual | Impacto |
|---|---|---|
| Escape deportivo | Diferente al original, más corto/ancho | Puede ser ilegal (ruido) |
| Faros LED aftermarket | Proyector grande, barra LED | Verificar aprobación |
| Slider/protector | Plásticos o metálicos laterales | Positivo (protección) |
| Defensas | Tubos metálicos | Positivo |
| Parrilla/baúl | Caja trasera | Positivo (utilidad) |
| Manubrio diferente | Tipo chopper o streetfighter | Verificar ergonomía |
| Rines aftermarket | Diseño diferente al original | Verificar medida correcta |

### 5. Formato de Respuesta para Scanner
```
📷 RESULTADO DEL ANÁLISIS

🏍️ Identificación:
   Marca: [marca]
   Modelo: [modelo]
   Cilindraje: [cc]
   Año aproximado: [año]
   Tipo: [calle/sport/trail/scooter]

📊 Estado Visual:
   Pintura: [Bueno/Regular/Malo]
   Estructura: [Bueno/Regular/Malo]
   Accesorios: [Originales/Modificada]
   
🔍 Observaciones:
   [Detalles específicos relevantes]

💡 Recomendaciones:
   [Si se detecta algo importante]
```

### 6. Formato de Respuesta
1. **🏍️ Identificación** — marca, modelo, año, cc
2. **📊 Estado visual** — evaluación si se solicita
3. **🔍 Modificaciones** — si se detectan
4. **💰 Valor estimado** — rango si se pide (redirigir a skill valoración)
5. **💡 Datos curiosos** — sobre el modelo identificado
