# Dossier Images du Site

Ce dossier contient toutes les images utilisées sur le site web.

## 📁 Structure des Dossiers

```
public/images/
├── hero/              # Images pour la section hero/bannière
├── tours/             # Photos des visites guidées
├── blog/              # Images pour les articles de blog
├── about/             # Photos de la guide (Amandine)
├── testimonials/      # Photos des clients (optionnel)
├── gallery/           # Galerie de photos
├── icons/             # Icônes et logos
└── placeholder/       # Images placeholder pour le développement
```

## 💾 Formats et Tailles Recommandés

### Images Hero/Bannière
- **Format** : JPG ou WebP
- **Taille** : 1920x1080px ou 2560x1440px
- **Poids** : < 500 KB (optimisé)
- **Exemples** :
  - `hero-lyon.jpg` - Vue panoramique de Lyon
  - `hero-beaujolais.jpg` - Vignobles du Beaujolais
  - `hero-traboules.jpg` - Traboules de Lyon

### Photos des Visites
- **Format** : JPG ou WebP
- **Taille** : 1200x800px (ratio 3:2)
- **Poids** : < 300 KB par image
- **Exemples** :
  - `tour-vieux-lyon.jpg`
  - `tour-croix-rousse.jpg`
  - `tour-beaujolais.jpg`
  - `tour-gastro.jpg`

### Images de Blog
- **Format** : JPG ou WebP
- **Taille** : 1200x630px (ratio Open Graph)
- **Poids** : < 250 KB
- **Convention de nommage** : `blog-{slug}-{numero}.jpg`
  - `blog-histoire-lyon-01.jpg`
  - `blog-vignobles-beaujolais-01.jpg`

### Photos de la Guide
- **Format** : JPG de haute qualité
- **Taille** : 800x800px (carré) pour avatar
- **Taille** : 1200x800px pour photo complète
- **Poids** : < 200 KB
- **Exemples** :
  - `amandine-portrait.jpg`
  - `amandine-guide.jpg`
  - `amandine-vignobles.jpg`

### Icônes et Logos
- **Format** : SVG (vectoriel) ou PNG avec transparence
- **Tailles** : 
  - Logo : 200x200px minimum (SVG préféré)
  - Favicon : 32x32px, 48x48px, 192x192px, 512x512px
  - Icônes : SVG ou PNG 64x64px
- **Exemples** :
  - `logo.svg`
  - `logo-white.svg`
  - `favicon.ico`
  - `icon-tour.svg`
  - `icon-wine.svg`

