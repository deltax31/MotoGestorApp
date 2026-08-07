import { createClient } from 'npm:@insforge/sdk';

// Reusing RAG logic directly in the Edge Function for backend processing
function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
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

export default async function(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      edgeFunctionToken: userToken
    });

    const body = await req.json();
    const { storage_key, motorcycle_id, filename } = body;

    if (!storage_key || !motorcycle_id) {
      return new Response(JSON.stringify({ error: 'Missing storage_key or motorcycle_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Get user
    const { data: userData } = await client.auth.getCurrentUser();
    if (!userData?.user?.id) throw new Error("Unauthorized");
    const userId = userData.user.id;

    // 2. Download PDF from Storage
    const { data: fileData, error: downloadError } = await client.storage.from('manuals').download(storage_key);
    if (downloadError || !fileData) throw new Error("Failed to download manual from storage");

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // 3. Extract text with Mistral OCR
    const extraction = await client.ai.chat.completions.create({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: 'Eres un extractor de texto. Tu ÚNICA tarea es transcribir TODO el contenido de este PDF de manual de motocicleta. Devuelve el texto completo organizado por secciones. Incluye TODAS las tablas de mantenimiento, especificaciones técnicas, intervalos de km, torques de apriete, niveles de fluidos, y cualquier dato numérico. NO resumas, NO omitas secciones, NO agregues comentarios propios. Solo devuelve el texto del documento.' },
                { type: 'file', file: { filename: filename || 'manual.pdf', file_data: `data:application/pdf;base64,${base64}` } },
            ],
        }],
        fileParser: { enabled: true, pdf: { engine: 'mistral-ocr' } },
        maxTokens: 16000,
    });

    const fullText = extraction.choices[0].message.content;
    const isRefusal = fullText && (
        fullText.toLowerCase().includes('lo siento, pero no puedo') ||
        fullText.toLowerCase().includes('no puedo extraer')
    );
    if (!fullText || fullText.length < 200 || isRefusal) {
        throw new Error('La IA no pudo extraer el texto del PDF. Intenta con otro archivo o formato.');
    }

    // 4. Create manual record
    const { data: manual, error: manualError } = await client.database.from('manuals').insert([{
        motorcycle_id,
        user_id: userId,
        filename: filename || 'manual.pdf',
        storage_key,
    }]).select().single();

    if (manualError || !manual) throw new Error('Error al crear registro del manual');

    // 5. Process chunks and embeddings
    const chunks = chunkText(fullText);
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Embed
        const embedRes = await client.ai.embeddings.create({
            model: 'openai/text-embedding-3-small',
            input: chunk,
        });
        const embedding = embedRes.data[0].embedding;

        // Classify
        let category = 'general';
        let km_threshold = null;
        try {
            const classRes = await client.ai.chat.completions.create({
                model: 'openai/gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: `Clasifica este fragmento de manual de motocicleta. Responde SOLO en JSON:\n{"category": "engine|maintenance_schedule|tires|fluids|electrical|general", "km_threshold": número_o_null}\n\nFragmento: "${chunk.slice(0, 500)}"`,
                }],
                maxTokens: 100,
            });
            const classText = classRes.choices[0].message.content;
            const match = classText?.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                category = parsed.category || category;
                km_threshold = parsed.km_threshold || km_threshold;
            }
        } catch { /* ignore */ }
        
        // Insert
        await client.database.from('manual_embeddings').insert([{
            manual_id: manual.id,
            motorcycle_id,
            user_id: userId,
            content_chunk: chunk,
            embedding,
            category,
            km_threshold,
            chunk_index: i,
        }]);
    }

    // Update total
    await client.database.from('manuals').update({ total_chunks: chunks.length }).eq('id', manual.id);

    return new Response(JSON.stringify({ success: true, chunksProcessed: chunks.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
