import { useEffect, useRef } from 'react';
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
    const cbRef = useRef(callbacks);
    cbRef.current = callbacks;

    useEffect(() => {
        if (!isSignedIn || !userId) return;
        if (connectedRef.current) return;

        const setup = async () => {
            await insforge.realtime.connect();
            connectedRef.current = true;

            const channels: string[] = [];
            if (cbRef.current.motorcycle) {
                const ch = `motorcycles:${userId}`;
                await insforge.realtime.subscribe(ch);
                channels.push(ch);
                insforge.realtime.on('INSERT_motorcycle', () => cbRef.current.motorcycle?.());
                insforge.realtime.on('UPDATE_motorcycle', () => cbRef.current.motorcycle?.());
                insforge.realtime.on('DELETE_motorcycle', () => cbRef.current.motorcycle?.());
            }
            if (cbRef.current.maintenance) {
                const ch = `maintenance:${userId}`;
                await insforge.realtime.subscribe(ch);
                channels.push(ch);
                insforge.realtime.on('INSERT_maintenance', () => cbRef.current.maintenance?.());
                insforge.realtime.on('UPDATE_maintenance', () => cbRef.current.maintenance?.());
                insforge.realtime.on('DELETE_maintenance', () => cbRef.current.maintenance?.());
            }
            if (cbRef.current.expense) {
                const ch = `expenses:${userId}`;
                await insforge.realtime.subscribe(ch);
                channels.push(ch);
                insforge.realtime.on('INSERT_expense', () => cbRef.current.expense?.());
                insforge.realtime.on('UPDATE_expense', () => cbRef.current.expense?.());
                insforge.realtime.on('DELETE_expense', () => cbRef.current.expense?.());
            }
            channelsRef.current = channels;
        };
        setup();

        return () => {
            channelsRef.current.forEach(ch => insforge.realtime.unsubscribe(ch));
            insforge.realtime.disconnect();
            connectedRef.current = false;
        };
    }, [isSignedIn, userId]);
}
