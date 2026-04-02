const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SKILLS_REGISTRY = [
    { id: 'diagnostico-por-sintomas', keywords: ['ruido', 'vibra', 'vibracion', 'humo', 'olor', 'falla', 'no enciende', 'no arranca', 'se apaga', 'pierde potencia', 'consumo excesivo', 'recalienta', 'calienta', 'frena mal', 'tiembla', 'cascabeleo', 'golpeteo', 'silbido', 'suena raro', 'problema', 'sintoma'] },
    { id: 'mantenimiento-preventivo', keywords: ['cada cuanto', 'intervalo', 'cambio aceite', 'cambio de aceite', 'mantenimiento', 'servicio', 'filtro', 'bujia', 'cadena', 'frenos', 'preventivo', 'cuando cambiar', 'pastillas', 'revision', 'lubricar', 'tensar', 'refrigerante', 'liquido frenos'] },
    { id: 'repuestos-compatibilidad', keywords: ['repuesto', 'compatible', 'le sirve', 'pieza', 'referencia', 'oem', 'aftermarket', 'alternativa', 'equivalente', 'kit arrastre', 'donde consigo', 'marca de repuesto'] },
    { id: 'especificaciones-tecnicas', keywords: ['torque', 'especificacion', 'capacidad', 'cuanto aceite', 'cuantos litros', 'presion llanta', 'dato tecnico', 'ficha tecnica', 'medida', 'apriete', 'holgura', 'calibracion'] },
    { id: 'sistemas-electricos', keywords: ['bateria', 'luces', 'electrico', 'fusible', 'regulador', 'led', 'arranque', 'carga', 'no prende', 'tablero', 'bombillo', 'direccional', 'sensor', 'check engine', 'inyeccion'] },
    { id: 'motor-transmision', keywords: ['motor', 'embrague', 'caja', 'cambios', 'carburador', 'inyeccion', 'piston', 'valvulas', 'transmision', 'patina', 'cilindro', 'compresion', 'biela', 'anillos', 'culata', 'velocidades'] },
    { id: 'normativa-tramites-colombia', keywords: ['soat', 'tecnomecanica', 'tecno', 'runt', 'traspaso', 'matricula', 'licencia', 'comparendo', 'multa', 'simit', 'documentos', 'papeles', 'impuesto', 'pico y placa'] },
    { id: 'marcas-populares-colombia', keywords: ['cual es mejor', 'que marca', 'honda', 'yamaha', 'bajaj', 'pulsar', 'akt', 'suzuki', 'kawasaki', 'tvs', 'hero', 'auteco', 'gixxer', 'dominar', 'fz', 'nkd', 'boxer', 'crypton', 'xr', 'duke'] },
    { id: 'costos-precios-cop', keywords: ['cuanto cuesta', 'precio', 'valor', 'cobrar', 'presupuesto', 'barato', 'caro', 'cop', 'pesos', 'cuanto vale', 'cuanto cobran', 'mano de obra', 'cuanto sale'] },
    { id: 'seguridad-vial-colombia', keywords: ['casco', 'chaleco', 'seguridad', 'accidente', 'proteccion', 'guantes', 'caida', 'chaqueta', 'equipo', 'reflectivo'] },
    { id: 'conduccion-terrenos-colombianos', keywords: ['lluvia', 'montana', 'trocha', 'destapado', 'altitud', 'frio', 'curva', 'pendiente', 'bajada', 'subida', 'terreno', 'barro', 'piedra', 'paso agua'] },
    { id: 'interpretacion-manuales', keywords: ['manual', 'segun manual', 'dice el manual', 'guia', 'procedimiento oficial', 'segun el libro', 'especificacion del fabricante'] },
    { id: 'analisis-facturas', keywords: ['factura', 'recibo', 'cobro', 'le cobraron', 'justo', 'taller', 'cuenta', 'boleta'] },
    { id: 'identificacion-visual-motos', keywords: ['identificar', 'que moto es', 'foto', 'imagen', 'reconocer', 'que modelo', 'de que ano'] },
    { id: 'alertas-predictivas', keywords: ['proximo servicio', 'que le toca', 'pendiente', 'atrasado', 'recordatorio', 'vencido', 'proxima revision', 'que me falta'] },
    { id: 'asistente-presupuesto', keywords: ['gasto', 'ahorrar', 'optimizar', 'proyeccion', 'cuanto me cuesta', 'financiero', 'economia', 'dinero', 'inversion'] },
    { id: 'valoracion-motos', keywords: ['cuanto vale mi moto', 'vender', 'valorar', 'precio usado', 'reventa', 'cuanto puedo pedir', 'comprar usada'] },
    { id: 'comparador-motos', keywords: ['comparar', 'cual es mejor', 'diferencia entre', 'vs', 'versus', 'o la', 'recomendame', 'que moto compro', 'primera moto'] },
    { id: 'planificador-viajes', keywords: ['viaje', 'viajar', 'ruta', 'llevar', 'checklist', 'equipaje', 'carretera', 'recorrido', 'paseo', 'salir'] },
    { id: 'historial-depreciacion', keywords: ['depreciacion', 'devalua', 'cuando vender', 'perdido valor', 'vale menos', 'cuanto pierde'] },
    { id: 'tuning-modificaciones', keywords: ['modificar', 'tuning', 'escape', 'accesorio', 'mejora', 'potencia', 'personalizar', 'slider', 'defensa', 'baul', 'parrilla', 'usb'] },
    { id: 'seguros-coberturas', keywords: ['seguro', 'poliza', 'cobertura', 'robo', 'aseguradora', 'reclamar', 'todo riesgo', 'siniestro'] },
    { id: 'onboarding-inteligente', keywords: ['como funciona', 'nueva', 'primera vez', 'que puedo hacer', 'ayuda con la app', 'empezar', 'recien', 'acabo de'] },
    { id: 'faq-soporte-app', keywords: ['no funciona', 'error', 'como hago', 'donde esta', 'bug', 'problema con la app', 'no carga', 'no aparece', 'no puedo'] },
    { id: 'engagement-gamificacion', keywords: ['tip', 'consejo del dia', 'reto', 'logro', 'dato curioso', 'sabias que'] },
    { id: 'recoleccion-feedback', keywords: ['sugerencia', 'mejora', 'ojala pudiera', 'falta', 'deberia', 'me gustaria', 'por que no', 'seria bueno'] }
];

const vault = path.join(process.cwd(), 'MotoGestor-Brain', '1. Skills (Agentes de IA)');
const files = fs.readdirSync(vault).filter(f => f.endsWith('.md'));

for (const file of files) {
    const id = file.replace('.md', '');
    const skill = SKILLS_REGISTRY.find(s => s.id === id);
    if (skill) {
        const filePath = path.join(vault, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(content);
        if (!parsed.data.keywords) {
            parsed.data.keywords = skill.keywords;
            const newContent = matter.stringify(parsed.content, parsed.data);
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`Injected keywords into ${file}`);
        }
    } else {
        console.log(`Skill not found in registry: ${id}`);
    }
}
