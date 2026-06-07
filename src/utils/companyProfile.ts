/** Display labels shown in company profile forms */
export const COMPANY_SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
] as const;

/** Map UI label → API / MongoDB enum value */
export function mapCompanySizeToApi(size: string): string {
  const sizeMap: Record<string, string> = {
    "1-10 employees": "1-10",
    "11-50 employees": "11-50",
    "51-200 employees": "51-200",
    "201-500 employees": "201-500",
    "501-1000 employees": "500+",
    "1000+ employees": "500+",
    "1-10": "1-10",
    "11-50": "11-50",
    "51-200": "51-200",
    "201-500": "201-500",
    "501-1000": "500+",
    "1000+": "500+",
    "500+": "500+",
  };
  return sizeMap[size] || size.replace(/\s*employees\s*$/i, "").trim();
}

/** Map API value → display label for forms */
export function mapCompanySizeToDisplay(size: string): string {
  const displayMap: Record<string, string> = {
    "1-10": "1-10 employees",
    "11-50": "11-50 employees",
    "51-200": "51-200 employees",
    "201-500": "201-500 employees",
    "501-1000": "501-1000 employees",
    "500+": "1000+ employees",
    "1000+": "1000+ employees",
  };
  return displayMap[size] || size;
}

export function normalizeWebsiteUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
