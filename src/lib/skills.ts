/**
 * MotoGestor AI Skills Router
 * 
 * Detects user intent from their message and returns relevant skill
 * instructions to inject into MotoBot's system prompt.
 * Now dynamically loaded from the Obsidian Vault!
 */
import { parseFrontmatter, normalizeText as normalize } from './obsidianParser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SkillDefinition {
    id: string;
    name: string;
    keywords: string[];
    content: string;
}

// Memory cache for skills (loaded once per server instance)
let cachedSkills: SkillDefinition[] | null = null;


// ---------------------------------------------------------------------------
// Skills Loader — Loads from Obsidian Vault via Vite
// ---------------------------------------------------------------------------
export function loadSkillsFromObsidian(): SkillDefinition[] {
    if (cachedSkills) return cachedSkills;

    const loaded: SkillDefinition[] = [];

    try {
        // Use Vite's import.meta.glob to load all MD files from the specific folder.
        // eager: true forces Vite to load them immediately instead of via Promise
        // query: '?raw' loads the file contents as raw string
        const mdFiles = import.meta.glob('../../MotoGestor-Brain/1. Skills (Agentes de IA)/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

        for (const [path, fileContent] of Object.entries(mdFiles)) {
            const fileName = path.split('/').pop() || 'unknown.md';
            const { data, content } = parseFrontmatter(fileContent as string);

            // Extract keywords from YAML, fallback to empty array
            const keywords = Array.isArray(data.keywords) ? data.keywords : [];
            
            // Name can be extracted from title (# 🔮 Skill: Nombre) or id
            const nameMatch = content.match(/^#\s+(.+)$/m);
            let name = nameMatch ? nameMatch[1].replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim() : (data.id || fileName.replace('.md', ''));
            
            // Cleanup the name if it still has "Skill: "
            name = name.replace(/^Skill:\s+/i, '').trim();

            loaded.push({
                id: data.id || fileName.replace('.md', ''),
                name: name,
                keywords: keywords,
                content: content.trim()
            });
        }

        cachedSkills = loaded;
        return loaded;
    } catch (error) {
        console.error('Error loading skills from Obsidian:', error);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Skill Matcher — finds relevant skills based on user message
// ---------------------------------------------------------------------------
export function matchSkills(message: string, maxResults = 3): SkillDefinition[] {
    const NORMALIZED_MESSAGE = normalize(message);
    const words = NORMALIZED_MESSAGE.split(/\s+/);
    
    // Load skills dynamically!
    const SKILLS_REGISTRY = loadSkillsFromObsidian();

    const scored: { skill: SkillDefinition; score: number }[] = [];

    for (const skill of SKILLS_REGISTRY) {
        let score = 0;

        // Give basic score if the message contains the skill name
        if (NORMALIZED_MESSAGE.includes(normalize(skill.name))) {
            score += 5;
        }

        for (const keyword of skill.keywords) {
            const normalizedKeyword = normalize(keyword);

            // Multi-word keyword (phrase match = higher score)
            if (normalizedKeyword.includes(' ')) {
                if (NORMALIZED_MESSAGE.includes(normalizedKeyword)) {
                    score += 3;
                }
            } else {
                // Single word match
                if (words.includes(normalizedKeyword)) {
                    score += 2;
                } else if (NORMALIZED_MESSAGE.includes(normalizedKeyword)) {
                    // Partial match (substring)
                    score += 1;
                }
            }
        }

        if (score > 0) {
            scored.push({ skill, score });
        }
    }

    // Sort by score descending, return top N
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(s => s.skill);
}

// ---------------------------------------------------------------------------
// Context Builder — formats matched skills for the system prompt
// ---------------------------------------------------------------------------
export function buildSkillContext(skills: SkillDefinition[]): string {
    if (skills.length === 0) return '';

    const skillBlocks = skills
        .map(s => `\n--- ${s.name} ---\n${s.content}`)
        .join('\n');

    return `\n\nINSTRUCCIONES ESPECIALIZADAS (usa este conocimiento para responder con mayor precisión):${skillBlocks}`;
}
