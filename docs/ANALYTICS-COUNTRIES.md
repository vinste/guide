# Géolocalisation des Visiteurs - Analytics

## 🌍 Vue d'ensemble

Le système d'analytics détecte automatiquement le pays d'origine de chaque visiteur à partir de son adresse IP, de manière **totalement anonyme et conforme au RGPD**.

## ✨ Fonctionnalités

### Affichage dans le Dashboard

Le dashboard admin affiche maintenant une section **"Origine géographique des visiteurs"** avec :

- 🏴 **Drapeau du pays** (emoji Unicode)
- 🌎 **Nom du pays** en français
- 🔢 **Code ISO** (FR, US, DE, etc.)
- 👥 **Nombre de visiteurs uniques** du pays
- 📄 **Nombre de pages vues** totales
- 📊 **Pourcentage** par rapport au total
- 📈 **Barre de progression** visuelle

### Exemple d'affichage

```
🌍 Origine géographique des visiteurs

#1  🇫🇷 France (FR)           89 visiteurs (57%)    245 vues
    ████████████████████

#2  🇺🇸 États-Unis (US)        34 visiteurs (22%)    78 vues
    ████████

#3  🇧🇪 Belgique (BE)          23 visiteurs (15%)    56 vues
    ██████

#4  🇩🇪 Allemagne (DE)         12 visiteurs (8%)     34 vues
    ███
```

## 🔒 Respect de la Vie Privée

### Méthode de Détection

1. **Adresse IP récupérée** (en tenant compte des proxies)
2. **Recherche du pays** via la base de données locale `geoip-lite`
3. **Stockage uniquement du code pays** (2 lettres : FR, US, etc.)
4. **IP hashée** pour l'anonymisation
5. **IP jamais stockée** en clair

### Conformité RGPD

✅ **Pas de cookies** utilisés pour le tracking  
✅ **Pas de transfert de données** à des tiers  
✅ **Pas de stockage d'IP** en clair  
✅ **Géolocalisation locale** (pas d'API externe)  
✅ **Anonymisation** par hash cryptographique  
✅ **Données agrégées** uniquement  

### IPs Ignorées

Les IPs locales sont automatiquement ignorées :
- `127.0.0.1` (localhost)
- `::1` (localhost IPv6)
- `192.168.x.x` (réseau privé)
- `10.x.x.x` (réseau privé)
- `unknown` (IP non détectée)

## 🛠️ Installation et Configuration

### 1. Installer les Dépendances

```bash
cd /var/www/fullstack-js-app
npm install
```

La bibliothèque `geoip-lite` est déjà incluse dans `package.json`.

### 2. Mettre à Jour la Base de Données

Ajout de la colonne `country` dans la table `analytics_pageviews` :

```bash
npm run db:push
```

Ou manuellement avec PostgreSQL :

```sql
ALTER TABLE analytics_pageviews 
ADD COLUMN country VARCHAR(2);
```

### 3. Redémarrer l'Application

```bash
npm run build
pm2 restart fullstack-js-app
```

### 4. Vérifier

```bash
# Tester l'API
curl http://localhost:5000/api/analytics/stats?days=7

# Vous devriez voir une section "countries" dans la réponse
```

## 📊 Données Collectées

### Structure en Base de Données

```sql
CREATE TABLE analytics_pageviews (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  referrer TEXT,
  title TEXT,
  screen VARCHAR(20),
  language VARCHAR(10),
  country VARCHAR(2),        -- ← NOUVEAU
  visitor_hash VARCHAR(64) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Exemple de Requête Analytics

```sql
-- Top 10 pays par visiteurs uniques
SELECT 
  country,
  COUNT(DISTINCT visitor_hash) as visitors,
  COUNT(*) as pageviews
FROM analytics_pageviews
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND country IS NOT NULL
GROUP BY country
ORDER BY visitors DESC
LIMIT 10;
```

## 🌐 Pays Supportés

La bibliothèque `geoip-lite` contient une base de données de **tous les pays du monde**.

Le fichier `/client/src/lib/countries.ts` contient les traductions en français et les drapeaux pour les **60+ pays les plus communs** :

- 🇪🇺 Europe : France, Allemagne, Espagne, Italie, Belgique, Suisse, etc.
- 🌎 Amériques : États-Unis, Canada, Brésil, Argentine, Mexique, etc.
- 🌏 Asie : Japon, Chine, Inde, Singapour, Thaïlande, etc.
- 🌍 Océanie : Australie, Nouvelle-Zélande
- 🌍 Afrique : Afrique du Sud, Maroc, Égypte, etc.

Pour les pays non listés, le code ISO est affiché avec un emoji globe 🌍.

## 🔧 Personnalisation

### Ajouter un Pays Manquant

Éditez `/client/src/lib/countries.ts` :

```typescript
export const COUNTRIES: Record<string, { name: string; flag: string }> = {
  // ... pays existants
  
  // Ajouter un nouveau pays
  XX: { name: 'Nom du Pays', flag: '🏴' },
};
```

### Changer la Limite d'Affichage

Par défaut, les **15 premiers pays** sont affichés.

Pour changer, modifiez `/server/analytics.ts` :

```typescript
// Top pays
const countriesQuery = sql`
  SELECT country, COUNT(DISTINCT visitor_hash) as visitors
  FROM ${analyticsPageviews}
  WHERE created_at >= ${daysAgo} AND country IS NOT NULL
  GROUP BY country
  ORDER BY visitors DESC
  LIMIT 20  -- ← Changer ici
`;
```

### Masquer Certains Pays

Pour filtrer certains pays (par exemple, votre propre pays pour les tests) :

```typescript
const countriesQuery = sql`
  SELECT country, COUNT(DISTINCT visitor_hash) as visitors
  FROM ${analyticsPageviews}
  WHERE created_at >= ${daysAgo}
    AND country IS NOT NULL
    AND country != 'XX'  -- ← Exclure le pays XX
  GROUP BY country
  ORDER BY visitors DESC
  LIMIT 15
`;
```

## 🐛 Dépannage

### Aucun pays détecté

**Causes possibles :**

1. **IPs locales** : Les IPs privées (localhost, 192.168.x.x) sont ignorées
2. **Base de données geoip-lite non à jour** : Mettre à jour
3. **IPs IPv6** : Certaines IPs IPv6 peuvent ne pas être reconnues

**Solutions :**

```bash
# Mettre à jour geoip-lite
npm update geoip-lite

# Vérifier la version
npm list geoip-lite

# Tester manuellement
node -e "const geoip = require('geoip-lite'); console.log(geoip.lookup('8.8.8.8'));"
```

### Pays incorrect détecté

**Cause :** La géolocalisation IP n'est pas précise à 100%

**Précision moyenne :**
- Pays : **95-99%**
- Ville : **50-80%**

Pour une précision supérieure, utilisez un service payant comme MaxMind GeoIP2.

### Drapeaux non affichés

**Cause :** Police de caractères ne supportant pas les emojis

**Solution :** Les navigateurs modernes supportent tous les emojis drapeaux. Vérifiez :
- Chrome 58+
- Firefox 53+
- Safari 11+
- Edge 79+

### Colonne country manquante

**Erreur :**
```
ERROR: column "country" does not exist
```

**Solution :**
```bash
npm run db:push

# Ou manuellement
psql -U postgres -d votre_db
ALTER TABLE analytics_pageviews ADD COLUMN country VARCHAR(2);
```

## 📊 Statistiques Avancées

### Requêtes SQL Utiles

**Visiteurs par continent :**
```sql
SELECT 
  CASE 
    WHEN country IN ('FR','DE','ES','IT','GB','BE','NL','PT') THEN 'Europe'
    WHEN country IN ('US','CA','MX','BR','AR') THEN 'Amériques'
    WHEN country IN ('JP','CN','IN','SG','TH','KR') THEN 'Asie'
    WHEN country IN ('AU','NZ') THEN 'Océanie'
    ELSE 'Autres'
  END as continent,
  COUNT(DISTINCT visitor_hash) as visitors
FROM analytics_pageviews
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY continent
ORDER BY visitors DESC;
```

**Engagement par pays (pages/visiteur) :**
```sql
SELECT 
  country,
  COUNT(DISTINCT visitor_hash) as visitors,
  COUNT(*) as pageviews,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT visitor_hash), 2) as pages_per_visitor
