import { findBetween } from "./findBetween";

export const getCookieHeaders = (token: string): Record<string, string> => ({
    Cookie: `PHPSESSID=${token}`
});

export const safeParseFloat = (str: string, defaultValue = 0): number => {
    const parsed = parseFloat(str.replace(",", "."));
    return isNaN(parsed) ? defaultValue : parsed;
};

export const extractData = (data: string, start: string, end: string): string => findBetween(data, start, end)[0] || "";

export const parseDate = (dateStr: string): Date => {
    const [day, month, year, hours, minutes] = dateStr.split(/[\s/:]/).map(Number);
    return new Date(year, month - 1, day, hours, minutes);
};
