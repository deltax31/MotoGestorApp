import { useState, useRef } from 'react';
import { useUser } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { processManualText } from '../lib/rag';
import { useToast } from '../context/ToastContext';
import { Manual } from '../types';

interface Props {
    motorcycleId: string;
    existingManual: Manual | null;
    onComplete: () => void;
}

export function ManualUpload({ motorcycleId, existingManual, onComplete }: Props) {
    const { user } = useUser();
    const { addToast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [status, setStatus] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            addToast('error', 'Solo se aceptan archivos PDF');
            return;
        }

        setProcessing(true);

        try {
            // Step 1: Upload PDF to storage
            setStatus('Subiendo PDF...');
            const { data: uploadData, error: uploadError } = await insforge.storage.from('manuals').uploadAuto(file);
            if (uploadError || !uploadData) throw new Error('Error al subir archivo');

            // Step 2: Extract text from PDF using AI
            setStatus('Extrayendo texto del manual...');
            const reader = new FileReader();
            const base64 = await new Promise<string>(res => {
                reader.onload = () => res(reader.result as string);
                reader.readAsDataURL(file);
            });

            const extraction = await insforge.ai.chat.completions.create({
                model: 'anthropic/claude-sonnet-4.5',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Eres un extractor de texto. Tu ÚNICA tarea es transcribir TODO el contenido de este PDF de manual de motocicleta. Devuelve el texto completo organizado por secciones. Incluye TODAS las tablas de mantenimiento, especificaciones técnicas, intervalos de km, torques de apriete, niveles de fluidos, y cualquier dato numérico. NO resumas, NO omitas secciones, NO agregues comentarios propios. Solo devuelve el texto del documento.' },
                        { type: 'file', file: { filename: file.name, file_data: base64 } },
                    ],
                }],
                fileParser: { enabled: true, pdf: { engine: 'mistral-ocr' } },
                maxTokens: 16000,
            });

            const fullText = extraction.choices[0].message.content;
            // Validate extraction — detect AI refusal
            const isRefusal = fullText && (
                fullText.toLowerCase().includes('lo siento, pero no puedo') ||
                fullText.toLowerCase().includes('no puedo extraer') ||
                fullText.toLowerCase().includes('no puedo reproducir')
            );
            if (!fullText || fullText.length < 200 || isRefusal) {
                throw new Error('La IA no pudo extraer el texto del PDF. Intenta con otro archivo o formato.');
            }

            // Step 3: If there's an existing manual, delete it first
            if (existingManual) {
                await insforge.database.from('manuals').delete().eq('id', existingManual.id);
            }

            // Step 4: Create manual record
            setStatus('Creando registro...');
            const { data: manual, error: manualError } = await insforge.database.from('manuals').insert([{
                motorcycle_id: motorcycleId,
                user_id: user.id,
                filename: file.name,
                storage_key: uploadData.key || uploadData.url,
            }]).select().single();

            if (manualError || !manual) throw new Error('Error al crear registro del manual');

            // Step 5: Process chunks and embeddings
            setStatus('Procesando con IA...');
            const totalChunks = await processManualText(
                manual.id,
                motorcycleId,
                user.id,
                fullText,
                (current, total) => {
                    setProgress({ current, total });
                    setStatus(`Procesando fragmento ${current}/${total}...`);
                },
            );

            addToast('success', `Manual procesado: ${totalChunks} fragmentos indexados 📖`);
            onComplete();
        } catch (err) {
            addToast('error', err instanceof Error ? err.message : 'Error al procesar el manual');
        }

        setProcessing(false);
        setStatus('');
        setProgress({ current: 0, total: 0 });
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div style={{
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px dashed var(--border)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>📖 Manual del vehículo</span>
                {existingManual && (
                    <span className="badge" style={{ background: 'var(--success-alpha)', color: 'var(--success)', border: '1px solid var(--success)', fontSize: '11px' }}>
                        ✅ {existingManual.total_chunks} fragmentos indexados
                    </span>
                )}
            </div>

            {existingManual && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📄 {existingManual.filename}
                </div>
            )}

            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUpload} />

            {processing ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div className="spinner spinner-accent" style={{ width: '24px', height: '24px', borderWidth: '3px', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>{status}</div>
                    {progress.total > 0 && (
                        <div style={{ marginTop: '8px' }}>
                            <div style={{
                                width: '100%', height: '6px', background: 'var(--bg-primary)',
                                borderRadius: '3px', overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${(progress.current / progress.total) * 100}%`,
                                    height: '100%', background: 'var(--accent)',
                                    borderRadius: '3px', transition: 'width 0.3s',
                                }} />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {progress.current}/{progress.total} fragmentos
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} style={{ width: '100%' }}>
                    {existingManual ? '🔄 Reemplazar manual (PDF)' : '📤 Subir manual del vehículo (PDF)'}
                </button>
            )}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
                La IA analizará el manual para darte insights y guías personalizadas
            </div>
        </div>
    );
}