### Images Placeholder
- Images temporaires pour le développement
- Peuvent être remplacées par de vraies photos plus tard
- Utilisent le service [Unsplash](https://unsplash.com/) ou [Lorem Picsum](https://picsum.photos/)

## 🛠️ Optimisation des Images

### Outils Recommandés

1. **En ligne**
   - [TinyPNG](https://tinypng.com/) - Compression JPG/PNG
   - [Squoosh](https://squoosh.app/) - Conversion WebP et optimisation
   - [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimisation SVG

2. **Ligne de commande**
   ```bash
   # Installer ImageMagick
   sudo apt install imagemagick
   
   # Redimensionner une image
   convert input.jpg -resize 1200x800 -quality 85 output.jpg
   
   # Convertir en WebP
   cwebp -q 85 input.jpg -o output.webp
   ```

3. **Automatique avec npm**
   ```bash
   npm install -D sharp
   ```

### Script d'Optimisation

Créez `scripts/optimize-images.js` :

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/images/original';
const outputDir = './public/images';

fs.readdirSync(inputDir).forEach(file => {
  if (file.match(/\.(jpg|jpeg|png)$/i)) {
    sharp(path.join(inputDir, file))
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(path.join(outputDir, file))
      .then(() => console.log(`Optimisé: ${file}`));
  }
});
```

## 📝 Convention de Nommage

### Règles Générales
- Tout en **minuscules**
- Utiliser des **tirets** pour séparer les mots (pas d'espaces ni underscores)
- Noms **descriptifs** et **explicites**
- Inclure la **résolution** si plusieurs versions : `image-1200w.jpg`, `image-800w.jpg`

### Exemples

✅ **Bon**
```
hero-lyon-panorama.jpg
tour-vieux-lyon-traboules.jpg
amandine-portrait-2024.jpg
blog-histoire-lyon-featured.jpg
```

❌ **Mauvais**
```
IMG_1234.jpg
photo finale version 2.jpg
Sans titre.png
image1.jpg
```

## 🔗 Utilisation dans le Code

### React/Vite

```tsx
// Import direct
import heroImage from '@/assets/images/hero/lyon-panorama.jpg';

// Utilisation
<img src={heroImage} alt="Vue panoramique de Lyon" />

// Ou chemin public
<img src="/images/hero/lyon-panorama.jpg" alt="Vue panoramique de Lyon" />
```

### Avec Lazy Loading

```tsx
<img 
  src="/images/tours/vieux-lyon.jpg" 
  alt="Visite du Vieux Lyon"
  loading="lazy"
  width="1200"
  height="800"
/>
```

### Images Responsives

```tsx
<picture>
  <source 
    srcSet="/images/hero/lyon-1920w.webp" 
    type="image/webp" 
    media="(min-width: 1200px)" 
  />
  <source 
    srcSet="/images/hero/lyon-1200w.webp" 
    type="image/webp" 
    media="(min-width: 768px)" 
  />
  <img 
    src="/images/hero/lyon-800w.jpg" 
    alt="Lyon" 
    loading="lazy"
  />
</picture>
```

## 🎨 Sources d'Images Gratuites

Pour trouver des images de qualité et libres de droits :

### Photos Professionnelles
- [Unsplash](https://unsplash.com/) - Photos haute résolution gratuites
- [Pexels](https://www.pexels.com/) - Photos et vidéos gratuites
- [Pixabay](https://pixabay.com/) - Images, illustrations, vecteurs

### Recherche Spécifique Lyon/Beaujolais
```
Mots-clés Unsplash :
- "Lyon France"
- "Beaujolais vineyard"
- "French wine region"
- "Historic Lyon"
- "Traboules Lyon"
```

### Icônes
- [Lucide Icons](https://lucide.dev/) - Déjà utilisé dans le projet
- [Heroicons](https://heroicons.com/) - Icônes SVG
- [Font Awesome](https://fontawesome.com/) - Bibliothèque d'icônes

## 📊 Performance

### Checklist d'Optimisation

- [ ] Images compressées (< 500 KB pour hero, < 300 KB pour le reste)
- [ ] Format WebP utilisé avec fallback JPG
- [ ] Attributs `width` et `height` définis (prévient le layout shift)
- [ ] Attribut `loading="lazy"` sur les images hors viewport
- [ ] Attributs `alt` définis pour l'accessibilité
- [ ] Images responsives avec `<picture>` ou `srcset`
- [ ] Pas d'images plus grandes que nécessaire

### Test de Performance

Utilisez ces outils pour tester :
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- Chrome DevTools > Lighthouse

## 💾 Gestion du Cache

### Headers Nginx (déjà configurés)

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Versioning des Images

Si vous modifiez une image, changez son nom :
```
hero-lyon.jpg       → hero-lyon-v2.jpg
logo.svg            → logo-2024.svg
```

## ⚙️ Intégration avec Git

### .gitignore pour Images Temporaires

Ajoutez dans `.gitignore` :
```
# Images originales non optimisées
public/images/original/

# Fichiers temporaires
*.tmp
*.cache
Thumbs.db
.DS_Store
```

### Git LFS (optionnel pour grandes images)

Si vous avez beaucoup d'images volumineuses :
```bash
git lfs install
git lfs track "*.jpg"
git lfs track "*.png"
git add .gitattributes
```

## 📝 TODO

- [ ] Ajouter images hero pour la page d'accueil
- [ ] Photos des différentes visites guidées
- [ ] Portrait professionnel d'Amandine
- [ ] Logo du site (SVG)
- [ ] Favicon (multiple tailles)
- [ ] Images pour les 3-5 premiers articles de blog
- [ ] Galerie de photos de Lyon et Beaujolais

## 📞 Contact

Pour toute question concernant les images :
- Formats recommandés : WebP avec fallback JPG
- Qualité : 85% pour JPG, 85-90% pour WebP
- Toujours inclure un attribut `alt` descriptif

---

**Dernière mise à jour** : 26 janvier 2026
