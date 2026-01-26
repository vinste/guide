# Site Web Guide Conférencière

Site web professionnel pour guide conférencière avec système d'analytics auto-hébergé et conforme RGPD.

## 🎯 Fonctionnalités

### Frontend
- ✅ Site vitrine multilingue (FR/DE)
- ✅ Présentation des visites guidées
- ✅ Blog intégré
- ✅ Formulaire de contact
- ✅ Témoignages clients
- ✅ Dashboard d'administration complet
- ✅ **Analytics temps réel sans cookies** 🆕

### Backend
- ✅ API REST Express.js
- ✅ Base de données PostgreSQL
- ✅ Authentification sécurisée
- ✅ **Tracking analytics anonyme**
- ✅ Gestion des contenus (CRUD)

### Analytics
- ✅ **Suivi du trafic auto-hébergé**
- ✅ **Sans cookies - Conforme RGPD**
- ✅ **Dashboard admin avec statistiques temps réel**
- ✅ Pages les plus visitées
- ✅ Sources de trafic
- ✅ Visiteurs uniques anonymisés

## 🛠️ Stack Technique

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: Radix UI + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Base de données**: PostgreSQL + Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Analytics**: Système custom auto-hébergé

## 🚀 Installation Locale

### 1. Cloner le repository
```bash
git clone https://github.com/vinste/guide.git
cd guide
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement

Créez un fichier `.env` à la racine :

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/guide_db"
NODE_ENV="development"
PORT=5000
SESSION_SECRET="votre-secret-session"
ANALYTICS_SALT="votre-salt-analytics-unique"
```

**Générer un salt sécurisé pour l'analytics :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Créer la base de données
```bash
# Avec PostgreSQL installé localement
createdb guide_db

# Exécuter les migrations
npm run db:push
```

### 5. Lancer en développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

## 🌐 Déploiement sur VPS

### Déploiement automatique

Le script `deploy.sh` gère l'installation complète sur un VPS Ubuntu :

```bash
# Sur le VPS
curl -fsSL https://raw.githubusercontent.com/vinste/guide/main/deploy.sh | bash
```

### Ce que fait le script

1. ✅ Installe Node.js, PostgreSQL, Nginx, PM2
2. ✅ Clone le repository
3. ✅ Crée la base de données PostgreSQL
4. ✅ Génère les secrets (session, analytics)
5. ✅ Exécute les migrations (incluant tables analytics)
6. ✅ Build l'application
7. ✅ Configure Nginx comme reverse proxy
8. ✅ Lance l'app avec PM2

### Après le déploiement

```bash
# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs fullstack-js-app

# Redémarrer
pm2 restart fullstack-js-app

# Tester les analytics
curl http://localhost:5000/api/analytics/stats
```

## 📈 Dashboard Analytics

### Accès

1. Connectez-vous à l'admin : `http://votre-site.com/admin`
2. Cliquez sur l'onglet **"Analytics"**
3. Consultez vos statistiques en temps réel

### Fonctionnalités du dashboard

- **Statistiques principales**
  - Pages vues totales
  - Visiteurs uniques (anonymisés)
  - Jours actifs

- **Pages les plus visitées**
  - Classement avec nombre de vues
  - Barres de progression visuelles
  - Liens directs vers les pages

- **Sources de trafic**
  - Referrers externes (Google, réseaux sociaux, etc.)
  - Nombre de visites par source
  - Liens vers les sources

- **Périodes d'analyse**
  - 7 derniers jours
  - 30 derniers jours
  - 90 derniers jours

- **Rafraîchissement automatique** toutes les 60 secondes

### Confidentialité 🔒

Le système d'analytics est **100% conforme RGPD** :

- ❌ Pas de cookies
- ❌ Pas de tracking inter-sites
- ❌ Pas de stockage d'IPs
- ✅ Hachage SHA-256 avec salt
- ✅ Données agrégées uniquement
- ✅ Auto-hébergé (aucun tiers)

**Résultat** : Pas besoin de bandeau de consentement cookies ! 🎉

### Documentation détaillée

- [Documentation Analytics complète](./ANALYTICS.md)
- [Guide du Dashboard Admin](./client/src/components/admin/README.md)

## 📚 Structure du Projet

```
guide/
├── client/              # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   │   ├── admin/     # Composants admin (dashboard)
│   │   │   │   ├── AnalyticsPanel.tsx  # 🆕 Dashboard analytics
│   │   │   │   ├── BlogPanel.tsx
│   │   │   │   └── ToursPanel.tsx
│   │   │   └── ui/        # Composants UI (Radix + Tailwind)
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useAnalytics.ts  # 🆕 Hook tracking
│   │   ├── lib/
│   │   │   └── analytics.ts     # 🆕 Librairie client
│   │   └── pages/         # Pages de l'application
│   │       └── Admin.tsx        # Page admin avec analytics
│   └── index.html
├── server/             # Backend Express
│   ├── analytics.ts    # 🆕 Routes analytics
│   ├── routes.ts       # Routes principales
│   ├── db.ts           # Configuration DB
│   └── index.ts        # Point d'entrée serveur
├── shared/             # Code partagé client/serveur
│   └── schema.ts       # 🆕 Schéma DB (incluant analytics)
├── deploy.sh           # 🚀 Script de déploiement
├── ANALYTICS.md        # 📊 Documentation analytics
└── package.json
```

## 🛡️ Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de dev avec hot reload

# Production
npm run build        # Build l'application pour production
npm start            # Lance l'application en mode production

# Base de données
npm run db:push      # Applique les migrations Drizzle

# Vérification
npm run check        # Vérifie les types TypeScript
```

## 👥 Administration

### Connexion

Accédez à `/login` puis `/admin` après authentification.

### Sections disponibles

1. **Analytics** 🆕 - Statistiques de trafic en temps réel
2. **Messagerie** - Messages de contact reçus
3. **Témoignages** - Modération et approbation
4. **Visites** - Gestion des visites guidées
5. **Blog** - Création et édition d'articles

## 🔧 Maintenance

### Nettoyage des anciennes données analytics

```sql
-- Garder seulement 1 an de données
DELETE FROM analytics_pageviews WHERE created_at < NOW() - INTERVAL '1 year';
DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '1 year';
```

### Sauvegarde de la base de données

```bash
pg_dump guide_db > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
psql guide_db < backup_20260126.sql
```

## 🐛 Dépannage

### Les analytics ne s'affichent pas

1. Vérifiez que les tables existent :
   ```sql
   \dt analytics*
   ```

2. Vérifiez les logs :
   ```bash
   pm2 logs fullstack-js-app
   ```

3. Testez l'endpoint manuellement :
   ```bash
   curl http://localhost:5000/api/analytics/stats?days=7
   ```

### L'application ne démarre pas

1. Vérifiez la connexion à la base de données
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez que le port 5000 est disponible

## 📝 Licence

MIT

## 💬 Support

Pour toute question ou problème, ouvrez une issue sur le repository GitHub.

---

**Fait avec ❤️ pour Amandine Guide Conférencière**
