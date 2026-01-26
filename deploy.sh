#!/bin/bash

# Script de déploiement pour VPS OVH (Ubuntu 24.04/25.04)
# Ce script installe Node.js, PostgreSQL, Nginx, PM2 et configure l'application.

# Mode strict : le script s'arrête si une commande échoue, si une variable n'est pas définie,
# ou si une commande dans un pipe échoue.
set -euo pipefail

# Traitement des erreurs globales
trap 'echo "ERREUR : Le script a échoué à la ligne $LINENO. Vérifiez les logs ci-dessus."; exit 1' ERR

# Configuration
REPO_URL="https://github.com/vinste/guide"
TARGET_DIR="/var/www/fullstack-js-app"
DB_NAME="guide_db"
DB_USER="guide_user"
# Le port sur lequel l'application écoute (doit correspondre au serveur Express)
APP_PORT=5000

# Récupération de l'IP publique avec fallback
IP_PUBLIQUE=$(curl -s --max-time 5 https://ifconfig.me || curl -s --max-time 5 https://api.ipify.org || echo "VOTRE_IP_VPS")

echo "--- Mise à jour du système ---"
sudo apt update && sudo apt upgrade -y

echo "--- Installation des dépendances système ---"
sudo apt install -y curl git build-essential nginx postgresql postgresql-contrib ufw

echo "--- Configuration du Pare-feu (UFW) ---"
# Utilisation du port 22 directement si le profil 'OpenSSH' n'existe pas
sudo ufw allow 22/tcp || true
sudo ufw allow OpenSSH || true
sudo ufw allow 'Nginx Full' || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
echo "y" | sudo ufw enable

echo "--- Installation de Node.js (LTS) ---"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js est déjà installé ($(node -v))"
fi

echo "--- Installation de PM2 ---"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

echo "--- Récupération du projet depuis Git ---"
if [ ! -d "$TARGET_DIR" ]; then
    echo "Clonage du repository..."
    sudo mkdir -p "$TARGET_DIR"
    sudo chown $USER:$USER "$TARGET_DIR"
    git clone "$REPO_URL" "$TARGET_DIR"
else
    echo "Mise à jour du projet existant..."
    cd "$TARGET_DIR"
    git fetch origin
    git reset --hard origin/main
fi

cd "$TARGET_DIR"

echo "--- Configuration de la base de données PostgreSQL ---"
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Création sécurisée de l'utilisateur
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "Création de l'utilisateur $DB_USER..."
    DB_PASS=$(openssl rand -base64 12)
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
else
    echo "L'utilisateur $DB_USER existe déjà."
    if [ -f .env ]; then
        # Extraction propre du mot de passe depuis DATABASE_URL dans le .env
        DB_PASS=$(grep "DATABASE_URL=" .env | sed -e 's/.*:\(.*\)@.*/\1/' | tr -d '"' || echo "")
        if [ -z "$DB_PASS" ]; then
            DB_PASS=$(openssl rand -base64 12)
            echo "Mise à jour du mot de passe pour l'utilisateur existant..."
            sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
        fi
    else
        DB_PASS=$(openssl rand -base64 12)
        echo "Mise à jour du mot de passe pour l'utilisateur existant..."
        sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
    fi
fi

# Création sécurisée de la base de données
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Création de la base de données $DB_NAME..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
fi

# Gestion du fichier .env
echo "Configuration du fichier .env..."
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

# Génération du salt pour analytics (récupération de l'existant si présent)
if [ -f .env ] && grep -q "ANALYTICS_SALT=" .env; then
    ANALYTICS_SALT=$(grep "ANALYTICS_SALT=" .env | cut -d '=' -f2 | tr -d '"')
    echo "Réutilisation du ANALYTICS_SALT existant"
else
    ANALYTICS_SALT=$(openssl rand -hex 32)
    echo "Génération d'un nouveau ANALYTICS_SALT"
fi

# Génération du mot de passe admin (récupération de l'existant si présent)
ADMIN_PASSWORD="amandine"

cat <<EOF > .env
DATABASE_URL="$DATABASE_URL"
NODE_ENV="production"
PORT=$APP_PORT
SESSION_SECRET="$(openssl rand -base64 32)"
ANALYTICS_SALT="$ANALYTICS_SALT"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
REPL_ID="vps-deploy"
ISSUER_URL="https://replit.com"
EOF

echo "✓ Fichier .env configuré avec succès"

echo "--- Installation des dépendances Node.js ---"
npm install

# S'assurer que dotenv est bien installé (nécessaire pour PM2)
if ! npm list dotenv &> /dev/null; then
    echo "Installation de dotenv..."
    npm install dotenv
fi

echo "--- Migration de la base de données ---"
echo "Vérification de l'état de la base de données..."

# Vérifier si les tables analytics existent
ANALYTICS_TABLES_EXIST=$(PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('analytics_pageviews', 'analytics_events');" || echo "0")

if [ "$ANALYTICS_TABLES_EXIST" = "2" ]; then
    echo "✓ Les tables analytics existent déjà"
else
    echo "⚠️  Les tables analytics n'existent pas, exécution de la migration..."
fi

# Exécuter la migration
if ! npm run db:push; then
    echo "ERREUR : La migration de la base de données a échoué."
    echo "Vérifiez que toutes les tables (incluant analytics_pageviews et analytics_events) ont été créées."
    exit 1
fi

# Vérifier que les tables analytics ont bien été créées
ANALYTICS_TABLES_FINAL=$(PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('analytics_pageviews', 'analytics_events');" || echo "0")

if [ "$ANALYTICS_TABLES_FINAL" = "2" ]; then
    echo "✓ Tables de base de données créées avec succès (incluant analytics)"
    
    # Vérifier la structure des tables
    echo "Vérification de la structure des tables analytics..."
    
    PAGEVIEWS_COLUMNS=$(PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'analytics_pageviews';" || echo "0")
    EVENTS_COLUMNS=$(PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'analytics_events';" || echo "0")
    
    echo "✓ analytics_pageviews : $PAGEVIEWS_COLUMNS colonnes"
    echo "✓ analytics_events : $EVENTS_COLUMNS colonnes"
    
    # Afficher la liste des colonnes pour débogage
    echo "
Structure de analytics_pageviews :"
    PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "\d analytics_pageviews" || true
    
    echo "
Structure de analytics_events :"
    PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "\d analytics_events" || true
else
    echo "⚠️  AVERTISSEMENT : Les tables analytics n'ont pas été créées correctement"
    echo "Nombre de tables trouvées : $ANALYTICS_TABLES_FINAL (attendu : 2)"
    echo "L'application fonctionnera mais l'analytics ne sera pas disponible."
fi

echo "--- Build de l'application ---"
if ! npm run build; then
    echo "ERREUR : Le build de l'application a échoué."
    exit 1
fi

echo "--- Lancement de l'application avec PM2 ---"
# Configuration du startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

# Suppression si déjà existant pour forcer la prise en compte du nouveau .env
pm2 delete fullstack-js-app 2>/dev/null || true

# Lancement avec dotenv en préchargement explicite
pm2 start dist/index.cjs \
  --name fullstack-js-app \
  --node-args="-r dotenv/config" \
  --cwd "$TARGET_DIR"

pm2 save

echo "--- Vérification du démarrage de l'application ---"
sleep 2
pm2 status
if pm2 status | grep -q "online"; then
    echo "✓ Application démarrée avec succès"
else
    echo "✗ L'application a rencontré un problème au démarrage"
    pm2 logs fullstack-js-app --lines 30
    exit 1
fi

echo "--- Configuration Nginx ---"
# On force la mise à jour de la config Nginx pour s'assurer du port
cat <<EOF | sudo tee /etc/nginx/sites-available/fullstack-js-app
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

if [ ! -f /etc/nginx/sites-enabled/fullstack-js-app ]; then
    sudo ln -sf /etc/nginx/sites-available/fullstack-js-app /etc/nginx/sites-enabled/
fi

sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "====================================="
echo "  DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "====================================="
echo ""
echo "L'application est accessible à l'adresse suivante :"
echo "  ➜ http://$IP_PUBLIQUE"
echo ""
echo "✓ Base de données : $DB_NAME"
if [ "$ANALYTICS_TABLES_FINAL" = "2" ]; then
    echo "✓ Analytics activé (sans cookie, conforme RGPD)"
else
    echo "⚠️  Analytics non disponible (tables non créées)"
fi
echo "✓ Reverse proxy Nginx configuré"
echo "✓ Application gérée par PM2"
echo ""
echo "====================================="
echo "  IDENTIFIANTS D'ADMINISTRATION"
echo "====================================="
echo ""
echo "URL de connexion : http://$IP_PUBLIQUE/login"
echo "Nom d'utilisateur : admin"
echo "Mot de passe : $ADMIN_PASSWORD"
echo ""
echo "⚠️  IMPORTANT : Notez ce mot de passe en lieu sûr !"
echo "Il est également stocké dans : $TARGET_DIR/.env"
echo ""
echo "====================================="
echo ""
echo "Commandes utiles :"
echo "  - Logs : pm2 logs fullstack-js-app"
echo "  - Statut : pm2 status"
echo "  - Redémarrage : pm2 restart fullstack-js-app"
if [ "$ANALYTICS_TABLES_FINAL" = "2" ]; then
    echo "  - Stats analytics : curl http://localhost:$APP_PORT/api/analytics/stats"
fi
echo "  - Voir le mot de passe admin : cat $TARGET_DIR/.env | grep ADMIN_PASSWORD"
echo ""
if [ "$ANALYTICS_TABLES_FINAL" != "2" ]; then
    echo "====================================="
    echo "  NOTE SUR L'ANALYTICS"
    echo "====================================="
    echo ""
    echo "Les tables analytics n'ont pas été créées automatiquement."
    echo "Pour activer l'analytics, exécutez manuellement :"
    echo ""
    echo "  cd $TARGET_DIR"
    echo "  npm run db:push"
    echo "  pm2 restart fullstack-js-app"
    echo ""
fi
