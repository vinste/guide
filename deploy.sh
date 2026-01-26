#!/bin/bash

# Script de déploiement pour VPS OVH (Ubuntu 25.04)
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

# Récupération de l'IP publique avec fallback
IP_PUBLIQUE=$(curl -s --max-time 5 https://ifconfig.me || curl -s --max-time 5 https://api.ipify.org || echo "VOTRE_IP_VPS")

echo "--- Mise à jour du système ---"
sudo apt update && sudo apt upgrade -y

echo "--- Installation des dépendances système ---"
sudo apt install -y curl git build-essential nginx postgresql postgresql-contrib ufw

echo "--- Configuration du Pare-feu (UFW) ---"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

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
    # On s'assure d'être sur la bonne branche et de nettoyer les changements locaux si nécessaire
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
        DB_PASS=$(grep DATABASE_URL .env | sed -e 's/.*:\(.*\)@.*/\1/' || echo "ERREUR_PASSWORD")
    else
        DB_PASS=$(openssl rand -base64 12)
        echo "Réinitialisation du mot de passe pour l'utilisateur existant..."
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
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
    cat <<EOF > .env
DATABASE_URL="$DATABASE_URL"
NODE_ENV="production"
SESSION_SECRET="$(openssl rand -base64 32)"
REPL_ID="vps-deploy"
ISSUER_URL="https://replit.com"
EOF
else
    echo "Le fichier .env existe déjà."
fi

echo "--- Installation des dépendances Node.js ---"
npm install

echo "--- Migration de la base de données ---"
if ! npm run db:push; then
    echo "ERREUR : La migration de la base de données a échoué."
    exit 1
fi

echo "--- Build de l'application ---"
if ! npm run build; then
    echo "ERREUR : Le build de l'application a échoué."
    exit 1
fi

echo "--- Lancement de l'application avec PM2 ---"
# Configuration du startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

if pm2 list | grep -q "fullstack-js-app"; then
    pm2 restart "fullstack-js-app"
else
    pm2 start dist/index.cjs --name "fullstack-js-app"
fi
pm2 save

echo "--- Configuration Nginx ---"
if [ ! -f /etc/nginx/sites-available/fullstack-js-app ]; then
    cat <<EOF | sudo tee /etc/nginx/sites-available/fullstack-js-app
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    sudo ln -sf /etc/nginx/sites-available/fullstack-js-app /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
fi

echo "--- Déploiement terminé avec succès ! ---"
echo "L'application est accessible à l'adresse suivante :"
echo "http://$IP_PUBLIQUE"
