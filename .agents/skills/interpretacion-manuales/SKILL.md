---
name: interpretacion-manuales
description: Skill experta en interpretar y extraer información de manuales de motocicletas en formato PDF, optimizando la comprensión de tablas de mantenimiento, diagramas y especificaciones técnicas.
---

# 📖 Skill: Interpretación Inteligente de Manuales

## Objetivo
Mejorar la capacidad de la IA para interpretar la información extraída de manuales PDF de motos, identificando datos clave como tablas de mantenimiento, torques, diagramas de piezas y procedimientos.

## Cuándo Activar Esta Skill
- El sistema RAG retorna fragmentos de manual que necesitan interpretación
- El usuario pregunta algo que se puede responder desde su manual
- Se procesan chunks de un manual recién subido
- El usuario consulta la guía del manual en mantenimiento

## Instrucciones para la IA

### 1. Tipos de Contenido en Manuales

#### Tablas de Mantenimiento Periódico
```
Formato típico en manuales:
- Columnas: Servicio | Primer Servicio | Cada X km | Notas
- Símbolos: I=Inspeccionar, R=Reemplazar, C=Limpiar, A=Ajustar
- Los manuales usan "×1000 km" o "Odometer (×1000 km)"
```

**Cómo interpretar:**
- "I" = Solo revisar, no cambiar todavía
- "R" = Es hora de cambiar
- "C" = Limpiar y re-evaluar
- Si dice "más frecuente en condiciones severas", reducir intervalos 30%

#### Diagramas de Piezas Explotadas
- Los manuales numeran las piezas con referencia
- Identificar: número de parte, nombre, cantidad
- Relacionar con la pregunta del usuario

#### Especificaciones Técnicas
- Torques siempre en Nm o kgf·cm (convertir si necesario)
- Holguras en mm
- Capacidades en litros o cc
- Presiones en kPa o PSI

### 2. Cómo Usar Fragmentos del RAG

#### Al Recibir Chunks del Manual
1. **Identificar categoría**: ¿Es mantenimiento, motor, eléctrico, general?
2. **Extraer datos numéricos**: Torques, capacidades, intervalos, medidas
3. **Contextualizar**: Relacionar con el km actual de la moto del usuario
4. **Priorizar**: Si hay múltiples datos, dar el más relevante a la pregunta

#### Ejemplo de Interpretación
```
Chunk del manual: "ACEITE MOTOR: Cambiar cada 3,000 km o 6 meses. 
Capacidad: 1.0L (cambio), 1.2L (con filtro). Usar 10W-40 API SN JASO MA"

Interpretación para usuario con 12,500 km:
→ "Según tu manual, te corresponde el 5to cambio de aceite (12,000 km). 
   Necesitas 1.0L de aceite 10W-40 JASO MA. Si también cambias el filtro, 
   necesitas 1.2L."
```

### 3. Manejo de Información Incompleta
- Si el chunk no tiene toda la info, indicar qué datos faltan
- Sugerir consultar otra sección del manual
- NUNCA inventar datos que no estén en el manual
- Si el manual contradice conocimiento general, dar la info del manual pero advertir

### 4. Alertas Basadas en Manual + Km

#### Lógica para Generar Alertas
```
km_actual = moto.current_km
intervalo_manual = chunk.km_threshold

si km_actual >= intervalo_manual - 500:
  → Alerta: "⚠️ Según el manual, es hora de [servicio] a los [X] km"
  
si km_actual > intervalo_manual:
  → Alerta: "🚨 Tienes [diferencia] km de atraso en [servicio]"
  
si km_actual < intervalo_manual - 2000:
  → Info: "✅ Tu próximo [servicio] es a los [X] km (faltan [diferencia] km)"
```

### 5. Enriquecimiento de Respuestas RAG

Cuando respondas usando información del manual:
1. **Citar la fuente**: "Según el manual oficial de tu [moto]..."
2. **Dar la referencia exacta**: Si hay sección o página
3. **Complementar**: Agregar contexto práctico que el manual no incluye
4. **Personalizar**: Adaptar al km y condiciones específicas del usuario

### 6. Formato de Respuesta
1. **📖 Dato del manual** — información exacta extraída
2. **📊 Interpretación** — qué significa para el usuario
3. **📅 Acción recomendada** — qué hacer y cuándo
4. **💡 Complemento** — información adicional útil no en el manual
5. **📄 Referencia** — sección del manual citada
