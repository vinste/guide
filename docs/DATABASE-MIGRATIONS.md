# Guide des Migrations de Base de Données

## 🎯 Vue d'ensemble

Ce guide explique comment gérer les mises à jour du schéma de base de données sur Replit et sur votre VPS.

## 🔄 Qu'est-ce qu'une Migration ?

Une migration de base de données est une modification de la structure (schéma) de votre base :
- ➕ Ajouter une colonne (ex: `country` dans `analytics_pageviews`)
- ❎ Supprimer une colonne
- 🔄 Modifier le type d'une colonne
- ➕ Créer une nouvelle table
- ❎ Supprimer une table
- 🔒 Ajouter un index pour les performances

## 🛠️ Outils Utilisés

### Drizzle ORM

Le projet utilise **Drizzle ORM** pour gérer le schéma de base de données.

**Fichier principal** : `/shared/schema.ts`

Toute modification du schéma doit être faite dans ce fichier.

### Commande de Migration

```bash
npm run db:push
```

Cette commande :
1. Lit le schéma dans `shared/schema.ts`
2. Compare avec la base de données actuelle
3. Génère et applique les modifications SQL nécessaires

## 💻 Sur Replit

### Méthode 1 : Automatique (Recommandée)

Replit détecte automatiquement les changements dans `package.json` et `shared/schema.ts`.

**Workflow :**

1. **Modifier le schéma** dans `shared/schema.ts`
   ```typescript
   export const analyticsPageviews = pgTable("analytics_pageviews", {
     id: serial("id").primaryKey(),
     // ... autres colonnes
     country: varchar("country", { length: 2 }), // ← NOUVELLE COLONNE
   });
   ```

2. **Pousser sur GitHub**
   ```bash
   git add shared/schema.ts
   git commit -m "Add country column to analytics"
   git push origin main
   ```

3. **Replit détecte le changement** et redémarre automatiquement

4. **Vérifier les logs** dans la console Replit
   - Chercher "Migration" ou "db:push"
   - Vérifier qu'il n'y a pas d'erreurs

### Méthode 2 : Manuelle

Si la migration automatique ne se déclenche pas :

1. **Ouvrir le Shell Replit**
   - Cliquer sur "Shell" dans le panneau latéral

2. **Exécuter la migration**
   ```bash
   npm run db:push
   ```

3. **Redémarrer l'application**
   - Cliquer sur "Stop" puis "Run"
   - Ou dans le Shell :
     ```bash
     killall node
     npm run dev
     ```

### Méthode 3 : Ajout d'un Script de Setup

Vous pouvez ajouter un hook `postinstall` dans `package.json` :

```json
{
  "scripts": {
    "postinstall": "npm run db:push",
    "db:push": "drizzle-kit push"
  }
}
```

Avec ce hook, **chaque fois que Replit installe les dépendances**, la migration s'exécute automatiquement.

⚠️ **Attention** : Cela peut échouer si la base de données n'est pas encore créée au premier démarrage.

## 🖥️ Sur le VPS

### Via le Script de Déploiement (Recommandé)

Le script `deploy.sh` gère automatiquement les migrations.

**Ce qu'il fait :**

1. ✅ Vérifie si les tables existent
2. ✅ Vérifie si les colonnes requises existent
3. ✅ Ajoute les colonnes manquantes (ex: `country`, `screen`, `language`)
4. ✅ Exécute `npm run db:push` pour appliquer toutes les modifications
5. ✅ Crée les tables manuellement si Drizzle échoue
6. ✅ Affiche un résumé de l'état de la base

**Pour redéployer avec migrations :**

```bash
# Sur votre VPS
cd /var/www/fullstack-js-app
sudo bash deploy.sh
```

Le script détectera automatiquement les colonnes manquantes et les ajoutera.

### Manuellement (Pour une mise à jour rapide)

Si vous voulez juste mettre à jour le code sans redéployer complètement :

```bash
# 1. Se connecter au VPS
ssh user@votre-vps

# 2. Aller dans le répertoire du projet
cd /var/www/fullstack-js-app

# 3. Récupérer les dernières modifications
git pull origin main

# 4. Installer les dépendances (si nouvelles)
npm install

# 5. Appliquer les migrations
npm run db:push

# 6. Rebuilder l'application
npm run build

# 7. Redémarrer
pm2 restart fullstack-js-app

# 8. Vérifier les logs
pm2 logs fullstack-js-app
```

### Migration SQL Directe (En cas d'échec)

Si `npm run db:push` échoue, vous pouvez appliquer la migration manuellement avec PostgreSQL :

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Se connecter à la base de données
\c guide_db

# Ajouter la colonne country
ALTER TABLE analytics_pageviews 
ADD COLUMN IF NOT EXISTS country VARCHAR(2);

# Vérifier
\d analytics_pageviews

