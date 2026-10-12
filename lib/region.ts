// Country-specific money, time zone and labels for a workspace.
export const REGIONS = {
  US: {
    label: "United States",
    currency: "USD",
    timezone: "America/New_York",
    postal: "ZIP",
    area: "sq ft",
    cityPlaceholder: "City / neighborhood",
    pricePlaceholder: "List price ($)",
    typePlaceholder: "Type (condo, co-op, townhouse)",
    phonePlaceholder: "(212) 555-0100",
    mls: true,
  },
  JP: {
    label: "Japan",
    currency: "JPY",
    timezone: "Asia/Tokyo",
    postal: "Postal code",
    area: "m²",
    cityPlaceholder: "City / ward",
    pricePlaceholder: "List price (¥)",
    typePlaceholder: "Type (mansion, house, land)",
    phonePlaceholder: "090-1234-5678",
    mls: false,
  },
} as const;

export type Country = keyof typeof REGIONS;

export function region(country: string | null | undefined) {
  return REGIONS[(country as Country) in REGIONS ? (country as Country) : "US"];
}
