// Rounds down so "245K+" never overstates: 245,900 -> "245K+", 1,280,000 -> "1.2M+"
export function formatStat(n: number) {
  if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`;
  return String(n);
}
