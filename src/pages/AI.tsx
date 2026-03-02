import { useEffect, useRef, useState } from 'react';
import { useUser } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { ChatMessage, Motorcycle } from '../types';
import { AppLayout } from '../components/AppLayout';
import { useToast } from '../context/ToastContext';

const SYSTEM_PROMPT = `Eres MotoBot, un experto mecánico colombiano especializado en motocicletas. 
Tu misión es ayudar a los usuarios colombianos a mantener sus motos en óptimas condiciones.
- Habla siempre en español colombiano, de forma amigable y profesional
- Conoces bien las marcas populares en Colombia: Honda, Yamaha, AKT, Auteco, Suzuki, Kawasaki, etc.
- Das consejos prácticos de mantenimiento preventivo, diagnóstico de fallas y costos aproximados en COP
- Cuando mencionas un servicio, incluye el intervalo recomendado en km y costo estimado en pesos colombianos
- Si el usuario menciona síntomas, haz preguntas de diagnóstico para identificar la causa
- Siempre prioriza la seguridad vial`;

export function AIPage() {
    const { user } = useUser();
    const { addToast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [activeTab, setActiveTab] = useState<'chat' | 'scan'>('chat');
    const [scanImage, setScanImage] = useState<File | null>(null);
    const [scanPreview, setScanPreview] = useState('');
    const [scanResult, setScanResult] = useState('');
    const [scanning, setScanning] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatImageRef = useRef<HTMLInputElement>(null);
    const [chatImage, setChatImage] = useState<string>('');

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const [{ data: msgs }, { data: m }] = await Promise.all([
                insforge.database.from('chat_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true }).limit(100),
                insforge.database.from('motorcycles').select('*').eq('user_id', user.id),
            ]);
            setMessages(msgs || []);
            setMotos(m || []);
            setLoadingHistory(false);
        };
        load();
    }, [user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const contextInfo = motos.length > 0
        ? `\n\nEl usuario tiene las siguientes motos registradas: ${motos.map(m => `${m.brand} ${m.model} ${m.year} (${m.plate}, ${m.current_km} km)`).join(', ')}.`
        : '';

    const sendMessage = async () => {
        if (!input.trim() || streaming || !user) return;
        const userMsg = input.trim();
        setInput('');

        const userRecord: ChatMessage = {
            id: Date.now().toString(), user_id: user.id, role: 'user',
            content: userMsg, motorcycle_id: null, created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userRecord]);

        // Save to DB
        await insforge.database.from('chat_messages').insert([{ user_id: user.id, role: 'user', content: userMsg }]);

        setStreaming(true);
        const assistantId = (Date.now() + 1).toString();
        const placeholder: ChatMessage = {
            id: assistantId, user_id: user.id, role: 'assistant',
            content: '', motorcycle_id: null, created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, placeholder]);

        try {
            const allMessages = [...messages.slice(-20), userRecord];
            const stream = await insforge.ai.chat.completions.create({
                model: 'anthropic/claude-sonnet-4.5',
                messages: [
                    { role: 'user', content: SYSTEM_PROMPT + contextInfo },
                    ...allMessages.slice(0, -1).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
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
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m));
                }
            }

            await insforge.database.from('chat_messages').insert([{ user_id: user.id, role: 'assistant', content: full }]);
        } catch {
            addToast('error', 'Error al conectar con el asistente IA');
            setMessages(prev => prev.filter(m => m.id !== assistantId));
        }
        setStreaming(false);
        setChatImage('');
        if (chatImageRef.current) chatImageRef.current.value = '';
    };

    const handleImageScan = async () => {
        if (!scanImage || !user) return;
        setScanning(true); setScanResult('');
        try {
            const reader = new FileReader();
            const base64 = await new Promise<string>(res => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(scanImage); });
            const response = await insforge.ai.chat.completions.create({
                model: 'anthropic/claude-sonnet-4.5',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analiza esta imagen de motocicleta. Identifica: 1) Marca y modelo (en Colombia es posible que sea una moto popular como Honda CB, Yamaha FZ, AKT NKD, Bajaj Pulsar, etc.) 2) Año aproximado si es posible deducirlo, 3) Características y cilindraje estimado. Responde de forma organizada y concisa en español.' },
                        { type: 'image_url', image_url: { url: base64 } }
                    ]
                }],
                maxTokens: 500,
            });
            setScanResult(response.choices[0].message.content);
        } catch {
            addToast('error', 'Error al analizar la imagen');
        }
        setScanning(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScanImage(file); setScanResult('');
        const url = URL.createObjectURL(file);
        setScanPreview(url);
    };

    const clearChat = async () => {
        if (!user) return;
        await insforge.database.from('chat_messages').delete().eq('user_id', user.id);
        setMessages([]);
        addToast('info', 'Historial borrado');
    };

    const quickPrompts = [
        '¿Cada cuánto debo cambiar el aceite?',
        'Mi moto hace ruido al frenar, ¿qué puede ser?',
        '¿Cómo saber si la batería está fallando?',
        'Consejos para ahorrar combustible',
    ];

    return (
        <AppLayout>
            <div className="animate-fadeIn" style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
                <div className="page-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">🤖 Asistente IA</h1>
                        <p className="page-subtitle">Mecánico virtual + identificación de motos por imagen</p>
                    </div>
                    {activeTab === 'chat' && messages.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={clearChat}>🗑️ Limpiar historial</button>
                    )}
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>
                    <button className={`tab${activeTab === 'chat' ? ' active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat mecánico</button>
                    <button className={`tab${activeTab === 'scan' ? ' active' : ''}`} onClick={() => setActiveTab('scan')}>📷 Escanear moto</button>
                </div>

                {activeTab === 'chat' ? (
                    <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Messages */}
                        <div className="chat-messages" style={{ flex: 1 }}>
                            {loadingHistory && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '20px' }}>Cargando historial...</div>
                            )}
                            {!loadingHistory && messages.length === 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                                    <div style={{ fontSize: '56px' }}>🤖</div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>¡Hola! Soy MotoBot</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px' }}>
                                            Tu mecánico virtual colombiano. Pregúntame sobre mantenimiento, fallas o consejos para tu moto.
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '500px' }}>
                                        {quickPrompts.map(p => (
                                            <button key={p} className="btn btn-ghost btn-sm" onClick={() => { setInput(p); }} style={{ fontSize: '13px' }}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div className={`chat-bubble ${msg.role}`}>
                                        {msg.role === 'assistant' && (
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>🤖 MotoBot</div>
                                        )}
                                        {msg.content ? (
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
                                                {[0, 0.2, 0.4].map(d => (
                                                    <div key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s ease-in-out infinite', animationDelay: `${d}s` }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-input-area">
                            {chatImage && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px' }}>
                                    <img src={chatImage} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>Imagen adjunta</span>
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setChatImage(''); if (chatImageRef.current) chatImageRef.current.value = ''; }} style={{ padding: '4px 8px' }}>✕</button>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <input ref={chatImageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () => setChatImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                }} />
                                <button className="btn btn-ghost" onClick={() => chatImageRef.current?.click()} disabled={streaming}
                                    style={{ padding: '10px 12px', alignSelf: 'flex-end', minWidth: '44px' }} title="Adjuntar imagen">
                                    📷
                                </button>
                                <textarea
                                    className="textarea"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    placeholder={chatImage ? 'Describe lo que ves en la imagen...' : 'Escribe tu consulta mecánica... (Enter para enviar)'}
                                    style={{ flex: 1, minHeight: '44px', maxHeight: '120px', resize: 'none', padding: '10px 14px' }}
                                    disabled={streaming}
                                />
                                <button className="btn btn-primary" onClick={sendMessage} disabled={streaming || (!input.trim() && !chatImage)} style={{ alignSelf: 'flex-end', minWidth: '52px' }}>
                                    {streaming ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : '➤'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>📷 Identificar moto por imagen</div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Toma una foto de tu moto y nuestra IA identificará la marca, modelo y características.
                            </p>
                            <div className={`upload-zone${scanPreview ? ' drag-over' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setScanImage(f); setScanPreview(URL.createObjectURL(f)); setScanResult(''); } }}>
                                {scanPreview ? (
                                    <img src={scanPreview} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '10px', objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
                                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Subir foto de la moto</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Haz clic o arrastra una imagen aquí</div>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>
                        </div>

                        {scanPreview && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" onClick={handleImageScan} disabled={scanning} style={{ flex: 1 }}>
                                    {scanning ? <><div className="spinner" />&nbsp;Analizando...</> : '🔍 Identificar moto'}
                                </button>
                                <button className="btn btn-ghost" onClick={() => { setScanImage(null); setScanPreview(''); setScanResult(''); }}>✕ Limpiar</button>
                            </div>
                        )}

                        {scanResult && (
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', borderRadius: '14px', padding: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="realtime-dot" style={{ background: 'var(--accent)' }} />
                                    Resultado del análisis IA
                                </div>
                                <div style={{ fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{scanResult}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
