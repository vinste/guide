# Système d'Analytics Auto-hébergé

## Vue d'ensemble

Ce site utilise un système d'analytics **auto-hébergé** et **sans cookie**, conforme au RGPD.

### Caractéristiques

✅ **Sans cookies** : Aucune donnée stockée dans le navigateur  
✅ **Anonyme** : Les IPs sont hashées (SHA-256) avec un salt  
✅ **Léger** : Pas de bibliothèque tierce, seulement du fetch natif  
✅ **Auto-hébergé** : Toutes les données restent sur votre serveur  
✅ **RGPD compliant** : Pas besoin de bandeau de consentement  

## Architecture

### Côté Client

- **`client/src/lib/analytics.ts`** : Classe Analytics pour envoyer les événements
- **`client/src/hooks/useAnalytics.ts`** : Hook React pour tracking automatique
- **`client/src/App.tsx`** : Intégration du hook dans le routeur

### Côté Serveur

- **`server/analytics.ts`** : Routes Express pour collecter les données
- **`shared/schema.ts`** : Schéma de base de données Drizzle ORM

### Base de données

Deux tables PostgreSQL :

#### `analytics_pageviews`
```sql
CREATE TABLE analytics_pageviews (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  referrer TEXT,
  title TEXT,
  screen VARCHAR(20),
  language VARCHAR(10),
  visitor_hash VARCHAR(64) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `analytics_events`
```sql
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data TEXT,
  url TEXT NOT NULL,
  visitor_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Variables d'environnement

Ajoutez cette variable dans votre fichier `.env` :

```bash
ANALYTICS_SALT=votre-salt-secret-unique-et-aleatoire
```

⚠️ **Important** : Changez le salt par défaut ! Utilisez une chaîne aléatoire unique.

```bash
# Générer un salt sécurisé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Migration de la base de données

Les tables sont déjà définies dans `shared/schema.ts`. Pour créer les tables :

```bash
npm run db:push
```

## Utilisation

### Tracking automatique des pages

Le tracking est **automatique** sur toutes les pages grâce au hook `useAnalytics()` dans `App.tsx`.

### Tracking manuel d'événements

Pour tracker des événements personnalisés (clics, soumissions de formulaires, etc.) :

```typescript
import { useTrackEvent } from '@/hooks/useAnalytics';

function MonComposant() {
  const trackEvent = useTrackEvent();

  const handleClick = () => {
    trackEvent('button_click', {
      button_name: 'contact_cta',
      page: 'home'
    });
  };

  return <button onClick={handleClick}>Contactez-moi</button>;
}
```

### Tracking direct

Si vous n'utilisez pas React ou besoin d'un accès direct :

```typescript
import { analytics } from '@/lib/analytics';

// Track pageview
analytics.trackPageview();

// Track event
analytics.trackEvent('download', { file: 'brochure.pdf' });
```

## API Endpoints

### POST `/api/analytics/pageview`

Enregistre une page vue.

**Body** :
```json
{
  "url": "/tours",
  "referrer": "https://google.com",
  "title": "Visites Guidées",
  "screen": "1920x1080",
  "language": "fr-FR"
}
```

### POST `/api/analytics/event`

Enregistre un événement personnalisé.

**Body** :
```json
{
  "eventName": "contact_form_submit",
  "eventData": { "source": "homepage" },
  "url": "/contact"
}
```

### GET `/api/analytics/stats?days=7`

Récupère des statistiques.

**Query Parameters** :
- `days` (optionnel, défaut: 7) : Nombre de jours à analyser

**Response** :
```json
{
  "period": "7 days",
  "stats": {
    "total_pageviews": 1234,
    "unique_visitors": 456,
    "active_days": 7
  },
  "topPages": [
    { "url": "/", "title": "Accueil", "views": 500 },
    { "url": "/tours", "title": "Visites", "views": 300 }
  ],
  "topReferrers": [
    { "referrer": "https://google.com", "visits": 150 }
  ]
}
```

## Visualisation des données

### Option 1 : Dashboard personnalisé

Créez une page admin pour visualiser vos statistiques en utilisant l'endpoint `/api/analytics/stats`.

### Option 2 : Outils SQL

Interrogez directement la base PostgreSQL :

```sql
-- Pages les plus visitées (30 derniers jours)
SELECT url, title, COUNT(*) as views
FROM analytics_pageviews
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY url, title
ORDER BY views DESC
LIMIT 10;

-- Visiteurs uniques par jour
SELECT DATE(created_at) as day, COUNT(DISTINCT visitor_hash) as visitors
FROM analytics_pageviews
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day;

-- Événements les plus fréquents
SELECT event_name, COUNT(*) as count
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY count DESC;
```

## Confidentialité et sécurité

### Anonymisation

Les adresses IP sont **hashées** avec SHA-256 et un salt secret. L'IP originale n'est jamais stockée.

```typescript
function hashVisitor(ip: string, userAgent: string): string {
  const salt = process.env.ANALYTICS_SALT || 'default-salt-change-me';
  const hash = crypto.createHash('sha256');
  hash.update(`${ip}-${userAgent}-${salt}`);
  return hash.digest('hex');
}
```

### Données collectées

✅ **Collecté** :
- URL de la page
- Titre de la page
- Referrer (site provenance)
- Résolution d'écran
- Langue du navigateur
- User-Agent (pour stats navigateurs/appareils)
- Hash anonyme du visiteur

❌ **PAS collecté** :
- Adresse IP réelle
- Données personnelles identifiables
- Cookies
- Historique de navigation hors site

### Conformité RGPD

Ce système est conforme au RGPD car :

1. ✅ Aucune donnée personnelle identifiable
2. ✅ Pas de cookies
3. ✅ Anonymisation dès la collecte
4. ✅ Données stockées sur votre serveur (pas de tiers)
5. ✅ Pas de tracking inter-sites

**Résultat** : Pas besoin de bandeau de consentement cookies !

## Maintenance

### Nettoyage des anciennes données

Pour éviter une base trop volumineuse, nettoyez périodiquement les anciennes entrées :

```sql
-- Supprimer les données de plus d'un an
DELETE FROM analytics_pageviews WHERE created_at < NOW() - INTERVAL '1 year';
DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '1 year';
```

Ou créez un cron job :

```bash
# Ajouter dans crontab (tous les mois)
0 0 1 * * psql $DATABASE_URL -c "DELETE FROM analytics_pageviews WHERE created_at < NOW() - INTERVAL '1 year';"
```

### Index recommandés

Pour améliorer les performances sur de gros volumes :

```sql
CREATE INDEX idx_pageviews_created_at ON analytics_pageviews(created_at);
CREATE INDEX idx_pageviews_url ON analytics_pageviews(url);
CREATE INDEX idx_pageviews_visitor ON analytics_pageviews(visitor_hash);
CREATE INDEX idx_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_events_name ON analytics_events(event_name);
```

## Alternatives

Si vous préférez une solution clé en main :

- **Umami** : Analytics open-source, interface moderne ([umami.is](https://umami.is))
- **Plausible** : Simple et léger, version self-hosted disponible ([plausible.io](https://plausible.io))
- **GoatCounter** : Minimaliste et gratuit ([goatcounter.com](https://goatcounter.com))

Ces solutions offrent des dashboards plus complets mais nécessitent une installation séparée.

## Support

Pour toute question ou problème, ouvrez une issue sur le repository.
