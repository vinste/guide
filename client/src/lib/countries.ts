/**
 * Dictionnaire des noms de pays en français avec leurs drapeaux
 * Code ISO 3166-1 alpha-2
 */
export const COUNTRIES: Record<string, { name: string; flag: string }> = {
  FR: { name: 'France', flag: '🇫🇷' },
  US: { name: 'États-Unis', flag: '🇺🇸' },
  GB: { name: 'Royaume-Uni', flag: '🇬🇧' },
  DE: { name: 'Allemagne', flag: '🇩🇪' },
  ES: { name: 'Espagne', flag: '🇪🇸' },
  IT: { name: 'Italie', flag: '🇮🇹' },
  BE: { name: 'Belgique', flag: '🇧🇪' },
  CH: { name: 'Suisse', flag: '🇨🇭' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  NL: { name: 'Pays-Bas', flag: '🇳🇱' },
  PT: { name: 'Portugal', flag: '🇵🇹' },
  PL: { name: 'Pologne', flag: '🇵🇱' },
  SE: { name: 'Suède', flag: '🇸🇪' },
  NO: { name: 'Norvège', flag: '🇳🇴' },
  DK: { name: 'Danemark', flag: '🇩🇰' },
  FI: { name: 'Finlande', flag: '🇫🇮' },
  AT: { name: 'Autriche', flag: '🇦🇹' },
  IE: { name: 'Irlande', flag: '🇮🇪' },
  GR: { name: 'Grèce', flag: '🇬🇷' },
  CZ: { name: 'Tchéquie', flag: '🇨🇿' },
  RO: { name: 'Roumanie', flag: '🇷🇴' },
  HU: { name: 'Hongrie', flag: '🇭🇺' },
  BG: { name: 'Bulgarie', flag: '🇧🇬' },
  HR: { name: 'Croatie', flag: '🇭🇷' },
  SK: { name: 'Slovaquie', flag: '🇸🇰' },
  SI: { name: 'Slovénie', flag: '🇸🇮' },
  LU: { name: 'Luxembourg', flag: '🇱🇺' },
  EE: { name: 'Estonie', flag: '🇪🇪' },
  LV: { name: 'Lettonie', flag: '🇱🇻' },
  LT: { name: 'Lituanie', flag: '🇱🇹' },
  MT: { name: 'Malte', flag: '🇲🇹' },
  CY: { name: 'Chypre', flag: '🇨🇾' },
  JP: { name: 'Japon', flag: '🇯🇵' },
  CN: { name: 'Chine', flag: '🇨🇳' },
  KR: { name: 'Corée du Sud', flag: '🇰🇷' },
  IN: { name: 'Inde', flag: '🇮🇳' },
  AU: { name: 'Australie', flag: '🇦🇺' },
  NZ: { name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  BR: { name: 'Brésil', flag: '🇧🇷' },
  AR: { name: 'Argentine', flag: '🇦🇷' },
  MX: { name: 'Mexique', flag: '🇲🇽' },
  RU: { name: 'Russie', flag: '🇷🇺' },
  TR: { name: 'Turquie', flag: '🇹🇷' },
  ZA: { name: 'Afrique du Sud', flag: '🇿🇦' },
  EG: { name: 'Égypte', flag: '🇪🇬' },
  MA: { name: 'Maroc', flag: '🇲🇦' },
  TN: { name: 'Tunisie', flag: '🇹🇳' },
  DZ: { name: 'Algérie', flag: '🇩🇿' },
  SN: { name: 'Sénégal', flag: '🇸🇳' },
  CI: { name: "Côte d'Ivoire", flag: '🇨🇮' },
  IL: { name: 'Israël', flag: '🇮🇱' },
  SA: { name: 'Arabie Saoudite', flag: '🇸🇦' },
  AE: { name: 'Émirats Arabes Unis', flag: '🇦🇪' },
  SG: { name: 'Singapour', flag: '🇸🇬' },
  TH: { name: 'Thaïlande', flag: '🇹🇭' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  ID: { name: 'Indonésie', flag: '🇮🇩' },
  MY: { name: 'Malaisie', flag: '🇲🇾' },
  PH: { name: 'Philippines', flag: '🇵🇭' },
};

/**
 * Récupère le nom et le drapeau d'un pays à partir de son code ISO
 */
export function getCountryInfo(code: string): { name: string; flag: string } {
  return COUNTRIES[code.toUpperCase()] || { name: code, flag: '🌍' };
}

/**
 * Génère un emoji drapeau à partir d'un code pays ISO
 * Utilise les caractères Unicode Regional Indicator
 */
export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (COUNTRIES[code]) {
    return COUNTRIES[code].flag;
  }
  
  // Fallback: génération dynamique du drapeau
  const codePoints = code
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
