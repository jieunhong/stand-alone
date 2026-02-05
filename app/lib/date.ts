
/**
 * Returns a date string in format YYYY-MM-DD based on the local timezone.
 * Unlike date.toISOString(), this preserves the local date even if UTC date is different.
 */
export function getLocalISODate(date: Date = new Date()): string {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
}
