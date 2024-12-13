export function findBetween(input: string, start: string, end: string): string {
    const regex = new RegExp(`${start}(.*?)${end}`, 'g');
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
        matches.push(match[1]);
    }

    return matches[0];
}
