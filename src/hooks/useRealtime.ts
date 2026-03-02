import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@insforge/react';
import { insforge } from '../lib/insforge';

type RealtimeEventMap = {
    motorcycle: () => void;
    maintenance: () => void;
    expense: () => void;
};

export function useRealtime(callbacks: Partial<RealtimeEventMap>, userId?: string) {
    const { isSignedIn } = useAuth();
    const connectedRef = useRef(false);
    const channelsRef = useRef<string[]>([]);

    const connect = useCallback(async (uid: string) => {
        if (connectedRef.current) return;
        await insforge.realtime.connect();
        connectedRef.current = true;

        const channels: string[] = [];
        if (callbacks.motorcycle) {
            const ch = `motorcycles:${uid}`;
            await insforge.realtime.subscribe(ch);
            channels.push(ch);
            insforge.realtime.on('INSERT_motorcycle', callbacks.motorcycle);
            insforge.realtime.on('UPDATE_motorcycle', callbacks.motorcycle);
            insforge.realtime.on('DELETE_motorcycle', callbacks.motorcycle);
        }
        if (callbacks.maintenance) {
            const ch = `maintenance:${uid}`;
            await insforge.realtime.subscribe(ch);
            channels.push(ch);
            insforge.realtime.on('INSERT_maintenance', callbacks.maintenance);
            insforge.realtime.on('UPDATE_maintenance', callbacks.maintenance);
            insforge.realtime.on('DELETE_maintenance', callbacks.maintenance);
        }
        if (callbacks.expense) {
            const ch = `expenses:${uid}`;
            await insforge.realtime.subscribe(ch);
            channels.push(ch);
            insforge.realtime.on('INSERT_expense', callbacks.expense);
            insforge.realtime.on('UPDATE_expense', callbacks.expense);
            insforge.realtime.on('DELETE_expense', callbacks.expense);
        }
        channelsRef.current = channels;
    }, []);

    useEffect(() => {
        if (!isSignedIn || !userId) return;
        connect(userId);
        return () => {
            channelsRef.current.forEach(ch => insforge.realtime.unsubscribe(ch));
            insforge.realtime.disconnect();
            connectedRef.current = false;
        };
    }, [isSignedIn, userId]);
}
