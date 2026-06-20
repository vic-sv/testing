// Shared UI helpers for the football prediction app (visual only).
import React from 'react'

// English country name (as stored in DB) -> ISO 3166-1 alpha-2 lowercase code
// (with flagcdn subdivision codes for the home nations).
const FLAG_CODES: Record<string, string> = {
  Brazil: 'br',
  Argentina: 'ar',
  France: 'fr',
  England: 'gb-eng',
  Spain: 'es',
  Germany: 'de',
  Portugal: 'pt',
  Netherlands: 'nl',
  Belgium: 'be',
  Croatia: 'hr',
  Italy: 'it',
  Uruguay: 'uy',
  Colombia: 'co',
  Switzerland: 'ch',
  Denmark: 'dk',
  Mexico: 'mx',
  USA: 'us',
  'United States': 'us',
  Canada: 'ca',
  Japan: 'jp',
  'South Korea': 'kr',
  Korea: 'kr',
  Australia: 'au',
  'Saudi Arabia': 'sa',
  Iran: 'ir',
  Qatar: 'qa',
  Morocco: 'ma',
  Senegal: 'sn',
  Ghana: 'gh',
  Nigeria: 'ng',
  Cameroon: 'cm',
  Tunisia: 'tn',
  Algeria: 'dz',
  Egypt: 'eg',
  'Ivory Coast': 'ci',
  Ecuador: 'ec',
  Peru: 'pe',
  Chile: 'cl',
  Paraguay: 'py',
  Poland: 'pl',
  Serbia: 'rs',
  Wales: 'gb-wls',
  Scotland: 'gb-sct',
  Ukraine: 'ua',
  Sweden: 'se',
  Norway: 'no',
  Austria: 'at',
  'Czech Republic': 'cz',
  Czechia: 'cz',
  Turkey: 'tr',
  Türkiye: 'tr',
  Greece: 'gr',
  Hungary: 'hu',
  Russia: 'ru',
  Romania: 'ro',
  'Costa Rica': 'cr',
  Panama: 'pa',
  Honduras: 'hn',
  Jamaica: 'jm',
  Venezuela: 've',
  Bolivia: 'bo',
  'New Zealand': 'nz',
  'South Africa': 'za',
  'Cape Verde': 'cv',
  'Burkina Faso': 'bf',
  Mali: 'ml',
  'DR Congo': 'cd',
  Uzbekistan: 'uz',
  Iraq: 'iq',
  UAE: 'ae',
  Jordan: 'jo',
  Oman: 'om',
  China: 'cn',
  India: 'in',
  Indonesia: 'id',
  Thailand: 'th',
  Vietnam: 'vn',
  'Curaçao': 'cw',
  Haiti: 'ht',
  TBD: '',
}

