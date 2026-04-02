// Shared simplistic YAML frontmatter parser for browser compatibility
export function parseFrontmatter(fileContent: string) {
    let content = fileContent;
    const data: Record<string, any> = {};

    if (fileContent.startsWith('---')) {
        const parts = fileContent.split('---');
        if (parts.length >= 3) {
            const yamlStr = parts[1];
            content = parts.slice(2).join('---').trim();

            yamlStr.split('\n').forEach(line => {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const [, key, val] = match;
                    if (val.startsWith('[')) {
                        data[key] = val
                            .replace(/^\[(.*)\]$/, '$1')
                            .split(',')
                            .map(s => s.trim().replace(/^['"]?(.*?)['"]?$/, '$1'));
                    } else {
                        data[key] = val.trim().replace(/^['"]?(.*?)['"]?$/, '$1');
                    }
                }
            });
        }
    }
    return { data, content };
}

// Global text normalizer
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ');
}
