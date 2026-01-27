# Analytics Régionales - France, Allemagne, Autriche, Suisse

## 🎯 Vue d'ensemble

En plus de détecter le pays d'origine des visiteurs, le système analytics identifie maintenant la **région** pour les pays suivants :

- 🇫🇷 **France** : 13 régions (Auvergne-Rhône-Alpes, Bourgogne-Franche-Comté, etc.)
- 🇩🇪 **Allemagne** : 16 Länder (Bavière, Bade-Wurtemberg, etc.)
- 🇦🇹 **Autriche** : 9 Bundesländer (Vienne, Tyrol, Salzbourg, etc.)
- 🇨🇭 **Suisse** : 26 Cantons (Genève, Vaud, Zürich, etc.)

## ✨ Fonctionnalités

### Affichage dans le Dashboard

Une nouvelle section **"Répartition régionale"** affiche :

- 🏴 **Drapeau du pays**
- 🗺️ **Nom de la région** en français
- 🔢 **Code région** ISO
- 👥 **Nombre de visiteurs** de cette région
- 📄 **Nombre de pages vues**
- 📊 **Barre de progression** visuelle

### Exemple d'affichage

```
🗺️ Répartition régionale
France, Allemagne, Autriche et Suisse

🇫🇷 Auvergne-Rhône-Alpes (84)        45 visiteurs    120 vues
   France
   ████████████████████

🇩🇪 Bavière (BY)                     23 visiteurs     67 vues
   Allemagne
   ██████████

🇨🇭 Genève (GE)                     18 visiteurs     42 vues
   Suisse
   ████████

🇦🇹 Vienne (W)                       12 visiteurs     35 vues
   Autriche
   █████
```

## 🛠️ Installation et Configuration

### 1. Mettre à Jour la Base de Données

**Sur Replit** :

```bash
# Shell Replit
npm run db:push
```

Ou manuellement :

```sql
ALTER TABLE analytics_pageviews 
ADD COLUMN IF NOT EXISTS region VARCHAR(10);
```

**Sur VPS** :

```bash
cd /var/www/fullstack-js-app
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart fullstack-js-app
```

Le script `deploy.sh` a été mis à jour pour ajouter automatiquement la colonne `region`.

### 2. Vérifier l'Installation

```bash
# Tester l'API
curl http://localhost:5000/api/analytics/stats?days=7

# Vous devriez voir une section "regions" dans la réponse
```

## 🐛 Dépannage

### Aucune région détectée

**Vérifier la base de données** :

```bash
npm run check-db
```

**Si la colonne `region` n'existe pas** :

```bash
npm run db:push
```

**Si les données existent mais ne s'affichent pas** :

1. Vérifier que les visiteurs viennent bien de FR, DE, AT ou CH
2. Les autres pays n'affichent que le pays, pas la région
3. Vider le cache du navigateur (Ctrl+Shift+R)

### Région non reconnue

**Cas fréquents** :

- **France** : Les codes régions sont numériques (ex: 84 pour Auvergne-Rhône-Alpes)
- **Allemagne** : Les codes sont des abréviations (ex: BY pour Bavière)
- **Suisse** : Les codes sont des abréviations cantonales (ex: GE pour Genève)

Si une région n'est pas reconnue, le code est affiché tel quel.

**Ajouter une région manquante** :

Éditez `/client/src/lib/regions.ts` :

```typescript
export const REGIONS: Record<string, Record<string, string>> = {
  FR: {
    // ... régions existantes
    'XX': 'Nouvelle Région', // ← AJOUTEZ ICI
  },
  // ...
};
```

## 📊 Statistiques Avancées

### Requêtes SQL Utiles

**Visiteurs par région française** :

```sql
SELECT 
  region,
  COUNT(DISTINCT visitor_hash) as visitors,
  COUNT(*) as pageviews
FROM analytics_pageviews
WHERE country = 'FR'
  AND region IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY region
ORDER BY visitors DESC;
```

**Comparaison France vs Pays voisins** :

```sql
SELECT 
  country,
  region,
  COUNT(DISTINCT visitor_hash) as visitors
FROM analytics_pageviews
WHERE country IN ('FR', 'DE', 'CH', 'BE', 'IT', 'ES')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY country, region
ORDER BY visitors DESC
LIMIT 20;
```

**Top régions germaniques** :

```sql
SELECT 
  country,
  region,
  COUNT(DISTINCT visitor_hash) as visitors,
  COUNT(*) as pageviews
FROM analytics_pageviews
WHERE country IN ('DE', 'AT', 'CH')
  AND region IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY country, region
ORDER BY visitors DESC;
```

## 🗺️ Utilisation Marketing

### Ciblage Régional

Avec ces données, vous pouvez :

1. **Adapter le contenu** par région
   - Articles de blog spécifiques à Auvergne-Rhône-Alpes
   - Tours ciblés pour visiteurs suisses ou allemands

2. **Optimiser la publicité**
   - Campagnes Facebook/Google Ads par région
   - Budget concentré sur les régions à fort potentiel

3. **Partenariats locaux**
   - Identifier les régions sources de visiteurs
   - Contacter offices de tourisme locaux

