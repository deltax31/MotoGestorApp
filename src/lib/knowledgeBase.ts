import { parseFrontmatter, normalizeText } from './obsidianParser';

export interface KnowledgeDocument {
    id: string;
    title: string;
    keywords: string[];
    content: string;
    type: 'rule' | 'mechanics';
}

let cachedKnowledgeBase: KnowledgeDocument[] | null = null;

export function loadKnowledgeBase(): KnowledgeDocument[] {
    if (cachedKnowledgeBase) return cachedKnowledgeBase;

    const loaded: KnowledgeDocument[] = [];
    try {
        const rulesFiles = import.meta.glob('../../MotoGestor-Brain/2. Reglas de Negocio y Normativas (Colombia)/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
        const dictFiles = import.meta.glob('../../MotoGestor-Brain/3. Diccionario Mecánico (Nodos Interconectados)/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

        const processFiles = (filesRecord: Record<string, string>, type: 'rule' | 'mechanics') => {
            for (const [path, fileContent] of Object.entries(filesRecord)) {
                const fileName = path.split('/').pop() || 'unknown.md';
                const { data, content } = parseFrontmatter(fileContent);

                const keywords = Array.isArray(data.keywords) ? data.keywords : [];
                
                const titleMatch = content.match(/^#\s+(.+)$/m);
                let title = titleMatch ? titleMatch[1].replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim() : (data.id || fileName.replace('.md', ''));

                loaded.push({
                    id: data.id || fileName.replace('.md', ''),
                    title,
                    keywords,
                    content: content.trim(),
                    type
                });
            }
        };

        processFiles(rulesFiles, 'rule');
        processFiles(dictFiles, 'mechanics');

        cachedKnowledgeBase = loaded;
        return loaded;
    } catch (error) {
        console.error('Error loading knowledge base from Obsidian:', error);
        return [];
    }
}

/**
 * Very basic Mini-RAG. Matches the prompt string against documents keywords.
 * Returns up to maxResults raw markdown documents.
 */
export function queryKnowledgeBase(message: string, maxResults = 2): KnowledgeDocument[] {
    const NORMALIZED_MESSAGE = normalizeText(message);
    const words = NORMALIZED_MESSAGE.split(/\s+/);
    
    const kb = loadKnowledgeBase();
    const scored: { doc: KnowledgeDocument; score: number }[] = [];

    for (const doc of kb) {
        let score = 0;

        // Title match bump
        if (NORMALIZED_MESSAGE.includes(normalizeText(doc.title))) {
            score += 5;
        }

        for (const keyword of doc.keywords) {
            const normalizedKeyword = normalizeText(keyword);

            if (normalizedKeyword.includes(' ')) {
                if (NORMALIZED_MESSAGE.includes(normalizedKeyword)) {
                    score += 4; // Higher weight for exact phrase match on dictionary/rules
                }
            } else {
                if (words.includes(normalizedKeyword)) {
                    score += 2;
                } else if (NORMALIZED_MESSAGE.includes(normalizedKeyword)) {
                    score += 1;
                }
            }
        }

        if (score > 1) { // Require at least a decent threshold so we don't return random rules
            scored.push({ doc, score });
        }
    }

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(s => s.doc);
}

export function buildKnowledgeContext(docs: KnowledgeDocument[]): string {
    if (docs.length === 0) return '';
    const docsBlocks = docs.map(d => `\n### Referencia Fáctica (${d.type}): ${d.title}\n${d.content}`).join('\n');
    return `\n\nBASE DE CONOCIMIENTO EXTERNA (Extraído de manuales y leyes, usa esto sin dudar):${docsBlocks}`;
}
