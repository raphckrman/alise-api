export function findBetween(input: string, start: string, end: string): Array<string> {
    const regex = new RegExp(`${start}(.*?)${end}`, "g");
    const matches: Array<string> = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
        matches.push(match[1]);
    }

    return matches;
}
