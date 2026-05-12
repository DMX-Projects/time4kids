/** Integer string with Indian-style grouping (e.g. 1,00,000). */
export function formatIndianInteger(n: number): string {
    return Math.round(n).toLocaleString("en-IN");
}
