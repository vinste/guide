/**
 * Dictionnaire des régions françaises, allemandes, autrichiennes et suisses
 * Code ISO 3166-2
 */

export const REGIONS: Record<string, Record<string, string>> = {
  // France (codes numériques INSEE)
  FR: {
    '84': 'Auvergne-Rhône-Alpes',
    '27': 'Bourgogne-Franche-Comté',
    '53': 'Bretagne',
    '24': 'Centre-Val de Loire',
    '94': 'Corse',
    '44': 'Grand Est',
    '32': 'Hauts-de-France',
    '11': 'Île-de-France',
    '28': 'Normandie',
    '75': 'Nouvelle-Aquitaine',
    '76': 'Occitanie',
    '52': 'Pays de la Loire',
    '93': "Provence-Alpes-Côte d'Azur",
    // Anciens codes (au cas où)
    'ARA': 'Auvergne-Rhône-Alpes',
    'BFC': 'Bourgogne-Franche-Comté',
    'BRE': 'Bretagne',
    'CVL': 'Centre-Val de Loire',
    'COR': 'Corse',
    'GES': 'Grand Est',
    'HDF': 'Hauts-de-France',
    'IDF': 'Île-de-France',
    'NOR': 'Normandie',
    'NAQ': 'Nouvelle-Aquitaine',
    'OCC': 'Occitanie',
    'PDL': 'Pays de la Loire',
    'PAC': "Provence-Alpes-Côte d'Azur",
  },
  
  // Allemagne (Länder)
  DE: {
    'BW': 'Bade-Wurtemberg',
    'BY': 'Bavière',
    'BE': 'Berlin',
    'BB': 'Brandebourg',
    'HB': 'Brême',
    'HH': 'Hambourg',
    'HE': 'Hesse',
    'MV': 'Mecklembourg-Poméranie-Occidentale',
    'NI': 'Basse-Saxe',
    'NW': 'Rhénanie-du-Nord-Westphalie',
    'RP': 'Rhénanie-Palatinat',
    'SL': 'Sarre',
    'SN': 'Saxe',
    'ST': 'Saxe-Anhalt',
    'SH': 'Schleswig-Holstein',
    'TH': 'Thuringe',
  },
  
  // Autriche (Bundesländer)
  AT: {
    '1': 'Burgenland',
    '2': 'Carinthie',
    '3': 'Basse-Autriche',
    '4': 'Haute-Autriche',
    '5': 'Salzbourg',
    '6': 'Styrie',
    '7': 'Tyrol',
    '8': 'Vorarlberg',
    '9': 'Vienne',
    // Codes alternatifs
    'B': 'Burgenland',
    'K': 'Carinthie',
    'NO': 'Basse-Autriche',
    'OO': 'Haute-Autriche',
    'S': 'Salzbourg',
    'ST': 'Styrie',
    'T': 'Tyrol',
    'V': 'Vorarlberg',
    'W': 'Vienne',
  },
  
  // Suisse (Cantons)
  CH: {
    'AG': 'Argovie',
    'AI': 'Appenzell Rhodes-Intérieures',
    'AR': 'Appenzell Rhodes-Extérieures',
    'BE': 'Berne',
    'BL': 'Bâle-Campagne',
    'BS': 'Bâle-Ville',
    'FR': 'Fribourg',
    'GE': 'Genève',
    'GL': 'Glaris',
    'GR': 'Grisons',
    'JU': 'Jura',
    'LU': 'Lucerne',
    'NE': 'Neuchâtel',
    'NW': 'Nidwald',
    'OW': 'Obwald',
    'SG': 'Saint-Gall',
    'SH': 'Schaffhouse',
    'SO': 'Soleure',
    'SZ': 'Schwytz',
    'TG': 'Thurgovie',
    'TI': 'Tessin',
    'UR': 'Uri',
    'VD': 'Vaud',
    'VS': 'Valais',
    'ZG': 'Zoug',
    'ZH': 'Zürich',
  },
};

/**
 * Récupère le nom d'une région à partir de son code et du pays
 */
export function getRegionName(countryCode: string, regionCode: string): string {
  const country = REGIONS[countryCode.toUpperCase()];
  if (!country) {
    return regionCode; // Retourne le code si le pays n'est pas supporté
  }
  
  return country[regionCode] || regionCode; // Retourne le code si la région n'est pas trouvée
}

/**
 * Vérifie si un pays a des régions définies
 */
export function hasRegionSupport(countryCode: string): boolean {
  return countryCode.toUpperCase() in REGIONS;
}

/**
 * Récupère toutes les régions d'un pays
 */
export function getCountryRegions(countryCode: string): Record<string, string> | null {
  return REGIONS[countryCode.toUpperCase()] || null;
}
