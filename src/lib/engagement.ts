import { parseFrontmatter } from './obsidianParser';

export interface EngagementTip {
    id: string;
    type: string;
    content: string;
}

let cachedTips: EngagementTip[] | null = null;

export function loadEngagementTips(): EngagementTip[] {
    if (cachedTips) return cachedTips;

    const tips: EngagementTip[] = [];
    try {
        const mdFiles = import.meta.glob('../../MotoGestor-Brain/5. Engagement y Gamificación/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

        for (const [path, fileContent] of Object.entries(mdFiles)) {
            const { content } = parseFrontmatter(fileContent as string);

            // Extract tips formatted as blockquotes starting with bold IDs like:
            // > **TIP_OFFROAD_01:** "Texto"
            const lines = content.split('\n');
            let currentTipType = '';
            let currentTipContent = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Match "> **TIP_NAME:**"
                const tipMatch = line.match(/^>\s*\*\*([A-Z0-9_]+):\*\*(.*)$/);
                if (tipMatch) {
                    // Push previous tip if exists
                    if (currentTipType && currentTipContent) {
                        tips.push({
                            id: `${path}-${tips.length}`,
                            type: currentTipType,
                            content: currentTipContent.trim()
                        });
                    }
                    currentTipType = tipMatch[1];
                    currentTipContent = tipMatch[2].replace(/^["'](.*)["']$/, '$1').trim();
                } else if (line.startsWith('>') && currentTipType) {
                    // Continuation of a tip
                    currentTipContent += ' ' + line.substring(1).trim().replace(/^["'](.*)["']$/, '$1').trim();
                } else {
                    // End of tip block
                    if (currentTipType && currentTipContent) {
                        tips.push({
                            id: `${path}-${tips.length}`,
                            type: currentTipType,
                            content: currentTipContent.replace(/^["'](.*)["']$/, '$1').trim()
                        });
                        currentTipType = '';
                        currentTipContent = '';
                    }
                }
            }
            
            // Push last tip if file ended during one
            if (currentTipType && currentTipContent) {
                 tips.push({
                    id: `${path}-${tips.length}`,
                    type: currentTipType,
                    content: currentTipContent.replace(/^["'](.*)["']$/, '$1').trim()
                });
            }
        }
        cachedTips = tips;
        return tips;
    } catch (error) {
        console.error('Error loading engagement tips from Obsidian:', error);
        return [];
    }
}

export function getRandomTip(): EngagementTip | null {
    const tips = loadEngagementTips();
    if (tips.length === 0) return null;
    return tips[Math.floor(Math.random() * tips.length)];
}
