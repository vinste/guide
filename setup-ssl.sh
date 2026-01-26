#!/bin/bash

# Script de configuration SSL/HTTPS avec Let's Encrypt
# Pour site web sur VPS Ubuntu avec Nginx

set -euo pipefail

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Configuration SSL/HTTPS${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Vérifier que le script est exécuté en tant que root ou avec sudo
if [ "$EUID" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Demander le nom de domaine
echo -e "${YELLOW}Avant de continuer, assurez-vous que :${NC}"
echo "  1. Vous avez un nom de domaine (ex: monsite.com)"
echo "  2. Le domaine pointe vers l'IP de ce serveur (enregistrement DNS A)"
echo "  3. Le port 80 est ouvert et accessible depuis Internet"
echo ""
read -p "Entrez votre nom de domaine (ex: monsite.com) : " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Erreur : Le nom de domaine ne peut pas être vide${NC}"
    exit 1
fi

# Demander l'email pour Let's Encrypt
read -p "Entrez votre adresse email (pour les notifications SSL) : " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Erreur : L'adresse email ne peut pas être vide${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Configuration :${NC}"
echo "  Domaine : $DOMAIN_NAME"
echo "  Email : $EMAIL"
echo ""
read -p "Continuer ? (o/N) : " CONFIRM

if [[ ! $CONFIRM =~ ^[Oo]$ ]]; then
    echo "Opération annulée"
    exit 0
fi

echo ""
echo "--- Vérification de la configuration DNS ---"
DOMAIN_IP=$(dig +short "$DOMAIN_NAME" | tail -n1)
SERVER_IP=$(curl -s https://ifconfig.me)

if [ -z "$DOMAIN_IP" ]; then
    echo -e "${RED}⚠️  Le domaine $DOMAIN_NAME ne résout pas vers une IP${NC}"
    echo "Vérifiez votre configuration DNS avant de continuer."
    read -p "Continuer quand même ? (o/N) : " FORCE_CONTINUE
    if [[ ! $FORCE_CONTINUE =~ ^[Oo]$ ]]; then
        exit 1
    fi
elif [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo -e "${YELLOW}⚠️  Le domaine pointe vers $DOMAIN_IP mais ce serveur a l'IP $SERVER_IP${NC}"
    echo "Assurez-vous que le DNS est correctement configuré."
    read -p "Continuer quand même ? (o/N) : " FORCE_CONTINUE
    if [[ ! $FORCE_CONTINUE =~ ^[Oo]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Le domaine $DOMAIN_NAME pointe correctement vers $SERVER_IP${NC}"
fi

echo ""
echo "--- Installation de Certbot ---"
if ! command -v certbot &> /dev/null; then
    echo "Installation de Certbot..."
    $SUDO apt update
    $SUDO apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✓ Certbot est déjà installé${NC}"
fi

echo ""
echo "--- Mise à jour de la configuration Nginx ---"

# Sauvegarder l'ancienne configuration
if [ -f /etc/nginx/sites-available/fullstack-js-app ]; then
    $SUDO cp /etc/nginx/sites-available/fullstack-js-app /etc/nginx/sites-available/fullstack-js-app.backup
    echo "✓ Ancienne configuration sauvegardée"
fi

# Créer la nouvelle configuration avec le nom de domaine
cat <<EOF | $SUDO tee /etc/nginx/sites-available/fullstack-js-app
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:5000;
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

echo "✓ Configuration Nginx mise à jour avec le nom de domaine"

# Tester la configuration Nginx
if $SUDO nginx -t; then
    echo -e "${GREEN}✓ Configuration Nginx valide${NC}"
    $SUDO systemctl reload nginx
else
    echo -e "${RED}✗ Erreur dans la configuration Nginx${NC}"
    echo "Restauration de l'ancienne configuration..."
    if [ -f /etc/nginx/sites-available/fullstack-js-app.backup ]; then
        $SUDO mv /etc/nginx/sites-available/fullstack-js-app.backup /etc/nginx/sites-available/fullstack-js-app
        $SUDO systemctl reload nginx
    fi
    exit 1
fi

echo ""
echo "--- Obtention du certificat SSL ---"
echo "Certbot va maintenant obtenir un certificat SSL gratuit pour votre domaine."
echo "Cela peut prendre quelques instants..."
echo ""

# Obtenir le certificat avec certbot
if $SUDO certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos --email "$EMAIL" --redirect; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}  SSL CONFIGURÉ AVEC SUCCÈS !${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Votre site est maintenant accessible en HTTPS :"
    echo -e "  ➜ ${GREEN}https://$DOMAIN_NAME${NC}"
    echo -e "  ➜ ${GREEN}https://www.$DOMAIN_NAME${NC}"
    echo ""
    echo "Le certificat SSL est valide pendant 90 jours."
    echo "Certbot renouvellera automatiquement le certificat avant expiration."
    echo ""
    echo "Vérification du renouvellement automatique..."
    if $SUDO systemctl list-timers | grep -q certbot; then
        echo -e "${GREEN}✓ Renouvellement automatique activé${NC}"
    else
        echo -e "${YELLOW}⚠️  Configuration du renouvellement automatique...${NC}"
        $SUDO systemctl enable certbot.timer
        $SUDO systemctl start certbot.timer
        echo -e "${GREEN}✓ Renouvellement automatique configuré${NC}"
    fi
    echo ""
    echo "Pour tester le renouvellement manuellement :"
    echo "  sudo certbot renew --dry-run"
    echo ""
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}  ERREUR DE CONFIGURATION SSL${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    echo "Certbot n'a pas pu obtenir le certificat SSL."
    echo ""
    echo "Vérifications possibles :"
    echo "  1. Le domaine $DOMAIN_NAME pointe-t-il bien vers ce serveur ?"
    echo "     dig $DOMAIN_NAME"
    echo ""
    echo "  2. Le port 80 est-il accessible depuis Internet ?"
    echo "     curl -I http://$DOMAIN_NAME"
    echo ""
    echo "  3. Le pare-feu autorise-t-il le port 80 ?"
    echo "     sudo ufw status"
    echo ""
    echo "Restauration de l'ancienne configuration..."
    if [ -f /etc/nginx/sites-available/fullstack-js-app.backup ]; then
        $SUDO mv /etc/nginx/sites-available/fullstack-js-app.backup /etc/nginx/sites-available/fullstack-js-app
        $SUDO systemctl reload nginx
        echo "✓ Configuration restaurée"
    fi
    exit 1
fi

echo "--- Test de la configuration HTTPS ---"
echo "Vérification que le site répond en HTTPS..."
if curl -sSf -o /dev/null "https://$DOMAIN_NAME"; then
    echo -e "${GREEN}✓ Le site répond correctement en HTTPS${NC}"
else
    echo -e "${YELLOW}⚠️  Le site ne répond pas encore en HTTPS${NC}"
    echo "Attendez quelques secondes et réessayez."
fi

echo ""
echo "====================================="
echo "  INFORMATIONS UTILES"
echo "====================================="
echo ""
echo "Certificats SSL stockés dans :"
echo "  /etc/letsencrypt/live/$DOMAIN_NAME/"
echo ""
echo "Configuration Nginx :"
echo "  /etc/nginx/sites-available/fullstack-js-app"
echo ""
echo "Commandes utiles :"
echo "  - Vérifier les certificats : sudo certbot certificates"
echo "  - Renouveler manuellement : sudo certbot renew"
echo "  - Tester le renouvellement : sudo certbot renew --dry-run"
echo "  - Logs Certbot : sudo journalctl -u certbot"
echo ""
