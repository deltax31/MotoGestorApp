import { insforge } from '../lib/insforge';
import { ChatMessage } from '../types';

export const chatService = {
    async getHistory(userId: string, limit = 100): Promise<ChatMessage[]> {
        const { data } = await insforge.database
            .from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(limit);
        return data || [];
    },

    async saveMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
        await insforge.database
            .from('chat_messages')
            .insert([{ user_id: userId, role, content }]);
    },

    async clearHistory(userId: string): Promise<void> {
        await insforge.database
            .from('chat_messages')
            .delete()
            .eq('user_id', userId);
    },
};