4. **Traductions ciblées**
   - Si beaucoup d'Allemands de Bavière → Prioriser l'allemand
   - Si beaucoup de Suisses de Genève → Contenu bilingue FR/DE

### Exemples Concrets

**Scénario 1 : Forte affluence d'Auvergne-Rhône-Alpes**

➜ Créer un article : "Lyon et Beaujolais : Le duo parfait pour un week-end"
➜ Mettre en avant la proximité géographique
➜ Proposer des forfaits courts (1-2 jours)

**Scénario 2 : Visiteurs allemands de Bavière**

➜ Traduire le site en allemand
➜ Créer des tours "Route des Vins" similaires à celles de Franconie
➜ Partenariat avec offices de tourisme bavarois

**Scénario 3 : Touristes suisses de Genève**

➜ Mettre en avant l'accessibilité (2h de route)
➜ Prix en CHF avec conversion automatique
➜ Contenu bilingue français/allemand

## 🌍 Pays Supportés

### Régions Détaillées

**France (13 régions)** :
- Auvergne-Rhône-Alpes
- Bourgogne-Franche-Comté
- Bretagne
- Centre-Val de Loire
- Corse
- Grand Est
- Hauts-de-France
- Île-de-France
- Normandie
- Nouvelle-Aquitaine
- Occitanie
- Pays de la Loire
- Provence-Alpes-Côte d'Azur

**Allemagne (16 Länder)** :
- Bade-Wurtemberg (BW)
- Bavière (BY)
- Berlin (BE)
- Brandebourg (BB)
- Brême (HB)
- Hambourg (HH)
- Hesse (HE)
- Mecklembourg-Poméranie-Occidentale (MV)
- Basse-Saxe (NI)
- Rhénanie-du-Nord-Westphalie (NW)
- Rhénanie-Palatinat (RP)
- Sarre (SL)
- Saxe (SN)
- Saxe-Anhalt (ST)
- Schleswig-Holstein (SH)
- Thuringe (TH)

**Autriche (9 Bundesländer)** :
- Burgenland (B)
- Carinthie (K)
- Basse-Autriche (NO)
- Haute-Autriche (OO)
- Salzbourg (S)
- Styrie (ST)
- Tyrol (T)
- Vorarlberg (V)
- Vienne (W)

**Suisse (26 Cantons)** :
- Argovie (AG), Genève (GE), Vaud (VD), Zürich (ZH), etc.

### Autres Pays

Les visiteurs d'autres pays affichent uniquement le **pays**, pas la région.

Pour ajouter des régions pour d'autres pays, éditez `/client/src/lib/regions.ts`.

## 🔒 Respect de la Vie Privée

### Conformité RGPD

✅ **Anonymisation complète** : IP hashée, jamais stockée en clair  
✅ **Pas de cookies** de tracking  
✅ **Détection locale** : Aucune API externe utilisée  
✅ **Données agrégées** : Impossible de remonter à un individu  
✅ **Code région uniquement** : Pas de ville ni adresse précise  

### Précision

- **Pays** : 95-99% de précision
- **Région** : 70-85% de précision
- **Ville** : Non stockée (respect de la vie privée)

**Limitations** :

- Les VPN montrent le pays/région du serveur VPN
- Les IPs mobiles peuvent être moins précises
- Certaines IPs d'entreprise peuvent être centralisées

## 📚 Ressources

- [geoip-lite sur npm](https://www.npmjs.com/package/geoip-lite)
- [Codes régions françaises INSEE](https://www.insee.fr/fr/information/4316069)
- [ISO 3166-2](https://fr.wikipedia.org/wiki/ISO_3166-2) - Codes des subdivisions
- [RGPD et géolocalisation](https://www.cnil.fr/fr/geolocalisation)

## ❓ Questions Fréquentes

### Puis-je ajouter d'autres pays ?

Oui ! Éditez `/client/src/lib/regions.ts` et ajoutez les codes régions.

Exemple pour l'Italie :

```typescript
export const REGIONS: Record<string, Record<string, string>> = {
  // ... pays existants
  
  IT: {
    'LOM': 'Lombardie',
    'LAZ': 'Latium',
    'CAM': 'Campanie',
    // etc.
  },
};
```

Puis modifiez la requête SQL dans `/server/analytics.ts` (ligne ~267) :

```typescript
WHERE country IN ('FR', 'DE', 'AT', 'CH', 'IT')  // ← Ajouter 'IT'
```

### La région est incorrecte ?

C'est normal. La géolocalisation IP par région a une précision de 70-85%.

Pour une précision supérieure, utilisez MaxMind GeoIP2 (payant).

### Puis-je voir les villes ?

Techniquement oui (`geoip-lite` fournit les villes), **mais ce n'est pas recommandé** :

- 🚫 **Respect de la vie privée** : Ville = donnée trop précise
- 🚫 **RGPD** : Risque de ré-identification
- 🚫 **Précision faible** : 50-80% seulement

La région est le meilleur compromis entre **utilité marketing** et **respect de la vie privée**.

---

**Vos visiteurs sont maintenant géolocalisés par région !** 🗺️✨
