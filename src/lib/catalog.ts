import { parseFrontmatter, normalizeText } from './obsidianParser';

export interface CatalogEntry {
    id: string;
    brand: string;
    model: string;
    keywords: string[];
    content: string;
}

let cachedCatalog: CatalogEntry[] | null = null;

export function loadCatalogFromObsidian(): CatalogEntry[] {
    if (cachedCatalog) return cachedCatalog;

    const loaded: CatalogEntry[] = [];
    try {
        const mdFiles = import.meta.glob('../../MotoGestor-Brain/4. Catálogo de Motos (Contexto Específico)/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

        for (const [path, fileContent] of Object.entries(mdFiles)) {
            const fileName = path.split('/').pop() || 'unknown.md';
            const { data, content } = parseFrontmatter(fileContent);

            const keywords = Array.isArray(data.keywords) ? data.keywords : [];
            const id = data.id || fileName.replace('.md', '');

            loaded.push({
                id,
                brand: '', // We can infer from user garage instead
                model: '',
                keywords,
                content: content.trim()
            });
        }
        cachedCatalog = loaded;
        return loaded;
    } catch (error) {
        console.error('Error loading catalog from Obsidian:', error);
        return [];
    }
}

/**
 * Retrieves the specific markdown catalog entry for a given motorcycle.
 */
export function getMotorcycleContext(brand: string, model: string): string {
    const catalog = loadCatalogFromObsidian();
    if (catalog.length === 0) return '';

    const searchStr = normalizeText(`${brand} ${model}`);
    
    // Find the best matching catalog entry
    for (const entry of catalog) {
        // If the ID matches
        if (searchStr.includes(normalizeText(entry.id.replace(/-/g, ' ')))) {
            return entry.content;
        }
        
        // If keywords match
        for (const keyword of entry.keywords) {
            if (searchStr.includes(normalizeText(keyword))) {
                return entry.content;
            }
        }
    }
    
    return '';
}
