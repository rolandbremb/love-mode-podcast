// Rounds down so "245K+" never overstates: 245,900 -> "245K+", 1,480 -> "1.4K+", 1,280,000 -> "1.2M+"
export function formatStat(n: number) {
  if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M+`;
  if (n >= 10_000) return `${Math.floor(n / 1_000)}K+`;
  if (n >= 1_000) return `${Math.floor(n / 100) / 10}K+`;
  return String(n);
}

// Listening apps as saved in the Studio's site settings -> their display names
export function platformLabel(platform: string) {
  return ({ youtube: "YouTube", spotify: "Spotify", apple: "Apple Podcasts" } as Record<string, string>)[platform] ?? platform;
}
