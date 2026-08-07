import { insforge } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ManualChunk {
    id: string;
    manual_id: string;
    content_chunk: string;
    category: string;
    km_threshold: number | null;
}

export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
        if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
            chunks.push(current.trim());
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

async function getEmbedding(text: string): Promise<number[]> {
    const response = await insforge.ai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding as number[];
}

export async function classifyChunk(chunk: string): Promise<{ category: string; km_threshold: number | null }> {
    try {
        const response = await insforge.ai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Clasifica este fragmento de manual de motocicleta. Responde SOLO en JSON:\n{"category": "engine|maintenance_schedule|tires|fluids|electrical|general", "km_threshold": número_o_null}\n\nFragmento: "${chunk.slice(0, 500)}"`,
            }],
            maxTokens: 100,
        });
        const text = response.choices[0].message.content;
        const match = text?.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
    } catch { /* fallback */ }
    return { category: 'general', km_threshold: null };
}

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
        const embedding = await getEmbedding(chunk);
        const { category, km_threshold } = await classifyChunk(chunk);
        
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

    await insforge.database.from('manuals').update({ total_chunks: chunks.length }).eq('id', manualId);
    return chunks.length;
}

export async function getManualInsights(motorcycleId: string, brand: string, model: string, currentKm: number) {
    try {
        const cacheKey = `@manual_insights_${motorcycleId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            const now = Date.now();
            const timeDiff = now - parsed.lastUpdated;
            const kmDiff = Math.abs(currentKm - parsed.lastKm);
            
            // Usar caché si pasaron menos de 24 horas Y el km no varió más de 50 km
            if (timeDiff < 24 * 60 * 60 * 1000 && kmDiff < 50) {
                return parsed.data;
            }
        }

        // Step 1: Generate embedding for the query
        const embedQuery = `Próximo mantenimiento y revisiones críticas para ${brand} ${model} con ${currentKm} km. ¿Qué servicios están pendientes o próximos según el manual?`;
        
        const embedRes = await insforge.ai.embeddings.create({
            model: 'openai/text-embedding-3-small',
            input: embedQuery,
        });
        
        const queryEmbedding = embedRes.data[0].embedding;

        // Step 2: Search global manual chunks using RPC
        const { data: chunks, error: rpcError } = await insforge.database.rpc('match_global_manual_chunks', {
            query_embedding: queryEmbedding,
            match_brand: brand,
            match_model: model,
            match_count: 3
        });

        if (rpcError) {
            throw new Error(`RPC Error: ${rpcError.message}`);
        }

        if (!chunks || chunks.length === 0) {
            return null;
        }

        // Step 3: Extract insights using Chat Completions
        const context = chunks.map((c: any, i: number) => `[Fragmento ${i + 1} — ${c.category}${c.km_threshold ? ` (${c.km_threshold}km)` : ''}]: ${c.content_chunk}`).join('\n\n');

        let systemPrompt = 'Eres un experto mecánico. Usa SOLO la información del manual proporcionada. Responde en español, de forma concisa.';
        let userPrompt = `Moto: ${brand} ${model}, Km actual: ${currentKm}\n\nFragmentos del manual:\n${context}\n\nResponde SOLO en JSON:\n{"tip_dashboard": "Un tip corto y útil sacado del manual para la pantalla principal (máx 15 palabras)", "alert": "alerta prioritaria de mantenimiento o 'Sin alertas'", "nextService": "próximo servicio según manual", "reference": "fragmento clave del manual"}`;

        const chatRes = await insforge.ai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            maxTokens: 400,
        });

        const text = chatRes.choices[0].message.content;
        const match = text?.match(/\{[\s\S]*\}/);
        if (match) {
            const data = JSON.parse(match[0]);
            await AsyncStorage.setItem(cacheKey, JSON.stringify({
                lastUpdated: Date.now(),
                lastKm: currentKm,
                data
            }));
            return data;
        }
    } catch (e) {
        console.error("Error in getManualInsights:", e);
    }
    return null;
}