FROM analytics_pageviews
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND country IS NOT NULL
GROUP BY country
ORDER BY pages_per_visitor DESC
LIMIT 10;
```

**Évolution quotidienne par pays :**
```sql
SELECT 
  DATE(created_at) as date,
  country,
  COUNT(DISTINCT visitor_hash) as visitors
FROM analytics_pageviews
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND country IN ('FR', 'US', 'DE', 'BE')
GROUP BY DATE(created_at), country
ORDER BY date, visitors DESC;
```

## 🔄 Mise à Jour de la Base GeoIP

La base de données geoip-lite est mise à jour automatiquement lors de l'installation.

Pour forcer une mise à jour manuelle :

```bash
npm update geoip-lite

# Ou supprimer et réinstaller
rm -rf node_modules/geoip-lite
npm install geoip-lite
```

Fréquence des mises à jour : **mensuelle** (premier mardi du mois)

## 📚 Ressources

- [geoip-lite sur npm](https://www.npmjs.com/package/geoip-lite)
- [Codes pays ISO 3166-1](https://fr.wikipedia.org/wiki/ISO_3166-1)
- [Emojis drapeaux Unicode](https://unicode.org/emoji/charts/emoji-list.html#country-flag)
- [RGPD et géolocalisation](https://www.cnil.fr/fr/geolocalisation)

## ❓ Questions Fréquentes

### Puis-je détecter la ville ?

Oui, `geoip-lite` fournit aussi la ville, mais avec une précision limitée (50-80%).

Pour activer :
```typescript
const geo = geoip.lookup(ip);
const city = geo?.city || null;
```

### Est-ce conforme au RGPD ?

Oui, à 100% :
- Pas de cookies
- IP jamais stockée
- Données anonymisées
- Traitement local (pas de tiers)
- Code pays = donnée agrégée non personnelle

### Puis-je désactiver la détection ?

Oui, commentez simplement la ligne dans `/server/analytics.ts` :

```typescript
// const country = detectCountry(ip);
const country = null;
```

### Quelle est la précision ?

- **Pays** : 95-99% de précision
- **Dépend de** : Qualité de la base IP, type de connexion (mobile, VPN, proxy)
- **VPN/Proxy** : Détectera le pays du serveur VPN, pas l'utilisateur réel

---

**Votre analytics géolocalisé est prêt !** 🌍✨
