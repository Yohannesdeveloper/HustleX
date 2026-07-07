import { COUNTRIES } from "../constants/countries";

/** Build stored location string: "City, Country" */
export function formatLocation(city: string, country: string): string {
  const c = city.trim();
  const co = country.trim();
  if (c && co) return `${c}, ${co}`;
  return c || co;
}

/** Parse "City, Country" back into parts; matches known country names when possible */
export function parseLocation(location: string): { city: string; country: string } {
  const trimmed = location.trim();
  if (!trimmed) return { city: "", country: "" };

  const commaIndex = trimmed.lastIndexOf(",");
  if (commaIndex === -1) {
    const match = COUNTRIES.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) return { city: "", country: match.name };
    return { city: trimmed, country: "" };
  }

  const city = trimmed.slice(0, commaIndex).trim();
  const countryPart = trimmed.slice(commaIndex + 1).trim();
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryPart.toLowerCase()
  );
  return { city, country: match ? match.name : countryPart };
}
