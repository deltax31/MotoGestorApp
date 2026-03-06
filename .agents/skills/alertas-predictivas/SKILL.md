---
name: alertas-predictivas
description: Skill experta en predicción inteligente de necesidades de mantenimiento basándose en kilómetros, tiempo transcurrido, historial de servicios y condiciones de uso de la motocicleta.
---

# 🔮 Skill: Alertas Predictivas

## Objetivo
Permitir a la IA generar alertas proactivas de mantenimiento basándose en el historial del usuario, km actual, tiempo transcurrido y patrones de uso.

## Cuándo Activar Esta Skill
- El Dashboard genera insights del manual
- El usuario pregunta "¿qué le toca a mi moto?"
- El sistema de recordatorios calcula próximos servicios
- El usuario registra kilometraje actualizado

## Instrucciones para la IA

### 1. Fuentes de Datos para Predicción

#### Datos del Usuario en MotoGestor
```
moto.current_km              → Km actual
moto.year                    → Antigüedad
maintenance[].type           → Servicios realizados
maintenance[].km_at_service  → Km de cada servicio
maintenance[].date           → Fecha de cada servicio
maintenance[].next_km        → Km del próximo servicio programado
expenses[].amount            → Gastos históricos
manual_embeddings[]          → Intervalos del manual
```

#### Cálculos Derivados
```
km_promedio_mensual = (current_km - km_primer_servicio) / meses_transcurridos
dias_desde_ultimo_servicio(tipo) = hoy - fecha_ultimo_servicio(tipo)
km_desde_ultimo_servicio(tipo) = current_km - km_ultimo_servicio(tipo)
```

### 2. Lógica de Alertas

#### Nivel 1: Alerta por Kilometraje
```
Para cada tipo de servicio con intervalo conocido:
  km_restantes = next_km - current_km
  
  si km_restantes <= 0:
    🔴 "ATRASADO: [servicio] debió hacerse hace [|km_restantes|] km"
  si km_restantes <= 500:
    🟡 "PRÓXIMO: [servicio] en menos de 500 km"
  si km_restantes <= 1000:
    🟢 "PROGRAMAR: [servicio] se acerca (en ~[km_restantes] km)"
```

#### Nivel 2: Alerta por Tiempo
```
Para servicios sensibles al tiempo (aceite, líquido frenos, refrigerante):
  dias = dias_desde_ultimo_servicio(tipo)
  
  si dias > 180 (aceite):
    🟡 "Han pasado [dias] días desde el último cambio de aceite,
        incluso si no has rodado mucho, el aceite se degrada con el tiempo"
  
  si dias > 365 (líquido frenos):
    🟡 "Más de 1 año sin cambiar líquido de frenos,
        absorbe humedad y pierde eficacia"
```

#### Nivel 3: Alerta por Patrón de Uso
```
si km_promedio_mensual > 2000:
  → "Uso intensivo detectado: reducir intervalos de mantenimiento 20-30%"
  
si km_promedio_mensual < 200:
  → "Moto en bajo uso: revisar batería y estado de llantas (se degradan parada)"
  
si ultimo_servicio es null para tipo importante:
  → "No hay registro de [servicio]. ¿Ya lo has hecho? Registrarlo ayuda al seguimiento"
```

#### Nivel 4: Alertas de Documentos
```
si soat_expiry está próximo (< 30 días):
  🟡 "Tu SOAT vence el [fecha]. Renuévalo antes para evitar multas"
  
si tecno_expiry vencida:
  🔴 "Tecnomecánica vencida. No puedes circular legalmente"
```

### 3. Priorización de Alertas

| Prioridad | Tipo | Ejemplo |
|---|---|---|
| 🔴 **Crítica** | Seguridad comprometida | Frenos atrasados, docs vencidos |
| 🟡 **Alta** | Servicio atrasado | Aceite, filtros vencidos |
| 🟢 **Normal** | Próximo servicio | Kit arrastre se acerca |
| 💡 **Informativa** | Recomendación | Revisar batería por inactividad |

### 4. Proyecciones Inteligentes

#### Estimación de Fecha Próximo Servicio
```
km_restantes = next_km - current_km
km_por_dia = km_promedio_mensual / 30
dias_estimados = km_restantes / km_por_dia
fecha_estimada = hoy + dias_estimados

"A tu ritmo de uso (~[km_promedio_mensual] km/mes), tu próximo 
[servicio] será aproximadamente el [fecha_estimada]"
```

#### Proyección de Gastos
```
costo_proyectado_mensual = gastos_totales / meses_con_moto
"Tu moto te cuesta aproximadamente $[costo_mensual] COP/mes en mantenimiento"
```

### 5. Formato de Alertas

#### Para Dashboard (Insights)
```json
{
  "alert": "Cambio de aceite atrasado por 500 km",
  "nextService": "Filtro de aire a los 12,000 km (faltan 1,200 km)",
  "reference": "Manual oficial: cambio de aceite cada 3,000 km"
}
```

#### Para Chat
```
⚠️ Alertas para tu Yamaha FZ 2.0 (ABC123):

🔴 Cambio de aceite: Atrasado 500 km (debió ser a los 12,000 km)
🟡 Filtro de aire: Próximo a los 12,000 km (faltan 1,200 km)  
🟢 Kit de arrastre: A los 20,000 km (faltan 8,800 km)
✅ Frenos: Cambiados hace 3,000 km — sin novedad

📅 Próximo servicio estimado: Cambio de aceite AHORA
💰 Costo estimado: $30,000 - $50,000 COP
```

### 6. Formato de Respuesta
1. **🔮 Alertas** priorizadas (críticas primero)
2. **📊 Estado general** de la moto
3. **📅 Cronograma** de próximos servicios
4. **💰 Presupuesto** estimado próximos 3-6 meses
5. **💡 Recomendación** personalizada
