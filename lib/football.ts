// Shared UI helpers for the football prediction app (visual only).

const FLAGS: Record<string, string> = {
  Brazil: '🇧🇷',
  Argentina: '🇦🇷',
  France: '🇫🇷',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Spain: '🇪🇸',
  Germany: '🇩🇪',
  Portugal: '🇵🇹',
  Netherlands: '🇳🇱',
  Belgium: '🇧🇪',
  Croatia: '🇭🇷',
  Italy: '🇮🇹',
  Uruguay: '🇺🇾',
  Colombia: '🇨🇴',
  Switzerland: '🇨🇭',
  Denmark: '🇩🇰',
  Mexico: '🇲🇽',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  Japan: '🇯🇵',
  'South Korea': '🇰🇷',
  Korea: '🇰🇷',
  Australia: '🇦🇺',
  'Saudi Arabia': '🇸🇦',
  Iran: '🇮🇷',
  Qatar: '🇶🇦',
  Morocco: '🇲🇦',
  Senegal: '🇸🇳',
  Ghana: '🇬🇭',
  Nigeria: '🇳🇬',
  Cameroon: '🇨🇲',
  Tunisia: '🇹🇳',
  Algeria: '🇩🇿',
  Egypt: '🇪🇬',
  'Ivory Coast': '🇨🇮',
  Ecuador: '🇪🇨',
  Peru: '🇵🇪',
  Chile: '🇨🇱',
  Paraguay: '🇵🇾',
  Poland: '🇵🇱',
  Serbia: '🇷🇸',
  Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Ukraine: '🇺🇦',
  Sweden: '🇸🇪',
  Norway: '🇳🇴',
  Austria: '🇦🇹',
  'Czech Republic': '🇨🇿',
  Czechia: '🇨🇿',
  Turkey: '🇹🇷',
  Türkiye: '🇹🇷',
  Greece: '🇬🇷',
  Hungary: '🇭🇺',
  Russia: '🇷🇺',
  Romania: '🇷🇴',
  'Costa Rica': '🇨🇷',
  Panama: '🇵🇦',
  Honduras: '🇭🇳',
  Jamaica: '🇯🇲',
  Venezuela: '🇻🇪',
  Bolivia: '🇧🇴',
  'New Zealand': '🇳🇿',
  'South Africa': '🇿🇦',
  'Cape Verde': '🇨🇻',
  'Burkina Faso': '🇧🇫',
  Mali: '🇲🇱',
  'DR Congo': '🇨🇩',
  Uzbekistan: '🇺🇿',
  Iraq: '🇮🇶',
  UAE: '🇦🇪',
  Jordan: '🇯🇴',
  Oman: '🇴🇲',
  China: '🇨🇳',
  India: '🇮🇳',
  Indonesia: '🇮🇩',
  Thailand: '🇹🇭',
  Vietnam: '🇻🇳',
}

export function flag(team: string): string {
  if (!team) return '⚽'
  const key = team.trim()
  return FLAGS[key] ?? '🏳️'
}

export function teamWithFlag(team: string): string {
  return `${flag(team)} ${team}`
}

// Stage badge styling. Group stages are emerald, knockout stages are gold/amber,
// and the final gets a distinct fiery treatment.
export function stageBadgeClasses(stage: string): string {
  const s = (stage || '').toLowerCase()
  if (s.includes('final') && !s.includes('semi') && !s.includes('quarter')) {
    return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 shadow-amber-500/30'
  }
  if (s.includes('group')) {
    return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
  }
  // knockout (round of 16, quarter, semi, etc.)
  return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
}

export function isKnockout(stage: string): boolean {
  return !(stage || '').toLowerCase().includes('group')
}
