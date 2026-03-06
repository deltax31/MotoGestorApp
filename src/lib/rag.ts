import { insforge } from './insforge';
import { ManualChunk, Motorcycle } from '../types';

/**
 * Split text into overlapping chunks for embedding
 */
export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
        if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
            chunks.push(current.trim());
            // Keep overlap from the end of current chunk
            const words = current.split(' ');
            const overlapWords = words.slice(-Math.ceil(overlap / 5));
            current = overlapWords.join(' ') + ' ' + sentence;
        } else {
            current = current ? current + ' ' + sentence : sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

/**
 * Generate embedding for a text query
 */
async function getEmbedding(text: string): Promise<number[]> {
    const response = await insforge.ai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding as number[];
}

/**
 * Classify a chunk's category and extract km_threshold using AI
 */
export async function classifyChunk(chunk: string): Promise<{ category: string; km_threshold: number | null }> {
    try {
        const response = await insforge.ai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Clasifica este fragmento de manual de motocicleta. Responde SOLO en JSON:
{"category": "engine|maintenance_schedule|tires|fluids|electrical|general", "km_threshold": número_o_null}

Fragmento: "${chunk.slice(0, 500)}"`,
            }],
            maxTokens: 100,
        });
        const text = response.choices[0].message.content;
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
    } catch { /* fallback */ }
    return { category: 'general', km_threshold: null };
}

/**
 * Process and store chunks with embeddings for a motorcycle manual
 */
export async function processManualText(
    manualId: string,
    motorcycleId: string,
    userId: string,
    fullText: string,
    onProgress?: (current: number, total: number) => void,
): Promise<number> {
    const chunks = chunkText(fullText);
    let processed = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        // Generate embedding
        const embedding = await getEmbedding(chunk);
        // Classify
        const { category, km_threshold } = await classifyChunk(chunk);
        // Insert
        await insforge.database.from('manual_embeddings').insert([{
            manual_id: manualId,
            motorcycle_id: motorcycleId,
            user_id: userId,
            content_chunk: chunk,
            embedding,
            category,
            km_threshold,
            chunk_index: i,
        }]);
        processed++;
        onProgress?.(processed, chunks.length);
    }

    // Update manual total_chunks
    await insforge.database.from('manuals').update({ total_chunks: chunks.length }).eq('id', manualId);

    return chunks.length;
}

/**
 * Semantic search in manual embeddings for a motorcycle
 */
export async function searchManual(
    motorcycleId: string,
    userId: string,
    query: string,
    matchCount = 5,
): Promise<ManualChunk[]> {
    try {
        const queryEmbedding = await getEmbedding(query);
        const { data, error } = await insforge.database.rpc('match_manual_chunks', {
            query_embedding: queryEmbedding,
            match_motorcycle_id: motorcycleId,
            match_user_id: userId,
            match_count: matchCount,
        });
        if (error || !data) return [];
        return data as ManualChunk[];
    } catch {
        return [];
    }
}

/**
 * Get maintenance insights for a motorcycle based on its manual
 */
export async function getManualInsights(
    moto: Motorcycle,
    userId: string,
): Promise<{ alert: string; nextService: string; reference: string } | null> {
    const query = `Próximo mantenimiento y revisiones críticas para ${moto.brand} ${moto.model} con ${moto.current_km} km. ¿Qué servicios están pendientes o próximos según el manual?`;
    const chunks = await searchManual(moto.id, userId, query, 3);
    if (chunks.length === 0) return null;

    const context = chunks.map((c, i) => `[Fragmento ${i + 1} — ${c.category}${c.km_threshold ? ` (${c.km_threshold}km)` : ''}]: ${c.content_chunk}`).join('\n\n');

    const response = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Eres un asistente mecánico preventivo. Usa SOLO la información del manual proporcionada. Responde en español, de forma concisa.' },
            { role: 'user', content: `Moto: ${moto.brand} ${moto.model} ${moto.year}, Km actual: ${moto.current_km}\n\nFragmentos del manual:\n${context}\n\nResponde SOLO en JSON:\n{"alert": "alerta prioritaria o 'Sin alertas'", "nextService": "próximo servicio según manual", "reference": "fragmento clave del manual"}` },
        ],
        maxTokens: 400,
    });

    try {
        const text = response.choices[0].message.content;
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
    } catch { /* fallback */ }
    return null;
}