// English country name -> Ukrainian name.
const TEAM_NAMES_UK: Record<string, string> = {
  Brazil: 'Бразилія',
  Argentina: 'Аргентина',
  France: 'Франція',
  England: 'Англія',
  Spain: 'Іспанія',
  Germany: 'Німеччина',
  Portugal: 'Португалія',
  Netherlands: 'Нідерланди',
  Belgium: 'Бельгія',
  Croatia: 'Хорватія',
  Italy: 'Італія',
  Uruguay: 'Уругвай',
  Colombia: 'Колумбія',
  Switzerland: 'Швейцарія',
  Denmark: 'Данія',
  Mexico: 'Мексика',
  USA: 'США',
  'United States': 'США',
  Canada: 'Канада',
  Japan: 'Японія',
  'South Korea': 'Південна Корея',
  Korea: 'Корея',
  Australia: 'Австралія',
  'Saudi Arabia': 'Саудівська Аравія',
  Iran: 'Іран',
  Qatar: 'Катар',
  Morocco: 'Марокко',
  Senegal: 'Сенегал',
  Ghana: 'Гана',
  Nigeria: 'Нігерія',
  Cameroon: 'Камерун',
  Tunisia: 'Туніс',
  Algeria: 'Алжир',
  Egypt: 'Єгипет',
  'Ivory Coast': "Кот-д'Івуар",
  Ecuador: 'Еквадор',
  Peru: 'Перу',
  Chile: 'Чилі',
  Paraguay: 'Парагвай',
  Poland: 'Польща',
  Serbia: 'Сербія',
  Wales: 'Уельс',
  Scotland: 'Шотландія',
  Ukraine: 'Україна',
  Sweden: 'Швеція',
  Norway: 'Норвегія',
  Austria: 'Австрія',
  'Czech Republic': 'Чехія',
  Czechia: 'Чехія',
  Turkey: 'Туреччина',
  Türkiye: 'Туреччина',
  Greece: 'Греція',
  Hungary: 'Угорщина',
  Russia: 'Росія',
  Romania: 'Румунія',
  'Costa Rica': 'Коста-Рика',
  Panama: 'Панама',
  Honduras: 'Гондурас',
  Jamaica: 'Ямайка',
  Venezuela: 'Венесуела',
  Bolivia: 'Болівія',
  'New Zealand': 'Нова Зеландія',
  'South Africa': 'Південна Африка',
  'Cape Verde': 'Кабо-Верде',
  'Burkina Faso': 'Буркіна-Фасо',
  Mali: 'Малі',
  'DR Congo': 'ДР Конго',
  Uzbekistan: 'Узбекистан',
  Iraq: 'Ірак',
  UAE: 'ОАЕ',
  Jordan: 'Йорданія',
  Oman: 'Оман',
  China: 'Китай',
  India: 'Індія',
  Indonesia: 'Індонезія',
  Thailand: 'Таїланд',
  Vietnam: "В'єтнам",
  'Curaçao': 'Кюрасао',
  Haiti: 'Гаїті',
  TBD: 'TBD',
}

export function flagCode(team: string): string | null {
  if (!team) return null
  return FLAG_CODES[team.trim()] ?? null
}

// Ukrainian team name, falling back to the original English name.
export function teamName(team: string): string {
  if (!team) return ''
  return TEAM_NAMES_UK[team.trim()] ?? team
}

// React image-based flag. Renders an <img> from flagcdn, with a neutral
// fallback (gray box with a soccer ball) for unknown countries.
export function Flag({
  country,
  className = '',
}: {
  country: string
  className?: string
}) {
  const code = flagCode(country)
  const base = 'inline-block h-5 w-auto rounded-sm align-middle ring-1 ring-white/10'
  if (!code) {
    return React.createElement(
      'span',
      {
        className: `${base} inline-flex items-center justify-center bg-slate-700 px-1 text-xs ${className}`,
        title: country,
        'aria-label': country,
      },
      '⚽'
    )
  }
  return React.createElement('img', {
    src: `https://flagcdn.com/h40/${code}.png`,
    srcSet: `https://flagcdn.com/h80/${code}.png 2x`,
    width: undefined,
    height: 20,
    alt: country,
    title: country,
    loading: 'lazy',
    className: `${base} object-cover ${className}`,
  })
}

// English stage -> Ukrainian stage name.
export function stageName(stage: string): string {
  const s = (stage || '').trim()
  if (!s) return ''
  const lower = s.toLowerCase()
  const map: Record<string, string> = {
    'round of 16': '1/8 фіналу',
    'round of 32': '1/16 фіналу',
    'quarter-final': '1/4 фіналу',
    'quarter final': '1/4 фіналу',
    quarterfinal: '1/4 фіналу',
    'semi-final': '1/2 фіналу',
    'semi final': '1/2 фіналу',
    semifinal: '1/2 фіналу',
    'third place': 'Матч за 3-тє місце',
    final: 'Фінал',
  }
  if (map[lower]) return map[lower]
  // "Group A" -> "Група A"
  const groupMatch = s.match(/^group\s+(.+)$/i)
  if (groupMatch) return `Група ${groupMatch[1].toUpperCase()}`
  return s
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