# Quitter
\q
```

## 📝 Exemple Complet : Ajout de la Colonne `country`

### Étape 1 : Modifier le Schéma

**Fichier** : `shared/schema.ts`

```typescript
export const analyticsPageviews = pgTable("analytics_pageviews", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  referrer: text("referrer"),
  title: text("title"),
  screen: varchar("screen", { length: 20 }),
  language: varchar("language", { length: 10 }),
  country: varchar("country", { length: 2 }), // ← AJOUT
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Étape 2 : Mettre à Jour le Backend

**Fichier** : `server/analytics.ts`

```typescript
import geoip from 'geoip-lite';

// Fonction de détection
function detectCountry(ip: string): string | null {
  if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
    return null;
  }
  const geo = geoip.lookup(ip);
  return geo?.country || null;
}

// Dans l'endpoint /pageview
router.post('/pageview', async (req, res) => {
  // ... récupération de l'IP
  const country = detectCountry(ip); // ← DÉTECTION
  
  await db.insert(analyticsPageviews).values({
    // ...
    country: country || null, // ← STOCKAGE
  });
});
```

### Étape 3 : Appliquer la Migration

**Sur Replit** :
```bash
git push origin main
# Replit redémarre automatiquement
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

### Étape 4 : Vérifier

```bash
# Tester l'API
curl http://localhost:5000/api/analytics/stats?days=7

# Vous devriez voir une section "countries" dans la réponse
```

## ⚙️ Configuration Drizzle

### Fichier `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Package.json

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

## 🐛 Dépannage

### Erreur : "relation does not exist"

**Cause** : La table n'existe pas dans la base de données.

**Solution** :
```bash
npm run db:push
```

### Erreur : "column does not exist"

**Cause** : Une colonne a été ajoutée dans le schéma mais pas en base.

**Solution** :
```bash
# Automatique
npm run db:push

# Ou manuel
psql -U guide_user -d guide_db
ALTER TABLE analytics_pageviews ADD COLUMN country VARCHAR(2);
```

### Erreur : "database does not exist"

**Cause** : La base de données n'a pas été créée.

**Solution** :
```bash
# Sur VPS
sudo -u postgres psql
CREATE DATABASE guide_db;
\q

# Puis exécuter les migrations
npm run db:push
```

### La migration échoue sur Replit

**Causes possibles** :

1. **Base de données pas encore créée**
   - Solution : Redémarrer Replit
   - Solution : Créer manuellement dans Replit Database

2. **Variable DATABASE_URL incorrecte**
   - Vérifier dans l'onglet "Secrets" de Replit
   - Format : `postgresql://user:password@host:port/database`

3. **Permissions insuffisantes**
   - Vérifier que l'utilisateur a les droits `CREATE TABLE`, `ALTER TABLE`

### Les changements ne sont pas appliqués

**Checklist** :

1. ✅ Le schéma dans `shared/schema.ts` est correct ?
2. ✅ `npm run db:push` s'exécute sans erreur ?
3. ✅ L'application a été redémarrée ?
4. ✅ Le cache du navigateur a été vidé (Ctrl+F5) ?

## 📖 Bonnes Pratiques

### 1. Toujours Tester en Local d'Abord

```bash
# Sur votre machine de développement
npm run db:push
npm run dev

# Tester l'application
# Si ça fonctionne, pusher sur Git
```

### 2. Faire des Migrations Incrémentales

❌ **Mauvais** : Ajouter 10 colonnes en une fois
✅ **Bon** : Ajouter 2-3 colonnes, tester, puis continuer

### 3. Ne Jamais Supprimer de Colonnes Sans Backup

Avant de supprimer une colonne :

```bash
# Faire un backup
pg_dump -U guide_user guide_db > backup_$(date +%Y%m%d).sql

# Puis modifier le schéma et migrer
```

### 4. Documenter les Migrations Importantes

Créer un fichier `CHANGELOG-DB.md` :

```markdown
## 2026-01-27 : Ajout de la Géolocalisation

- Ajout colonne `country` dans `analytics_pageviews`
- Type : VARCHAR(2) (code ISO)
- Nullable : true
- Migration : npm run db:push
```

### 5. Utiliser des Valeurs par Défaut

Pour les nouvelles colonnes, toujours spécifier une valeur par défaut ou `nullable` :

```typescript
// ✅ Bon
country: varchar("country", { length: 2 }), // nullable par défaut

// ou
country: varchar("country", { length: 2 }).default('XX'),

// ❌ Mauvais
country: varchar("country", { length: 2 }).notNull(), // Échouera si données existantes
```

## 📈 Workflow Complet de Développement

### Scénario : Ajouter une Nouvelle Fonctionnalité

```bash
# 1. Modifier le schéma
vim shared/schema.ts

# 2. Appliquer en local
npm run db:push

# 3. Tester
npm run dev
# Ouvrir http://localhost:5000

# 4. Commit et push
git add .
git commit -m "Add feature X with DB migration"
git push origin main

# 5. Déployer sur VPS
ssh user@vps
cd /var/www/fullstack-js-app
git pull
npm install
npm run db:push
npm run build
pm2 restart fullstack-js-app

# 6. Vérifier
curl http://your-vps-ip/api/health
pm2 logs fullstack-js-app
```

## 🔗 Ressources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Guide Migrations](https://orm.drizzle.team/docs/migrations)

## ❓ Questions Fréquentes

### Dois-je redémarrer Replit après une migration ?

Non, si la migration s'exécute dans le `postinstall`, Replit redémarre automatiquement.

Sinon, oui : Stop → Run

### Puis-je annuler une migration ?

Drizzle ne gère pas le rollback automatique. Pour annuler :

1. Restaurer depuis un backup
2. Ou modifier manuellement avec SQL

### Que se passe-t-il si la migration échoue en production ?

Le script `deploy.sh` a un **fallback** : il crée les tables manuellement si Drizzle échoue.

L'application continuera de fonctionner avec l'ancien schéma.

### Comment voir les requêtes SQL générées ?

```bash
# Générer les migrations sans les appliquer
npm run db:generate

# Les fichiers SQL seront dans ./drizzle/
cat drizzle/*.sql
```

---

**Vos migrations de base de données sont maintenant gérées automatiquement !** 🚀
