import { create } from 'zustand';
import { insforge } from '@/services/insforge/client';
import { useVehiculoStore } from './vehiculoStore';

export interface ChatMessage {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
}

interface AIState {
    messages: ChatMessage[];
    isLoadingHistory: boolean;
    isGenerating: boolean;
    error: string | null;
    fetchHistory: (userId: string) => Promise<void>;
    sendMessage: (userId: string, content: string) => Promise<void>;
    clearHistory: (userId: string) => Promise<void>;
}

export const useAsistenteStore = create<AIState>((set, get) => ({
    messages: [],
    isLoadingHistory: false,
    isGenerating: false,
    error: null,

    fetchHistory: async (userId: string) => {
        set({ isLoadingHistory: true, error: null });
        try {
            const { data, error } = await insforge.database
                .from('chat_messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            set({ messages: data || [], isLoadingHistory: false });
        } catch (err: any) {
            set({ error: err.message, isLoadingHistory: false });
        }
    },

    clearHistory: async (userId: string) => {
        try {
            await insforge.database.from('chat_messages').delete().eq('user_id', userId);
            set({ messages: [] });
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    },

    sendMessage: async (userId: string, content: string) => {
        // Add user message instantly
        const userMsg: ChatMessage = { role: 'user', content };
        const currentMessages = get().messages;
        
        // Add assistant placeholder
        const assistantPlaceholderId = 'temp-' + Date.now();
        set({ 
            messages: [...currentMessages, userMsg, { id: assistantPlaceholderId, role: 'assistant', content: '' }],
            isGenerating: true,
            error: null
        });
        const motorcycles = useVehiculoStore.getState().motorcycles;
        const motosContext = motorcycles.length > 0 
            ? `\n\nContexto del usuario:\nEl usuario tiene las siguientes motos registradas en su garaje:\n${motorcycles.map(m => `- ${m.brand} ${m.model} (${m.year}) - ${m.current_km} km. SOAT: ${m.soat_status}, Tecno: ${m.tecno_status}`).join('\n')}`
            : '\n\nContexto del usuario:\nEl usuario aún no tiene motos registradas en su garaje.';

        try {
            // Save user message to database
            await insforge.database.from('chat_messages').insert([{ user_id: userId, role: 'user', content }]);
            // Lógica directa de IA consumiendo el cliente de InsForge
            // Esto replica la lógica que existía en el aiService.ts del proyecto anterior
            const stream = await insforge.ai.chat.completions.create({
                model: 'anthropic/claude-sonnet-4.5',
                messages: [
                    { 
                        role: 'system', 
                        content: `Eres MotoGestor IA, un asistente experto en motocicletas para el mercado colombiano.
- Responde siempre en español
- Usa emojis cuando sea apropiado 🏍️
- Cuando mencionas un servicio, incluye el intervalo recomendado en km y costo estimado en pesos colombianos
- Si el usuario menciona síntomas, haz preguntas de diagnóstico para identificar la causa
- Siempre prioriza la seguridad vial${motosContext}`
                    },
                    ...currentMessages.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content }
                ],
                stream: true,
                maxTokens: 1024,
            });

            let accumulatedText = '';
            
            for await (const chunk of stream as any) {
                const delta = chunk.choices[0]?.delta?.content || '';
                if (delta) {
                    accumulatedText += delta;
                    // Update the placeholder message with new chunk
                    set(state => ({
                        messages: state.messages.map(m => 
                            m.id === assistantPlaceholderId 
                                ? { ...m, content: accumulatedText }
                                : m
                        )
                    }));
                }
            }
            
            set({ isGenerating: false });
            
            // Save assistant message to database
            await insforge.database.from('chat_messages').insert([{ user_id: userId, role: 'assistant', content: accumulatedText }]);

            // Re-fetch to get real DB IDs
            await get().fetchHistory(userId);
            
        } catch (err: any) {
            console.error('AI Error:', err);
            set(state => ({ 
                error: err.message, 
                isGenerating: false,
                messages: state.messages.filter(m => m.id !== assistantPlaceholderId)
            }));
        }
    }
}));
