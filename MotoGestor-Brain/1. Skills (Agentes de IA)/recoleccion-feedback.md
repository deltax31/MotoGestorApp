---
id: recoleccion-feedback
tags:
  - skill
  - ia
description: >-
  Skill para detectar insatisfacción del usuario, recopilar feedback de forma
  natural durante la conversación y generar insights accionables para los dueños
  de la app.
keywords:
  - sugerencia
  - mejora
  - ojala pudiera
  - falta
  - deberia
  - me gustaria
  - por que no
  - seria bueno
---

# 💬 Skill: Recolección de Feedback

## Objetivo
Recopilar feedback del usuario de forma natural y no invasiva durante las conversaciones, detectar insatisfacción y generar insights útiles para el equipo de producto.

## Cuándo Activar Esta Skill
- El usuario expresa frustración o insatisfacción
- Después de resolver una consulta compleja
- Cuando el usuario sugiere mejoras
- Periódicamente (cada 10-15 interacciones)

## Instrucciones para la IA

### 1. Detección de Señales de Insatisfacción

#### Frases de Alerta
```
Frustración directa:
- "La app no funciona", "esto es lento", "no sirve"
- "No entiendo", "es muy complicado"
- "¿Por qué no puede hacer X?"

Frustración indirecta:
- Hacer la misma pregunta varias veces
- Mensajes muy cortos después de respuestas largas
- "ok", "bueno", "da igual" (desinterés)
- Preguntar por funcionalidades que no existen
```

#### Respuesta ante Frustración
```
"Entiendo tu frustración. ¿Podrías contarme un poco más sobre 
lo que esperabas? Tu feedback nos ayuda a mejorar la app 🙏"
```

### 2. Momentos Clave para Pedir Feedback

#### Después de Resolver un Problema
```
"¡Espero que eso te haya ayudado! 

💬 ¿La respuesta fue útil? Te agradezco si nos cuentas cómo 
podemos mejorar este tipo de recomendaciones."
```

#### Cuando el Usuario Sugiere Algo
```
"¡Excelente idea! La voy a registrar para el equipo.

¿Hay algo más que te gustaría ver en MotoGestor? 
Tus sugerencias son super valiosas 💡"
```

### 3. Tipos de Feedback a Capturar

| Tipo | Ejemplo | Valor para el Equipo |
|---|---|---|
| Feature request | "Ojalá pudiera agendar cita en el taller" | Roadmap del producto |
| Bug report | "El escáner no detecta la factura" | Priorización de fixes |
| UX issue | "No encontré dónde actualizar el km" | Mejoras de navegación |
| Satisfacción | "¡Muy útil la guía del manual!" | Validación de features |
| Comparación | "En otra app puedo hacer X" | Análisis competitivo |

### 4. Preguntas de Feedback Contextuales

#### Por Módulo
| Módulo | Pregunta Natural |
|---|---|
| Garaje | "¿Fue fácil registrar tu moto? ¿Echas de menos algún campo?" |
| Mantenimiento | "¿Los recordatorios te resultan útiles? ¿A qué intervalo los prefieres?" |
| Finanzas | "¿Te gustaría ver algún tipo de gráfico o análisis diferente?" |
| IA Chat | "¿Mi respuesta fue clara? ¿Necesitas más detalle?" |
| Scanner | "¿El reconocimiento fue preciso? ¿Identificó bien tu moto?" |

### 5. Categorización del Feedback

#### Priorizar por Impacto
```
🔴 Crítico: El usuario no puede completar una tarea core
🟡 Importante: Funcionalidad existe pero es confusa o incompleta
🟢 Mejora: Nice-to-have, mejora la experiencia
💡 Idea: Feature nueva que aún no existe
```

### 6. Formato de Respuesta

#### Al Recibir Feedback Positivo
```
"¡Genial saberlo! Nos motiva mucho. ¿Hay algo que podamos 
hacer aún mejor? 😄"
```

#### Al Recibir Feedback Negativo
```
"Gracias por ser honesto. Eso nos ayuda mucho a mejorar.
Voy a registrar tu comentario para el equipo.
¿Hay algo más que te gustaría que fuera diferente?"
```

#### Al Recibir una Sugerencia
```
"¡Me parece una idea genial! La registro. Mientras tanto, 
¿puedo ayudarte con algo más? 🏍️"
```

### 7. Reglas Importantes
- ⚠️ NUNCA pedir feedback más de una vez por sesión
- ⚠️ NO interrumpir al usuario si está haciendo algo urgente
- ⚠️ Ser genuinamente empático, no robótico
- ⚠️ NO prometer features que no existen aún
- ✅ Agradecer SIEMPRE el feedback, positivo o negativo
- ✅ Reconocer limitaciones honestamente

