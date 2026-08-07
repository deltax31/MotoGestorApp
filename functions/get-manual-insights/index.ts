import { createClient } from 'npm:@insforge/sdk';

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
    const { brand, model, current_km, query, match_count = 3 } = body;

    if (!brand || !model) {
      return new Response(JSON.stringify({ error: 'Missing brand or model' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 1: Generate embedding for the query
    const embedQuery = query || `Próximo mantenimiento y revisiones críticas para ${brand} ${model} con ${current_km} km. ¿Qué servicios están pendientes o próximos según el manual?`;
    
    const embedRes = await client.ai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: embedQuery,
    });
    
    const queryEmbedding = embedRes.data[0].embedding;

    // Step 2: Search global manual chunks using RPC
    const { data: chunks, error: rpcError } = await client.database.rpc('match_global_manual_chunks', {
        query_embedding: queryEmbedding,
        match_brand: brand,
        match_model: model,
        match_count: match_count
    });

    if (rpcError) {
        throw new Error(`RPC Error: ${rpcError.message}`);
    }

    if (!chunks || chunks.length === 0) {
        return new Response(JSON.stringify({ data: null }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 3: Extract insights using Chat Completions
    const context = chunks.map((c: any, i: number) => `[Fragmento ${i + 1} — ${c.category}${c.km_threshold ? ` (${c.km_threshold}km)` : ''}]: ${c.content_chunk}`).join('\n\n');

    let systemPrompt = 'Eres un experto mecánico. Usa SOLO la información del manual proporcionada. Responde en español, de forma concisa.';
    let userPrompt = `Moto: ${brand} ${model}, Km actual: ${current_km}\n\nFragmentos del manual:\n${context}\n\nResponde SOLO en JSON:\n{"tip_dashboard": "Un tip corto y útil sacado del manual para la pantalla principal (máx 15 palabras)", "alert": "alerta prioritaria de mantenimiento o 'Sin alertas'", "nextService": "próximo servicio según manual", "reference": "fragmento clave del manual"}`;

    const chatRes = await client.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        maxTokens: 400,
    });

    let result = null;
    try {
        const text = chatRes.choices[0].message.content;
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            result = JSON.parse(match[0]);
        }
    } catch (e) {
        console.error("Parse error:", e);
    }

    return new Response(JSON.stringify({ data: result }), {
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
