# Dashboard d'Analytics Admin

## Vue d'ensemble

Le dashboard d'analytics est intégré dans la page d'administration et affiche les statistiques de trafic du site en temps réel.

## Composants

### AnalyticsPanel.tsx

Composant principal qui affiche :

#### 1. Sélecteur de période
- 7 jours (par défaut)
- 30 jours
- 90 jours

#### 2. Cartes de statistiques principales
- **Pages vues** : Nombre total de pages visitées
- **Visiteurs uniques** : Nombre de visiteurs distincts (basé sur le hash anonyme)
- **Jours actifs** : Nombre de jours avec au moins une visite

#### 3. Pages les plus visitées
Tableau affichant :
- Rang de la page
- Titre et URL
- Nombre de vues
- Barre de progression relative
- Lien pour ouvrir la page

#### 4. Sources de trafic
Tableau affichant :
- Rang de la source
- Domaine et URL complète du referrer
- Nombre de visites
- Barre de progression relative
- Lien pour ouvrir la source

#### 5. Note de confidentialité
Encart informatif rappelant que les données sont collectées de manière anonyme et conforme au RGPD.

## Fonctionnalités

### Rafraîchissement automatique
Les données sont automatiquement rafraîchies toutes les **60 secondes** (1 minute) grâce à React Query.

### Gestion des erreurs
Affichage d'un message d'erreur si le serveur ne répond pas ou si une erreur survient.

### Chargement
Indicateur de chargement animé pendant la récupération des données.

### États vides
Messages informatifs si aucune donnée n'est disponible pour une section.

## Utilisation

### Accès au dashboard
1. Connectez-vous à l'administration : `/admin`
2. Cliquez sur l'onglet "Analytics" (première position)
3. Les statistiques s'affichent automatiquement

### Interprétation des données

#### Visiteurs uniques vs Pages vues
- **Visiteurs uniques** : Nombre de personnes différentes ayant visité le site
- **Pages vues** : Nombre total de pages consultées (un visiteur peut voir plusieurs pages)
- **Ratio** : Pages vues / Visiteurs uniques = nombre moyen de pages par visiteur

#### Sources de trafic
- **Trafic direct** : Visiteurs arrivant directement (URL tapée, favori, email)
- **Trafic référent** : Visiteurs venant d'un autre site (Google, réseaux sociaux, etc.)

## API utilisée

### Endpoint
```
GET /api/analytics/stats?days={period}
```

### Paramètres
- `days` : Nombre de jours à analyser (7, 30 ou 90)

### Réponse
```typescript
interface AnalyticsStats {
  period: string;
  stats: {
    total_pageviews: number;
    unique_visitors: number;
    active_days: number;
  };
  topPages: Array<{
    url: string;
    title: string | null;
    views: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    visits: number;
  }>;
}
```

## Personnalisation

### Modifier le délai de rafraîchissement

Dans `AnalyticsPanel.tsx`, ligne 29 :

```typescript
refetchInterval: 60000, // 60000ms = 1 minute
```

Pour changer à 30 secondes :
```typescript
refetchInterval: 30000,
```

Pour désactiver le rafraîchissement automatique :
```typescript
// Supprimer ou commenter la ligne refetchInterval
```

### Ajouter une nouvelle période

Dans `AnalyticsPanel.tsx`, ligne 20 :

```typescript
const [period, setPeriod] = useState<7 | 30 | 90 | 365>(7);
```

Puis ajouter l'onglet dans le composant (ligne 55) :

```tsx
<TabsTrigger value="365">1 an</TabsTrigger>
```

### Modifier les couleurs des barres de progression

**Pages** (ligne 125) :
```tsx
className="bg-primary h-full rounded-full transition-all"
```

**Referrers** (ligne 174) :
```tsx
className="bg-green-500 h-full rounded-full transition-all"
```

Pour changer la couleur, remplacez `bg-primary` ou `bg-green-500` par une autre classe Tailwind :
- `bg-blue-500`
- `bg-purple-500`
- `bg-indigo-500`
- etc.

## Dépannage

### Les statistiques n'apparaissent pas

1. Vérifiez que la migration de la base de données a été exécutée :
   ```bash
   npm run db:push
   ```

2. Vérifiez que les tables existent :
   ```sql
   SELECT * FROM analytics_pageviews LIMIT 1;
   SELECT * FROM analytics_events LIMIT 1;
   ```

3. Vérifiez les logs du serveur :
   ```bash
   pm2 logs fullstack-js-app
   ```

### Erreur "Failed to fetch"

Vérifiez que le serveur est bien démarré et que l'endpoint `/api/analytics/stats` répond :

```bash
curl http://localhost:5000/api/analytics/stats?days=7
```

### Pas de données affichées

Si le site vient d'être déployé, il est normal de ne pas avoir de données. Visitez quelques pages du site pour générer du trafic.

### Les visiteurs uniques semblent incorrects

Le comptage des visiteurs uniques est basé sur un hash de l'IP + User-Agent. Si vous testez depuis le même ordinateur avec différents navigateurs, cela comptera comme des visiteurs différents.

## Sécurité

Le dashboard d'analytics est **protégé** par authentification :
- Accessible uniquement via `/admin`
- Nécessite une connexion valide
- Les données brutes de tracking (IP hashées) ne sont jamais exposées au client
- Les statistiques agrégées uniquement sont affichées

## Améliorations futures possibles

- 📈 Graphiques temporels (ligne, barres) pour visualiser l'évolution
- 📊 Export des données en CSV ou PDF
- 🔍 Filtres avancés (par page, par source, par langue)
- 🌐 Analyse géographique (pays, régions)
- 📱 Statistiques par type d'appareil (mobile, desktop, tablette)
- 🕒 Analyse des heures de pointe
- ⏱️ Temps moyen passé sur le site
- 🔄 Taux de rebond
- 📍 Parcours utilisateur (pages vues en séquence)

## Ressources

- [Documentation complète Analytics](../../../ANALYTICS.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
