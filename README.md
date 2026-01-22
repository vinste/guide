# Fullstack JS Project

Cette application est une application web fullstack utilisant React, Express et Drizzle ORM.

## Architecture

- **Frontend**: React avec Vite, Radix UI, et Tailwind CSS.
- **Backend**: Express.js.
- **Base de données**: PostgreSQL (via Drizzle ORM).
- **Gestion d'état**: TanStack Query (React Query).
- **Routage**: Wouter.

## Installation Locale

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Configurez les variables d'environnement (voir `.env`).

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Déploiement

Pour déployer sur un VPS OVH (Ubuntu 25.04), utilisez le script `deploy.sh` fourni à la racine du projet.

```bash
chmod +x deploy.sh
./deploy.sh
```
