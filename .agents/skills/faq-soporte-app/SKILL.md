---
name: faq-soporte-app
description: Skill para responder preguntas frecuentes sobre el uso de la app MotoGestor, troubleshooting de funcionalidades y guía de navegación.
---

# ❓ Skill: FAQ y Soporte de la App

## Objetivo
Resolver dudas de los usuarios sobre cómo usar MotoGestor sin necesidad de soporte humano, cubriendo funcionalidades, errores comunes y navegación.

## Cuándo Activar Esta Skill
- El usuario pregunta cómo hacer algo en la app
- El usuario reporta un error o problema
- El usuario no encuentra una funcionalidad
- El usuario pregunta "¿para qué sirve X?"

## Instrucciones para la IA

### 1. Preguntas Frecuentes por Módulo

#### 🏍️ Garaje
| Pregunta | Respuesta |
|---|---|
| ¿Cómo agrego una moto? | Ve a Garaje → botón "+ Agregar moto" → llena los datos |
| ¿Cómo actualizo el SOAT? | Garaje → Clic en la moto → Editar → Actualiza fecha SOAT |
| ¿Puedo tener más de una moto? | Sí, puedes registrar todas las motos que quieras |
| ¿Cómo subo el manual? | Garaje → Clic en la moto → Detalle → Sección "Manual" → Subir PDF |
| ¿Qué hace la alerta de documentos? | Te avisa cuando SOAT o Tecno están por vencer o vencidos |

#### 🔧 Mantenimientos
| Pregunta | Respuesta |
|---|---|
| ¿Cómo registro un servicio? | Mantenimientos → "+ Registrar servicio" → Llenar formulario |
| ¿Qué es "escanear factura"? | Sube una foto de la factura del taller y la IA extrae los datos automáticamente |
| ¿Los recordatorios son automáticos? | Sí, basados en km y tiempo desde el último servicio de cada tipo |
| ¿Puedo exportar mi historial? | Sí, botón "📥 Exportar CSV" en la página de mantenimientos |
| ¿Cómo actualizo el kilometraje? | En la sección "Actualizar kilometraje" dentro de Mantenimientos |

#### 💰 Finanzas
| Pregunta | Respuesta |
|---|---|
| ¿Los gastos de mantenimiento se registran solos? | Sí, cada servicio con costo > $0 crea un gasto automáticamente |
| ¿Puedo agregar gastos que no son de taller? | Sí, puedes agregar gasolina, accesorios, documentos, etc. |
| ¿Cómo categorizo mis gastos? | Al agregar un gasto, selecciona la categoría correspondiente |

#### 🤖 IA / MotoBot
| Pregunta | Respuesta |
|---|---|
| ¿Quién es MotoBot? | Tu mecánico virtual que responde dudas sobre motos en tiempo real |
| ¿Puedo enviar fotos? | Sí, adjunta imagen en el chat para que la IA analice |
| ¿Qué es el scanner de motos? | Tab "Escanear moto" → sube foto → la IA identifica marca, modelo y año |
| ¿Se guarda el historial del chat? | Sí, tus conversaciones se guardan y puedes borrarlas cuando quieras |
| ¿MotoBot conoce mi moto? | Sí, si la registraste en el Garaje, la IA tiene contexto de tu moto |

### 2. Troubleshooting Común

#### Errores Frecuentes
| Problema | Solución |
|---|---|
| "Error al conectar con el asistente IA" | Verificar conexión a internet, intentar de nuevo |
| No carga el Dashboard | Recargar la página (F5), verificar que haya sesión activa |
| El escáner de factura no extrae datos | Foto más clara, bien iluminada, sin sombras |
| No aparecen mis motos | Verificar que se registraron con el usuario correcto |
| El manual no se procesa | PDF debe ser de máximo 20MB, formato PDF estándar |
| Los insights del manual no aparecen | El manual debe estar procesado (puede tomar unos minutos) |

### 3. Navegación de la App
```
Menú lateral:
  📊 Dashboard    → Resumen general
  🏍️ Garaje      → Gestión de tus motos
  🔧 Mantenimiento → Servicios y recordatorios
  💰 Finanzas     → Control de gastos
  🤖 Asistente IA → Chat y scanner
  👤 Perfil       → Tu cuenta y configuración
```

### 4. Límites de la App (Qué NO Puede Hacer)
- ❌ Agendar citas en talleres automáticamente
- ❌ Pagar SOAT o tecno directamente
- ❌ Conectarse al OBD de la moto
- ❌ Rastrear la moto en tiempo real (GPS)
- ❌ Hacer diagnóstico en tiempo real del motor

### 5. Formato de Respuesta
1. **✅ Respuesta directa** — solución o explicación
2. **📍 Ubicación** — dónde encontrar la funcionalidad
3. **👆 Pasos** — acción por acción si es necesario
4. **💡 Tip** — funcionalidad extra relacionada
