# Guide de Configuration HTTPS

Ce guide vous explique comment configurer HTTPS sur votre site web avec un certificat SSL gratuit de Let's Encrypt.

## 🔒 Prérequis

### 1. Nom de domaine
Vous devez posséder un nom de domaine (ex: `monsite.com`, `guidetours.fr`, etc.)

### 2. Configuration DNS
Votre domaine doit pointer vers l'IP de votre VPS :

**Chez votre registrar (OVH, Gandi, etc.), créez :**
```
Type A  : monsite.com          → 123.45.67.89 (votre IP VPS)
Type A  : www.monsite.com      → 123.45.67.89 (votre IP VPS)
```

**Vérifier la propagation DNS :**
```bash
dig monsite.com
# ou
nslookup monsite.com
```

### 3. Ports ouverts
Le pare-feu doit autoriser les ports 80 (HTTP) et 443 (HTTPS) :
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

## 🚀 Méthode 1 : Script Automatique (Recommandé)

### Étape 1 : Télécharger le script

```bash
# Se connecter au VPS en SSH
ssh user@votre-vps

# Télécharger le script
wget https://raw.githubusercontent.com/vinste/guide/main/setup-ssl.sh
chmod +x setup-ssl.sh
```

### Étape 2 : Exécuter le script

```bash
sudo ./setup-ssl.sh
```

### Étape 3 : Suivre les instructions

