export function findBetween(input: string, start: string, end: string): Array<string> {
    const escapedStart = start.replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");
    const escapedEnd = end.replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");

    const regex = new RegExp(`${escapedStart}([\\s\\S]*?)(?=${escapedEnd}|$)`, "g");
    const matches: Array<string> = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
        matches.push(match[1]);
    }

    return matches;
}
