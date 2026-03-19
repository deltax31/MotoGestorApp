import { insforge } from '../lib/insforge';
import { Motorcycle, ChatMessage, ManualChunk } from '../types';
import { searchManual, getManualInsights as ragGetManualInsights } from '../lib/rag';
import { matchSkills, buildSkillContext } from '../lib/skills';

const SYSTEM_PROMPT = `Eres MotoGestor IA, un asistente experto en motocicletas para el mercado colombiano.
- Responde siempre en español
- Usa emojis cuando sea apropiado 🏍️
- Cuando mencionas un servicio, incluye el intervalo recomendado en km y costo estimado en pesos colombianos
- Si el usuario menciona síntomas, haz preguntas de diagnóstico para identificar la causa
- Siempre prioriza la seguridad vial`;

export interface StreamCallbacks {
    onChunk: (fullText: string) => void;
    onComplete: (fullText: string) => void;
    onError: (error: Error) => void;
}

export const aiService = {
    /**
     * Send a chat message with streaming, RAG context, and skill routing
     */
    async sendMessage(
        userMsg: string,
        userId: string,
        motos: Motorcycle[],
        previousMessages: ChatMessage[],
        chatImage: string,
        callbacks: StreamCallbacks,
    ): Promise<void> {
        // RAG: Search manual embeddings for relevant context
        let ragContext = '';
        if (motos.length > 0) {
            const allChunks: string[] = [];
            for (const moto of motos) {
                const chunks = await searchManual(moto.id, userId, userMsg, 2);
                if (chunks.length > 0) {
                    allChunks.push(`\n--- Manual de ${moto.brand} ${moto.model} ---\n${chunks.map(c => c.content_chunk).join('\n')}`);
                }
            }
            if (allChunks.length > 0) {
                ragContext = `\n\nINFORMACIÓN DEL MANUAL OFICIAL del usuario (úsala para dar respuestas precisas, cita las referencias cuando aplique):${allChunks.join('')}`;
            }
        }

        // Skill routing: detect relevant skills and inject knowledge
        const matchedSkills = matchSkills(userMsg);
        const skillContext = buildSkillContext(matchedSkills);

        // Build motorcycle context info
        const contextInfo = motos.length > 0
            ? `\n\nMotos del usuario:\n${motos.map(m => `- ${m.brand} ${m.model} ${m.year} (${m.current_km} km, placa: ${m.plate})`).join('\n')}`
            : '';

        const allMessages = [...previousMessages.slice(-20)];
        const stream = await insforge.ai.chat.completions.create({
            model: 'anthropic/claude-sonnet-4.5',
            messages: [
                { role: 'user', content: SYSTEM_PROMPT + skillContext + contextInfo + ragContext },
                ...allMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                chatImage
                    ? {
                        role: 'user' as const, content: [
                            { type: 'text' as const, text: userMsg },
                            { type: 'image_url' as const, image_url: { url: chatImage } }
                        ] as any
                    }
                    : { role: 'user' as const, content: userMsg },
            ],
            stream: true,
            maxTokens: 1024,
        });

        let full = '';
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
                full += delta;
                callbacks.onChunk(full);
            }
        }
        callbacks.onComplete(full);
    },

    /**
     * Scan a motorcycle image with AI
     */
    async scanMotorcycleImage(imageBase64: string): Promise<string> {
        const response = await insforge.ai.chat.completions.create({
            model: 'anthropic/claude-sonnet-4.5',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Analiza esta imagen de motocicleta. Identifica: 1) Marca y modelo (en Colombia es posible que sea una moto popular como Honda CB, Yamaha FZ, AKT NKD, Bajaj Pulsar, etc.) 2) Año aproximado si es posible deducirlo, 3) Características y cilindraje estimado. Responde de forma organizada y concisa en español.' },
                    { type: 'image_url', image_url: { url: imageBase64 } }
                ]
            }],
            maxTokens: 500,
        });
        return response.choices[0].message.content;
    },

    /**
     * Scan a document (SOAT or Tecnomecánica) with AI
     */
    async scanDocument(imageBase64: string, type: 'soat' | 'tecno'): Promise<{ expiry?: string; policy?: string; certificate?: string }> {
        const prompt = type === 'soat'
            ? 'Analiza esta imagen de un documento SOAT colombiano. Extrae ÚNICAMENTE la fecha de vencimiento en formato YYYY-MM-DD. Si encuentras un número de póliza, extráelo también. Responde SOLO en formato JSON: {"expiry": "YYYY-MM-DD", "policy": "número o null"}'
            : 'Analiza esta imagen de un certificado de Tecnomecánica colombiano. Extrae ÚNICAMENTE la fecha de vencimiento en formato YYYY-MM-DD. Si encuentras un número de certificado, extráelo también. Responde SOLO en formato JSON: {"expiry": "YYYY-MM-DD", "certificate": "número o null"}';

        const response = await insforge.ai.chat.completions.create({
            model: 'anthropic/claude-sonnet-4.5',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageBase64 } }
                ]
            }],
            maxTokens: 200,
        });

        const text = response.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No se pudo extraer la información del documento');
    },

    /**
     * Scan an invoice/receipt image with AI
     */
    async scanInvoice(imageBase64: string): Promise<{ category?: string; amount?: number; description?: string; date?: string }> {
        const response = await insforge.ai.chat.completions.create({
            model: 'anthropic/claude-sonnet-4.5',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Analiza esta imagen de una factura/recibo/ticket de pago relacionado con motocicletas en Colombia. Extrae la información y responde SOLO en JSON: {"category": "una de estas: combustible, mantenimiento, seguro, repuestos, multas, otros", "amount": número, "description": "descripción breve del gasto", "date": "YYYY-MM-DD o null"}' },
                    { type: 'image_url', image_url: { url: imageBase64 } }
                ]
            }],
            maxTokens: 300,
        });
        const text = response.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error('No se pudo extraer la información de la factura');
    },

    /**
     * Scan a motorcycle registration card with AI
     */
    async scanRegistration(imageBase64: string): Promise<{ brand?: string; model?: string; year?: number; plate?: string; color?: string; engine_cc?: number }> {
        const response = await insforge.ai.chat.completions.create({
            model: 'anthropic/claude-sonnet-4.5',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Analiza esta imagen de una tarjeta de propiedad / matrícula de un vehículo colombiano (motocicleta). Extrae la información y responde SOLO en JSON: {"brand": "marca (ej: Honda, Yamaha)", "model": "línea/modelo (ej: CB 125F)", "year": número, "plate": "placa en mayúsculas (ej: ABC12D)", "color": "color principal", "engine_cc": número (cilindraje en cc)}' },
                    { type: 'image_url', image_url: { url: imageBase64 } }
                ]
            }],
            maxTokens: 300,
        });
        const text = response.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error('No se pudo extraer la información de la matrícula');
    },


    /**
     * Get maintenance insights from RAG for a motorcycle
     */
    async getManualInsights(moto: Motorcycle, userId: string) {
        return ragGetManualInsights(moto, userId);
    },

    /**
     * Search manual for a specific query
     */
    async searchManualChunks(motorcycleId: string, userId: string, query: string, matchCount = 5): Promise<ManualChunk[]> {
        return searchManual(motorcycleId, userId, query, matchCount);
    },
};
