---
id: engagement-gamificacion
tags:
  - skill
  - ia
description: >-
  Skill para generar contenido de engagement como tips diarios, retos de
  mantenimiento, logros y streaks para motivar el uso continuo de MotoGestor.
keywords:
  - tip
  - consejo del dia
  - reto
  - logro
  - dato curioso
  - sabias que
---

# 🏆 Skill: Engagement y Gamificación

## Objetivo
Generar contenido motivacional y educativo que incentive al usuario a mantener su moto bien cuidada y a usar la app de forma constante.

## Cuándo Activar Esta Skill
- Inicio de sesión del usuario (tip del día)
- El usuario completa una acción (registra servicio, actualiza km)
- El usuario ha estado inactivo varios días
- Se generan recomendaciones en el Dashboard

## Instrucciones para la IA

### 1. Tips Diarios (Rotación)

#### Tips de Mantenimiento
```
🔧 "¿Sabías que lubricar la cadena cada 500 km duplica su vida útil?"
🛢️ "El aceite se degrada con el tiempo aunque no uses la moto. Cámbialo al menos cada 6 meses."
🔩 "Revisa la presión de llantas cada semana. 5 PSI de diferencia aumenta el desgaste un 25%."
⚡ "Si no vas a usar la moto por 2+ semanas, desconecta el borne negativo de la batería."
🏍️ "Calienta el motor 1-2 minutos antes de arrancar, pero no lo dejes en ralentí más de 5 min."
```

#### Tips de Seguridad
```
🛡️ "El 70% de los accidentes letales en moto se evitan con un casco integral certificado."
👀 "En intersecciones, haz contacto visual con los conductores. Si no te ven, no existes para ellos."
🌧️ "Los primeros 15 minutos de lluvia son los más peligrosos. El aceite de la vía se mezcla con el agua."
🔦 "Enciende las luces incluso de día. Te hace 3 veces más visible para los carros."
🧤 "Los guantes protegen las manos, que son lo primero que pones al caer."
```

#### Tips de Ahorro
```
💰 "Mantener la cadena limpia y lubricada puede ahorrarte $50,000+/año en combustible."
📋 "El mantenimiento preventivo cuesta 60% menos que las reparaciones correctivas."
🔍 "Compara precios entre 3 talleres antes de un servicio grande. La diferencia puede ser del 40%."
💡 "Comprar aceite por galón es 20-30% más económico que por litro."
```

### 2. Sistema de Logros

#### Logros por Mantenimiento
| Logro | Condición | Emoji |
|---|---|---|
| Primera vez | Registrar primer servicio | 🌟 |
| Mecánico dedicado | 5 servicios registrados | 🔧 |
| Maestro del aceite | 10 cambios de aceite registrados | 🛢️ |
| Moto impecable | 20 servicios registrados | ✨ |
| Veterano | 50 servicios totales | 🏅 |
| Al día | SOAT y Tecno vigentes simultáneamente | 📋 |

#### Logros por Uso de la App
| Logro | Condición | Emoji |
|---|---|---|
| Explorador | Visitar todas las secciones | 🗺️ |
| Preguntón | 10 conversaciones con MotoBot | 🤖 |
| Fotógrafo | Escanear 3 motos o facturas | 📷 |
| Manual loaded | Subir manual PDF | 📖 |
| Organizado | 10+ gastos registrados | 💹 |

#### Logros por Consistencia (Streaks)
| Streak | Condición | Emoji |
|---|---|---|
| Semana activa | Abrir app 7 días seguidos | 🔥 |
| Mes dedicado | Registrar algo cada semana por 4 sem | 🌟 |
| Moto feliz | 3 meses sin servicio atrasado | 😊 |

### 3. Mensajes de Engagement según Contexto

#### Usuario Activo (buen mantenimiento)
```
"🏆 ¡Genial! Tu [moto] tiene todos los servicios al día. 
Eso te ahorra en reparaciones y mantiene su valor de reventa."
```

#### Usuario con Servicios Atrasados
```
"⏰ Tu último cambio de aceite fue hace 4,500 km. 
¿Quieres que te ayude a calcular cuánto puede costarte?"
```

#### Usuario Inactivo (no abre la app)
```
"¡Hola! Hace tiempo no nos vemos. Tu [moto] tiene [X] km y
el cambio de aceite está próximo. ¿Todo bien?"
```

### 4. Retos Semanales/Mensuales
```
🏆 Reto de la semana: "Revisa la presión de tus llantas y 
   actualiza tu kilometraje en la app"

🏆 Reto del mes: "Sube la foto de tu próxima factura de taller 
   para mantener tu historial actualizado"

🏆 Reto trimestral: "Completa una revisión general de tu moto 
   y registra todos los hallazgos"
```

### 5. Formato de Respuesta
1. **💡 Tip/Dato** — contenido educativo corto
2. **🏆 Logro** — si el usuario completó algo
3. **🔥 Streak** — estado de la racha
4. **⏰ Recordatorio** — amigable, no invasivo
5. **🎯 Reto** — acción concreta propuesta

