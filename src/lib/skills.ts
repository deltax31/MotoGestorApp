/**
 * MotoGestor AI Skills Router
 * 
 * Detects user intent from their message and returns relevant skill
 * instructions to inject into MotoBot's system prompt.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SkillDefinition {
    id: string;
    name: string;
    keywords: string[];
    content: string;
}

// ---------------------------------------------------------------------------
// Utility — normalize text for matching (lowercase, no accents)
// ---------------------------------------------------------------------------
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ');
}

// ---------------------------------------------------------------------------
// Skills Registry — 25 condensed skills (~200-400 tokens each)
// ---------------------------------------------------------------------------
export const SKILLS_REGISTRY: SkillDefinition[] = [
    // ===== CATEGORÍA 1: CONOCIMIENTO TÉCNICO =====
    {
        id: 'diagnostico-sintomas',
        name: 'Diagnóstico por Síntomas',
        keywords: [
            'ruido', 'vibra', 'vibracion', 'humo', 'olor', 'falla', 'no enciende',
            'no arranca', 'se apaga', 'pierde potencia', 'consumo excesivo',
            'recalienta', 'calienta', 'frena mal', 'tiembla', 'cascabeleo',
            'golpeteo', 'silbido', 'suena raro', 'problema', 'sintoma',
        ],
        content: `DIAGNÓSTICO POR SÍNTOMAS:
Cuando el usuario describe síntomas de su moto, sigue este proceso:
1. Recopila: modelo, km, cuándo empezó, condiciones (frío/caliente, acelerando/frenando)
2. Árboles de diagnóstico:
   - Ruido al acelerar→cadena/piñones/válvulas | al frenar→pastillas/disco | constante→rodamientos/escape
   - Humo blanco→empaque culata | azul→anillos/aceite | negro→mezcla rica/filtro
   - No enciende sin sonido→batería/fusible/kill-switch | gira pero no prende→bujía/combustible/compresión
   - Se calienta→refrigerante bajo/termostato/aceite viejo | Pierde potencia→filtro/bujía/cadena/embrague
3. Responde con: 🔍 Posibles causas (probable→improbable), 🛠️ Verificación en casa, 💰 Costo en COP, ⚠️ Urgencia (🟢Leve/🟡Moderado/🔴Urgente), 💡 Tip preventivo
4. NUNCA sugieras reparar frenos o dirección sin mecánico. Si hay olor a gasolina fuerte, advertir riesgo de incendio.`,
    },
    {
        id: 'mantenimiento-preventivo',
        name: 'Mantenimiento Preventivo',
        keywords: [
            'cada cuanto', 'intervalo', 'cambio aceite', 'cambio de aceite',
            'mantenimiento', 'servicio', 'filtro', 'bujia', 'cadena', 'frenos',
            'preventivo', 'cuando cambiar', 'pastillas', 'revision', 'lubricar',
            'tensar', 'refrigerante', 'liquido frenos',
        ],
        content: `MANTENIMIENTO PREVENTIVO:
Intervalos por cilindraje:
- 100-125cc: Aceite cada 2,000-3,000km ($15-30K), filtro aire cada 5,000km, bujía cada 6,000km, kit arrastre 15,000-20,000km ($45-80K)
- 150-200cc: Aceite cada 3,000-4,000km ($25-50K), filtro aceite cada 6,000km, bujía cada 8,000km, kit arrastre 20,000-25,000km ($70-130K)
- 250cc+: Aceite sintético cada 4,000-6,000km ($40-80K), refrigerante cada 20,000km
Ajustes Colombia: ciudad congestionada -20% intervalos, mensajería -30-40%, carreteras destapadas filtro aire cada 3,000-5,000km.
Responde con: 📋 Plan personalizado según modelo y km, 🔧 Procedimiento paso a paso, 🛠️ Herramientas necesarias, 💰 Costo COP, 📅 Próximo servicio.`,
    },
    {
        id: 'repuestos-compatibilidad',
        name: 'Repuestos y Compatibilidad',
        keywords: [
            'repuesto', 'compatible', 'le sirve', 'pieza', 'referencia',
            'oem', 'aftermarket', 'alternativa', 'equivalente', 'kit arrastre',
            'donde consigo', 'marca de repuesto',
        ],
        content: `REPUESTOS Y COMPATIBILIDAD:
Plataformas compartidas en Colombia:
- Bajaj: Pulsar NS200/RS200/Dominar200 comparten motor base. Boxer CT100/BM100/BM150 comparten motor.
- Yamaha: FZ 2.0/FZS V3 comparten motor/inyección/frenos. YBR125/Factor125 todo el motor.
- Honda: CB110/CB125F muchos repuestos de motor. XR150L/XRE190 frenos y suspensión varían.
Repuestos universales: Bujías por código NGK (C7HSA para 110-125cc, CR8E para 150-200cc). Aceites por spec JASO MA/MA2. Cadenas por paso (428, 520, 525).
Calidad: 🏆Original > 🥇Premium(DID,NGK,Brembo) > 🥈Buena(HiFlo,JT,EBC) > 🥉Económica(Osaki)
⚠️ NUNCA recomendar frenos genéricos sin marca. En motor, preferir OEM o premium.
Responde con: ✅ Repuesto exacto, 🔄 Alternativa compatible, 💰 Precio COP, ⚠️ Advertencia si hay riesgo.`,
    },
    {
        id: 'especificaciones-tecnicas',
        name: 'Especificaciones Técnicas',
        keywords: [
            'torque', 'especificacion', 'capacidad', 'cuanto aceite', 'cuantos litros',
            'presion llanta', 'dato tecnico', 'ficha tecnica', 'medida',
            'apriete', 'holgura', 'calibracion',
        ],
        content: `ESPECIFICACIONES TÉCNICAS:
Datos de referencia rápida (siempre verificar manual del modelo):
- Honda CB110: 110cc, 0.8L aceite 10W-30, tanque 3.7L
- Honda CB125F: 125cc, 1.0L aceite 10W-30, tanque 13L
- Honda XR150L: 149cc, 1.0L aceite 10W-40, tanque 12L
- Yamaha FZ 2.0: 149cc, 1.15L aceite 10W-40, tanque 12L
- Yamaha MT-15: 155cc liquid-cooled, 1.05L aceite 10W-40, tanque 10L
- Bajaj Pulsar NS200: 199.5cc liquid-cooled, 1.2L aceite 10W-40, tanque 12L
- Bajaj Dominar 250: 248.8cc, 1.5L aceite 10W-40, tanque 13L
Torques comunes: Tapón drenaje 20-30Nm, bujía 12-18Nm, rueda delantera 50-75Nm, trasera 80-120Nm.
Presión llantas: Delantera 28-33 PSI, trasera 33-41 PSI (ajustar si va con carga).
Siempre mencionar usar torquímetro y verificar especificación del modelo exacto.`,
    },
    {
        id: 'sistemas-electricos',
        name: 'Sistemas Eléctricos',
        keywords: [
            'bateria', 'luces', 'electrico', 'fusible', 'regulador',
            'led', 'arranque', 'carga', 'no prende', 'tablero', 'bombillo',
            'direccional', 'sensor', 'check engine', 'inyeccion',
        ],
        content: `SISTEMAS ELÉCTRICOS:
Sistema de carga: Estátor→Regulador/Rectificador→Batería(12V). Voltaje motor encendido: 13.5-14.5V.
Diagnóstico arranque: Click sin girar→batería/bornes | Sin sonido→fusible/kill-switch/pata lateral | Gira lento→batería descargada
Batería: Convencional (12-18 meses) < MF libre manto (18-24m) < Gel (24-36m) < Litio (36-60m). Voltaje sano: 12.4-12.8V apagada.
Sensores inyección: CKP(no enciende), TPS(mal ralentí), IAT/ECT(mezcla incorrecta), O2(consumo alto).
Check engine: Contar parpadeos (largos=decenas, cortos=unidades) para código de error.
Bombillos: Faro H4 12V 35/35W, stop S25 21/5W. LED: verificar polaridad y que no encandile.
⚠️ Siempre usar relay para accesorios >10W. Usar fusible apropiado. No exceder capacidad del estátor.`,
    },
    {
        id: 'motor-transmision',
        name: 'Motor y Transmisión',
        keywords: [
            'motor', 'embrague', 'caja', 'cambios', 'carburador', 'inyeccion',
            'piston', 'valvulas', 'transmision', 'patina', 'cilindro', 'compresion',
            'biela', 'anillos', 'culata', 'velocidades',
        ],
        content: `MOTOR Y TRANSMISIÓN:
Motor 4T: Admisión→Compresión→Combustión→Escape. Aceite en cárter, requiere ajuste de válvulas periódico.
Embrague húmedo: Discos fricción+acero en aceite. Patina→discos gastados o aceite incorrecto. SIEMPRE aceite JASO MA/MA2, NUNCA antifricción.
Válvulas: Holgura típica admisión 0.05-0.10mm, escape 0.10-0.15mm (frío). Ajustar cada 6,000-12,000km.
Carburador: Gotea→flotador pegado. Ralentí inestable→chicler lento tapado. Se ahoga→membrana rota.
Inyección: Check engine→leer código error. Inyector tapado→limpieza ultrasónica. Bomba combustible→verificar relay/fusible.
Kit arrastre: Piñón +1 diente=más velocidad, -1 diente=más fuerza. SIEMPRE cambiar cadena+piñones juntos.
Top-end motor: $60-120K mano de obra, reparación completa $150-300K.`,
    },

    // ===== CATEGORÍA 2: CONTEXTO COLOMBIANO =====
    {
        id: 'normativa-tramites',
        name: 'Normativa y Trámites Colombia',
        keywords: [
            'soat', 'tecnomecanica', 'tecno', 'runt', 'traspaso', 'matricula',
            'licencia', 'comparendo', 'multa', 'simit', 'documentos', 'papeles',
            'impuesto', 'pico y placa',
        ],
        content: `NORMATIVA Y TRÁMITES COLOMBIA:
SOAT: Obligatorio, 1 año, $160-550K según cc. Sin SOAT→8 SMLDV (~$350K)+inmovilización. Comprar: SURA, Bolívar, Liberty, Mapfre online o Éxito/EDS.
Tecnomecánica: Moto nueva primera a los 6 años, luego cada 2 años. >10 años: anual. Costo: $70-120K en CDA. Revisan: gases, luces, frenos, suspensión, llantas, bocina, espejos.
Traspaso: Tarjeta propiedad + SOAT + tecno + cédulas + paz y salvo impuestos/comparendos + carta compraventa. Costo: $180-350K.
Licencia: A1 hasta 125cc (16 años), A2 sin límite (18 años). Renovar cada 10 años.
SIMIT: Consultar en simit.org.co con cédula. Verificar ANTES de comprar usada.
Multas comunes: Sin casco 8 SMLDV (~$350K), sin chaleco 4 SMLDV (~$175K), sin licencia 8 SMLDV+inmovilización, pico y placa 15 SMLDV (~$650K).`,
    },
    {
        id: 'marcas-populares',
        name: 'Marcas Populares Colombia',
        keywords: [
            'cual es mejor', 'que marca', 'honda', 'yamaha', 'bajaj', 'pulsar',
            'akt', 'suzuki', 'kawasaki', 'tvs', 'hero', 'auteco', 'gixxer',
            'dominar', 'fz', 'nkd', 'boxer', 'crypton', 'xr', 'duke',
        ],
        content: `MARCAS POPULARES COLOMBIA:
Market share: Auteco(Bajaj/Kawasaki)~30%, Honda(Fanalca)~25%, Yamaha(Incolmotos)~15%, AKT~10%, Suzuki~8%.
Honda: Mejor reventa, confiabilidad, red talleres más grande. Modelos: CB110($5-5.8M), CB125F($6.5-7.5M), XR150L($8.5-10M).
Yamaha: Diseño moderno, buen rendimiento. Modelos: Crypton FI($5.2-6M), FZ 2.0($8.5-10M), MT-15($12-14M).
Bajaj: Mejor relación costo-rendimiento, repuestos económicos. Modelos: Boxer CT100($4.5-5.2M), Pulsar NS200($10.5-12.5M), Dominar 250($13.5-15.5M).
AKT: Precio de entrada bajo. NKD 110($4.3-5M).
Suzuki: Motores confiables. Gixxer 150($9-10.5M).
Precios son referencia en COP 2025-2026. Siempre considerar reventa y disponibilidad de repuestos al recomendar.`,
    },
    {
        id: 'costos-precios',
        name: 'Costos y Precios en COP',
        keywords: [
            'cuanto cuesta', 'precio', 'valor', 'cobrar', 'presupuesto',
            'barato', 'caro', 'cop', 'pesos', 'cuanto vale', 'cuanto cobran',
            'mano de obra', 'cuanto sale',
        ],
        content: `COSTOS Y PRECIOS EN COP:
Mano de obra: Cambio aceite $8-15K(independiente)/$15-30K(concesionario), ajuste válvulas $25-40K/$40-70K, kit arrastre $20-35K/$35-60K, top-end motor $60-120K/$120-200K.
Repuestos: Aceite litro $12-45K, filtro aceite $5-25K, bujía $5-40K, kit arrastre $45-250K, pastillas $10-60K, batería $25-160K, llanta $35-220K.
Costo anual moto 110-125cc: Mantenimiento $310-625K + SOAT $200-320K + gasolina ~$1.5M = ~$2-2.5M/año.
Costo anual moto 150-200cc: Mantenimiento $424-870K + SOAT $300-420K + gasolina ~$1.6M = ~$2.3-2.9M/año.
Variación por ciudad: Bogotá +10-15%, Medellín base, Costa -10-15%, Pueblos -15-25%.
Señal de cobro excesivo: Cobra sin diagnosticar, no muestra repuesto viejo, precio muy por debajo del rango (calidad dudosa).`,
    },
    {
        id: 'seguridad-vial',
        name: 'Seguridad Vial Colombia',
        keywords: [
            'casco', 'chaleco', 'seguridad', 'accidente', 'proteccion',
            'guantes', 'caida', 'chaqueta', 'equipo', 'reflectivo',
        ],
        content: `SEGURIDAD VIAL COLOMBIA:
Equipo obligatorio: Casco NTC 4533 o ECE 22.05 (conductor Y pasajero, multa 8 SMLDV sin él), chaleco reflectivo (nocturno obligatorio, 4 SMLDV).
Casco recomendado: Integral(mejor protección $80-500K), marcas: LS2, HJC, Shaft, MT Helmets.
Equipo recomendado: Guantes, chaqueta con protecciones CE, botas tobillo, rodilleras.
Conducción defensiva: Asume que NO te ven. Mira 12s adelante. Mínimo 2s de distancia. NUNCA al lado de buses/camiones.
Riesgos: Intersecciones(reducir velocidad), lluvia primeros 15min(aceite+agua), puntos ciegos camiones, curvas alta velocidad.
Estadísticas: Motos=58% vehículos en Colombia, motociclistas=50% muertos en siniestros. Horario riesgo: 6-8 PM.
Para circular: Licencia A1/A2 + SOAT + Tecno + casco + chaleco + 2 espejos + luces + placa visible.`,
    },
    {
        id: 'conduccion-terrenos',
        name: 'Conducción en Terrenos Colombianos',
        keywords: [
            'lluvia', 'montana', 'trocha', 'destapado', 'altitud', 'frio',
            'curva', 'pendiente', 'bajada', 'subida', 'terreno', 'barro',
            'piedra', 'paso agua',
        ],
        content: `CONDUCCIÓN TERRENOS COLOMBIANOS:
Montaña: Subida en marchas bajas (2da-3ra), bajada NUNCA en neutral (freno motor), misma marcha que para subir. Curvas herradura: reducir ANTES, no frenar dentro.
Lluvia: Reducir velocidad 30-40%, evitar líneas pintadas y tapas alcantarilla (cero agarre), primeros 15min son los más peligrosos (aceite+agua).
Destapado: Pararse sobre estribos, agarre firme pero relajado, velocidad constante, freno trasero 70%/delantero 30%.
Altitud y potencia: Nivel mar=100%, Cali(1,000m)=-5%, Medellín(1,500m)=-10%, Bogotá(2,600m)=-20-30%. Motos inyección compensan automáticamente, carburadas pueden necesitar rejetear.
Preparación viaje: Aceite OK, presión llantas (aumentar si carga), cadena lubricada/tensada, frenos OK, luces OK, kit herramientas, cable embrague repuesto, documentos.`,
    },

    // ===== CATEGORÍA 3: POTENCIAMIENTO DE FEATURES =====
    {
        id: 'interpretacion-manuales',
        name: 'Interpretación de Manuales',
        keywords: [
            'manual', 'segun manual', 'dice el manual', 'guia', 'procedimiento oficial',
            'segun el libro', 'especificacion del fabricante',
        ],
        content: `INTERPRETACIÓN DE MANUALES:
Cuando uses información del RAG (fragmentos de manual del usuario):
1. Identifica: ¿Es mantenimiento, motor, eléctrico, general?
2. Extrae datos numéricos: torques, capacidades, intervalos, medidas
3. Contextualiza con km actual del usuario: "A tus X km, según el manual te corresponde Y"
4. Símbolos de manuales: I=Inspeccionar, R=Reemplazar, C=Limpiar, A=Ajustar
5. Si dice "condiciones severas", reducir intervalos 30%
6. CITA la fuente: "Según el manual oficial de tu [moto]..."
7. NUNCA inventes datos que no estén en el manual. Si contradice conocimiento general, da info del manual pero advierte.
8. COMPLEMENTA con información práctica que el manual no incluye.`,
    },
    {
        id: 'analisis-facturas',
        name: 'Análisis de Facturas',
        keywords: [
            'factura', 'recibo', 'cobro', 'le cobraron', 'justo', 'taller',
            'cuenta', 'boleta',
        ],
        content: `ANÁLISIS DE FACTURAS:
Cuando el usuario suba foto de factura o pregunte por cobros:
Datos a extraer: taller, fecha, servicio, desglose repuestos vs mano de obra, total, IVA, km.
Traducciones taller→app: "Lubricantes"=Cambio aceite, "Bandas/Pastillas"=Frenos, "Kit arrastre"=Cadena y piñones.
Validación: Verificar que total está en rango normal para el servicio. Señales de alerta: cobra sin diagnosticar, no muestra repuesto viejo, "revisión computador" en moto carburada, mano de obra > repuesto en servicios simples.
Para fotos de factura, extraer JSON: {"workshop","cost","type","notes","km"}.`,
    },
    {
        id: 'identificacion-visual',
        name: 'Identificación Visual de Motos',
        keywords: [
            'identificar', 'que moto es', 'foto', 'imagen', 'reconocer',
            'que modelo', 'de que ano',
        ],
        content: `IDENTIFICACIÓN VISUAL DE MOTOS:
Al analizar imagen de moto, identificar:
1. Marca (logo en tanque/carenado), Modelo (forma tanque/faro/cola), Cilindraje (calcomanías laterales), Año (generación de diseño)
2. Claves por marca Colombia: Honda=logo ala, rojo/blanco. Yamaha=diapasón, FZ tanque muscular. Bajaj=logo B/"Pulsar". AKT=logo AKT.
3. Estado visual: Pintura sin rayones✅, cromados sin óxido✅, llantas con labrado✅. ⚠️Corrosión, plásticos rotos, cadena oxidada, llantas lisas.
4. Signos de accidente: Manubrio torcido, barras rayadas, pintura diferente a un lado, soldaduras en chasis.
5. Modificaciones: Escape deportivo(puede ser ilegal), LED aftermarket, slider/defensas(positivo), rines aftermarket.`,
    },
    {
        id: 'alertas-predictivas',
        name: 'Alertas Predictivas',
        keywords: [
            'proximo servicio', 'que le toca', 'pendiente', 'atrasado',
            'recordatorio', 'vencido', 'proxima revision', 'que me falta',
        ],
        content: `ALERTAS PREDICTIVAS:
Usa los datos del usuario para generar alertas:
- km_actual vs next_km de cada servicio: <=0→🔴ATRASADO, <=500→🟡PRÓXIMO, <=1000→🟢PROGRAMAR
- Tiempo: Aceite >6 meses sin cambiar→alertar. Líquido frenos >1 año→alertar. Batería >2 años→verificar.
- Patrón de uso: >2,000km/mes=uso intensivo (reducir intervalos 20-30%). <200km/mes=verificar batería y llantas.
- Documentos: SOAT/Tecno <30 días para vencer→🟡avisar. Vencido→🔴urgente.
- Proyección: "A tu ritmo de [X] km/mes, tu próximo [servicio] será en ~[fecha]"
Priorizar: 🔴Seguridad(frenos,docs) > 🟡Servicio atrasado > 🟢Próximo > 💡Informativa.`,
    },
    {
        id: 'asistente-presupuesto',
        name: 'Asistente de Presupuesto',
        keywords: [
            'gasto', 'ahorrar', 'optimizar', 'proyeccion', 'cuanto me cuesta',
            'financiero', 'economia', 'dinero', 'inversion',
        ],
        content: `ASISTENTE DE PRESUPUESTO:
Métricas clave: Costo/km = gasto_total/km, costo/mes = gasto_total/meses, ratio mantenimiento vs reparaciones.
Benchmarks anuales (sin gasolina): 110-125cc $300-700K (alarma >$1.2M), 150-200cc $500K-1.2M (alarma >$2M), 250cc+ $800K-2M (alarma >$3.5M).
Patrones positivos: Mantenimiento regular→menos reparaciones, gasto estable mensual.
Patrones alerta: Reparaciones>mantenimiento→falta preventivo, gastos crecientes→algo se desgasta, mismo repuesto múltiples veces→problema de raíz.
Ahorro: Taller independiente -30-50% mano de obra, aceite por galón -20-30%, preventivo vs correctivo -40-70% largo plazo.
Si costo_reparaciones_año > 30% valor moto → "Considera si vale la pena seguir invirtiendo".`,
    },

    // ===== CATEGORÍA 4: NUEVAS CAPACIDADES =====
    {
        id: 'valoracion-motos',
        name: 'Valoración de Motos',
        keywords: [
            'cuanto vale mi moto', 'vender', 'valorar', 'precio usado',
            'reventa', 'cuanto puedo pedir', 'comprar usada',
        ],
        content: `VALORACIÓN DE MOTOS USADAS:
Fórmula: valor = precio_nuevo × (1-depreciación_edad) × factor_marca × factor_km × factor_estado
Depreciación: 1er año -15-20%, 2do -25-35%, 3ro -35-45%, 5to -45-55%, 7mo -55-65%, 10+ -65-80%.
Factor marca: Honda 0.85(menor depreciación), Yamaha 0.90, Suzuki 0.95, Bajaj 1.05, AKT/TVS 1.15(mayor).
Factor km: <10K=1.05, 10-30K=1.0, 30-60K=0.93, 60-100K=0.85, >100K=0.75.
Factor estado: Excelente=1.10, Bueno=1.0, Regular=0.85, Malo=0.65.
Otros: Docs al día +5%, único dueño +5-10%, marcas accidente -10-30%.
Checklist comprador: Tarjeta propiedad, SOAT/tecno, SIMIT limpio, sin prendas, arranque en frío, humo escape, frenos, chasis sin soldaduras.`,
    },
    {
        id: 'comparador-motos',
        name: 'Comparador de Motos',
        keywords: [
            'comparar', 'cual es mejor', 'diferencia entre', 'vs', 'versus',
            'o la', 'recomendame', 'que moto compro', 'primera moto',
        ],
        content: `COMPARADOR DE MOTOS:
Criterios de comparación: Precio(⭐⭐⭐⭐⭐), Rendimiento km/L(⭐⭐⭐⭐⭐), Costo mantenimiento(⭐⭐⭐⭐), Repuestos(⭐⭐⭐⭐), Potencia(⭐⭐⭐), Reventa(⭐⭐⭐⭐), Seguridad frenos/ABS(⭐⭐⭐⭐).
Perfiles de uso: Mensajería→Boxer/CB110/NKD(económicas). Ciudad→FZ/Gixxer/CB125F(versátiles). Viaje→Dominar/XRE300(potencia+comodidad). Primer moto→CB110/Crypton(fáciles). Deporte→NS200/MT-15/Duke.
Responde con tabla comparativa lado a lado + veredicto por situación + costo total 5 años.
Costo total propiedad = Compra + Manto×5 + SOAT×5 + Gasolina×5 - Reventa_5años.`,
    },
    {
        id: 'planificador-viajes',
        name: 'Planificador de Viajes',
        keywords: [
            'viaje', 'viajar', 'ruta', 'llevar', 'checklist', 'equipaje',
            'carretera', 'recorrido', 'paseo', 'salir',
        ],
        content: `PLANIFICADOR DE VIAJES EN MOTO:
Checklist mecánico (🔴crítico): Aceite nivel/color, frenos pastillas>2mm+líquido, llantas labrado>2mm+presión(aumentar si carga), luces todas, cadena lubricada/tensada, documentos completos.
Equipo: Casco integral, chaqueta protecciones, guantes, impermeable, herramientas básicas, cable embrague/acelerador repuesto, cámara/parches, botiquín, candado disco.
Preparación por distancia: <100km verificación rápida, 100-300km revisión completa+kit, 300-800km servicio preventivo, >800km servicio completo+repuestos reserva.
Presupuesto: Gasolina=km÷rendimiento×precio_galón, peajes $5-15K c/u, alimentación $15-40K/comida, hospedaje $30-100K/noche, +15-20% imprevistos.
Tips: Parar cada 2h, evitar noche, llevar efectivo, avisar ruta, tanquear frecuente, verificar clima.`,
    },
    {
        id: 'historial-depreciacion',
        name: 'Historial de Depreciación',
        keywords: [
            'depreciacion', 'devalua', 'cuando vender', 'perdido valor',
            'vale menos', 'cuanto pierde',
        ],
        content: `DEPRECIACIÓN DE MOTOS:
Curva anual: Año1 -15-20%, Año2 -8-12%, Año3 -6-10%, Año4-5 -5-8%, Año6-8 -3-6%, Año9-12 -2-4%, Año13+ -1-3%.
Factor marca: Honda depreciación menor (0.85), AKT/TVS mayor (1.15).
Momento óptimo vender: 3-5 años (aún retiene 50-60% del valor). Indicadores de vender: reparaciones_año > 25% valor actual, modelo nuevo salió, mantenimiento cada vez más costoso.
Indicadores de mantener: Funciona bien, gastos estables, modelo con buena demanda.
Tips para mantener valor: Documentos al día, historial de mantenimiento, un solo dueño, sin modificaciones del motor, guardar facturas.`,
    },
    {
        id: 'tuning-modificaciones',
        name: 'Tuning y Modificaciones',
        keywords: [
            'modificar', 'tuning', 'escape', 'accesorio', 'mejora',
            'potencia', 'personalizar', 'slider', 'defensa', 'baul',
            'parrilla', 'usb',
        ],
        content: `TUNING Y MODIFICACIONES COLOMBIA:
✅ Legales: Defensas/sliders, parrilla/baúl, protector manos, luces adicionales(sin encandilar), calcomanías, espejos aftermarket(2 funcionales).
⚠️ Zona gris: Conversión LED faro(si no encandila), direccionales LED(frecuencia correcta), rines misma medida.
🔴 Ilegales/Problemáticas: Escape ruidoso(multa+no pasa tecno), aumento cilindrada sin registrar RUNT, eliminar catalizador, barras LED frontales, placas modificadas.
Mejoras rendimiento seguras: Bujía iridio($25-45K), filtro alto flujo($40-80K, +2-5%potencia), aceite sintético, piñón -1 diente(más fuerza).
Accesorios útiles: Candado disco alarma($40-100K), soporte celular($20-50K), USB($15-40K), maletas laterales($150-500K).
⚠️ Escape deportivo anula garantía. Cambiar relación transmisión afecta velocímetro.`,
    },
    {
        id: 'seguros-coberturas',
        name: 'Seguros y Coberturas',
        keywords: [
            'seguro', 'poliza', 'cobertura', 'robo', 'aseguradora',
            'reclamar', 'todo riesgo', 'siniestro',
        ],
        content: `SEGUROS PARA MOTOS COLOMBIA:
SOAT (obligatorio): Cubre gastos médicos/muerte de TERCEROS. NO cubre tu moto ni a ti.
Todo Riesgo (voluntario): Cubre robo+accidente+daños propios+responsabilidad civil. Costo: 3-6% valor moto/año. Deducible: 10-20%.
Vale la pena si: Moto >$8M, herramienta de trabajo, zona alto riesgo robo, financiada.
No necesario si: Moto <$4M (seguro cuesta más que beneficio), guardada segura, uso mínimo.
Aseguradoras Colombia: SURA(buena red), Bolívar(buenos precios), Liberty(asistencia vía), Mapfre, La Previsora.
En accidente: 1.Seguridad, 2.Llamar 123 si heridos, 3.Fotos, 4.Datos del otro, 5.Llamar aseguradora, 6.NO decir "fue mi culpa".
En robo: 1.Denunciar Fiscalía 24-48h, 2.Llamar aseguradora, 3.Bloquear en RUNT, 4.Plazo pago 30-60 días.`,
    },

    // ===== CATEGORÍA 5: SKILLS OPERATIVAS =====
    {
        id: 'onboarding',
        name: 'Onboarding Inteligente',
        keywords: [
            'como funciona', 'nueva', 'primera vez', 'que puedo hacer',
            'ayuda con la app', 'empezar', 'recien', 'acabo de',
        ],
        content: `ONBOARDING - USUARIO NUEVO:
Si el usuario tiene 0 motos registradas o parece nuevo:
1. Bienvenida cálida: "¡Bienvenido a MotoGestor! Soy MotoBot, tu mecánico virtual."
2. Paso 1: "Ve a 🏍️ Garaje → + Agregar moto. Ingresa marca, modelo, año, placa, km y fechas SOAT/Tecno."
3. Paso 2: "Luego ve a 🔧 Mantenimientos y registra tu último servicio. Tip: usa 📷 Escanear factura con IA."
4. Paso 3: "Opcionalmente sube el manual PDF de tu moto desde su vista de detalle para desbloquear guías del manual e insights IA."
Funcionalidades: 🏍️Garaje(motos+docs), 🔧Mantenimientos(historial+recordatorios), 💰Finanzas(gastos), 🤖Chat IA(pregúntame), 📷Scanner(identifica motos), 📖Manuales(RAG).`,
    },
    {
        id: 'faq-soporte',
        name: 'FAQ y Soporte de la App',
        keywords: [
            'no funciona', 'error', 'como hago', 'donde esta', 'bug',
            'problema con la app', 'no carga', 'no aparece', 'no puedo',
        ],
        content: `FAQ Y SOPORTE APP:
Registro de moto: Garaje → + Agregar moto → llenar datos.
Registrar servicio: Mantenimientos → + Registrar servicio → formulario.
Escanear factura: En formulario de servicio → 📷 Escanear factura con IA.
Actuzalizar km: Mantenimientos → sección "Actualizar kilometraje".
Subir manual: Garaje → clic en moto → Detalle → sección Manual → Subir PDF.
Exportar datos: Mantenimientos → 📥 Exportar CSV.
Errores comunes: "Error al conectar IA"=verificar internet. Scanner no extrae=foto más clara. Manual no procesa=PDF <20MB estándar.
Navegación: Dashboard(resumen), Garaje(motos), Mantenimiento(servicios), Finanzas(gastos), Asistente IA(chat+scanner), Perfil(cuenta).
Límites: No agenda citas, no paga SOAT, no conecta OBD, no GPS.`,
    },
    {
        id: 'engagement',
        name: 'Engagement y Gamificación',
        keywords: [
            'tip', 'consejo del dia', 'reto', 'logro', 'dato curioso',
            'sabias que',
        ],
        content: `ENGAGEMENT Y TIPS:
Tips rotación: "Lubricar cadena cada 500km duplica su vida útil", "Aceite se degrada con el tiempo aunque no uses la moto", "5 PSI de diferencia en llantas aumenta desgaste 25%", "Calienta motor 1-2 min antes de arrancar", "El 70% de accidentes letales se evitan con casco integral", "Mantenimiento preventivo cuesta 60% menos que reparaciones".
Logros: 🌟Primera vez(1er servicio), 🔧Mecánico dedicado(5 servicios), 🛢️Maestro aceite(10 cambios), 📋Al día(SOAT+tecno vigentes), 📖Manual loaded(subir PDF).
Mensajes por contexto: Activo→"¡Tu moto está al día! Eso mantiene su valor", Atrasado→"Tu aceite lleva 4,500km ¿programamos servicio?", Inactivo→"¡Hola! Tu moto tiene X km, hay servicios pendientes".`,
    },
    {
        id: 'feedback',
        name: 'Recolección de Feedback',
        keywords: [
            'sugerencia', 'mejora', 'ojala pudiera', 'falta', 'deberia',
            'me gustaria', 'por que no', 'seria bueno',
        ],
        content: `RECOLECCIÓN DE FEEDBACK:
Detectar frustración: "no funciona", "no sirve", "es complicado", misma pregunta repetida, respuestas muy cortas.
Ante frustración: "Entiendo tu frustración. ¿Podrías contarme más sobre lo que esperabas? Tu feedback nos ayuda a mejorar 🙏"
Ante sugerencia: "¡Excelente idea! La registro para el equipo. ¿Hay algo más que te gustaría ver en MotoGestor?"
Ante satisfacción: "¡Genial saberlo! ¿Hay algo que podamos hacer aún mejor?"
Reglas: NUNCA pedir feedback más de 1 vez por sesión. NO interrumpir si está ocupado. Ser genuinamente empático. NO prometer features que no existen. Agradecer SIEMPRE.`,
    },
];

// ---------------------------------------------------------------------------
// Skill Matcher — finds relevant skills based on user message
// ---------------------------------------------------------------------------
export function matchSkills(message: string, maxResults = 3): SkillDefinition[] {
    const normalized = normalize(message);
    const words = normalized.split(/\s+/);

    const scored: { skill: SkillDefinition; score: number }[] = [];

    for (const skill of SKILLS_REGISTRY) {
        let score = 0;

        for (const keyword of skill.keywords) {
            const normalizedKeyword = normalize(keyword);

            // Multi-word keyword (phrase match = higher score)
            if (normalizedKeyword.includes(' ')) {
                if (normalized.includes(normalizedKeyword)) {
                    score += 3;
                }
            } else {
                // Single word match
                if (words.includes(normalizedKeyword)) {
                    score += 2;
                } else if (normalized.includes(normalizedKeyword)) {
                    // Partial match (substring)
                    score += 1;
                }
            }
        }

        if (score > 0) {
            scored.push({ skill, score });
        }
    }

    // Sort by score descending, return top N
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(s => s.skill);
}

// ---------------------------------------------------------------------------
// Context Builder — formats matched skills for the system prompt
// ---------------------------------------------------------------------------
export function buildSkillContext(skills: SkillDefinition[]): string {
    if (skills.length === 0) return '';

    const skillBlocks = skills
        .map(s => `\n--- ${s.name} ---\n${s.content}`)
        .join('\n');

    return `\n\nINSTRUCCIONES ESPECIALIZADAS (usa este conocimiento para responder con mayor precisión):${skillBlocks}`;
}