Le script vous demandera :
1. **Votre nom de domaine** (ex: `monsite.com`)
2. **Votre adresse email** (pour les notifications Let's Encrypt)

### Étape 4 : C'est fait !

Le script va :
- ✅ Vérifier la configuration DNS
- ✅ Installer Certbot
- ✅ Configurer Nginx
- ✅ Obtenir le certificat SSL
- ✅ Activer HTTPS
- ✅ Configurer le renouvellement automatique
- ✅ Rediriger HTTP vers HTTPS

## 🛠️ Méthode 2 : Configuration Manuelle

### Étape 1 : Installer Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Étape 2 : Mettre à jour la configuration Nginx

Modifier `/etc/nginx/sites-available/fullstack-js-app` :

```nginx
server {
    listen 80;
    server_name monsite.com www.monsite.com;  # Remplacer par votre domaine

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Étape 3 : Tester et recharger Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Étape 4 : Obtenir le certificat SSL

```bash
sudo certbot --nginx -d monsite.com -d www.monsite.com
```

Certbot vous demandera :
1. Votre adresse email
2. D'accepter les conditions d'utilisation
3. Si vous voulez rediriger automatiquement HTTP vers HTTPS (répondez **Oui**)

### Étape 5 : Vérifier la configuration

```bash
# Vérifier les certificats installés
sudo certbot certificates

# Tester le renouvellement automatique
sudo certbot renew --dry-run
```

## 🔄 Renouvellement Automatique

Let's Encrypt délivre des certificats valides **90 jours**. Certbot configure automatiquement un timer systemd pour renouveler les certificats.

### Vérifier le timer

```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

### Activer le renouvellement automatique

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Tester le renouvellement manuellement

```bash
sudo certbot renew --dry-run
```

### Forcer le renouvellement (si nécessaire)

```bash
sudo certbot renew --force-renewal
```

## ✅ Vérification

### 1. Tester l'accès HTTPS

```bash
curl -I https://monsite.com
```

Vous devriez voir `HTTP/2 200` ou `HTTP/1.1 200`

### 2. Vérifier la redirection HTTP → HTTPS

```bash
curl -I http://monsite.com
```

Vous devriez voir un code `301` ou `302` redirigeant vers `https://`

### 3. Tester dans un navigateur

Ouvrez votre site :
- `https://monsite.com`
- `https://www.monsite.com`

Vous devriez voir un **cadenas vert** 🔒 dans la barre d'adresse.

### 4. Vérifier la note SSL

Testez votre configuration SSL sur :
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

## 💡 Configuration Nginx Après Certbot

Après l'exécution de Certbot, votre configuration Nginx ressemblera à ceci :

```nginx
server {
    listen 80;
    server_name monsite.com www.monsite.com;
    
    # Redirection automatique vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monsite.com www.monsite.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/monsite.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monsite.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 Dépannage

### Erreur : "Certbot failed to authenticate"

**Cause** : Le domaine ne pointe pas vers le bon serveur ou le port 80 est inaccessible.

**Solution** :
```bash
# Vérifier le DNS
dig monsite.com

# Vérifier que Nginx écoute sur le port 80
sudo netstat -tlnp | grep :80

# Vérifier le pare-feu
sudo ufw status
sudo ufw allow 80/tcp

# Tester l'accès depuis l'extérieur
curl -I http://monsite.com
```

### Erreur : "Too many certificates already issued"

**Cause** : Let's Encrypt limite à 5 certificats par domaine par semaine.

**Solution** : Attendre une semaine ou utiliser un sous-domaine différent.

### Le certificat n'est pas reconnu par le navigateur

**Cause** : Le certificat n'inclut pas tous les domaines nécessaires.

**Solution** : Regénérer le certificat avec tous les domaines :
```bash
sudo certbot --nginx -d monsite.com -d www.monsite.com --force-renewal
```

### Erreur : "Connection refused" après configuration SSL

**Cause** : Nginx n'a pas redémarré correctement.

**Solution** :
```bash
# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier les logs
sudo journalctl -u nginx -n 50
```

### Le renouvellement automatique ne fonctionne pas

**Vérifier le timer :**
```bash
sudo systemctl status certbot.timer
```

**Réactiver le timer :**
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

**Tester manuellement :**
```bash
sudo certbot renew --dry-run
```

## 📝 Commandes Utiles

### Gestion des certificats

```bash
# Lister tous les certificats
sudo certbot certificates

# Renouveler tous les certificats
sudo certbot renew

# Tester le renouvellement sans appliquer
sudo certbot renew --dry-run

# Révoquer un certificat
sudo certbot revoke --cert-path /etc/letsencrypt/live/monsite.com/cert.pem

# Supprimer un certificat
sudo certbot delete --cert-name monsite.com
```

### Logs et diagnostics

```bash
# Logs Certbot
sudo journalctl -u certbot
sudo cat /var/log/letsencrypt/letsencrypt.log

# Logs Nginx
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger (sans interruption)
sudo systemctl reload nginx

# Redémarrer (avec interruption)
sudo systemctl restart nginx

# Statut
sudo systemctl status nginx
```

## 🛡️ Sécurité Avancée (Optionnel)

### Activer HTTP/2

HTTP/2 est automatiquement activé par Certbot. Vérifier :
```bash
curl -I --http2 https://monsite.com | grep HTTP
```

### Activer HSTS (HTTP Strict Transport Security)

Ajouter dans la configuration Nginx :
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Score SSL/TLS optimal

Les paramètres optimaux sont déjà configurés par Certbot dans :
```
/etc/letsencrypt/options-ssl-nginx.conf
```

## 🔗 Ressources

- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

## ❓ Questions Fréquentes

### Le certificat est-il vraiment gratuit ?
Oui ! Let's Encrypt fournit des certificats SSL/TLS gratuits, reconnus par tous les navigateurs.

### Combien de temps dure le certificat ?
90 jours. Le renouvellement automatique se fait tous les 60 jours.

### Puis-je utiliser plusieurs domaines ?
Oui ! Exemple :
```bash
sudo certbot --nginx -d monsite.com -d www.monsite.com -d blog.monsite.com
```

### Que se passe-t-il si le renouvellement échoue ?
Vous recevrez un email d'avertissement à l'adresse fournie lors de la configuration.

### Puis-je utiliser un wildcard (*.monsite.com) ?
Oui, mais cela nécessite une validation DNS :
```bash
sudo certbot certonly --manual --preferred-challenges dns -d "*.monsite.com"
```

---

**Votre site est maintenant sécurisé avec HTTPS !** 🔒✨
