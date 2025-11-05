# Test Flashcards Data

Ce dossier contient trois fichiers CSV de test pour l'application de cartes mémoire.

## Fichiers disponibles

### 1. `test_flashcards.csv` (Complet - 96 cartes)
**Format:** `caractère,pinyin,zhuyin,signification`

Le fichier de test le plus complet avec:
- ✅ Pinyin ET Zhuyin (quand disponible)
- 🗣️ Salutations et expressions courantes
- 🔢 Chiffres (1-10)
- 🎨 Couleurs
- 🏃 Verbes d'action courants
- 📅 Jours de la semaine
- 👨‍👩‍👧‍👦 Membres de la famille
- 🍎 Nourriture et boissons
- 👤 Pronoms personnels
- 📏 Adjectifs (taille, vitesse, quantité)
- ⏰ Expressions temporelles
- 🏫 École et éducation
- 🏠 Maison et meubles
- ❤️ Verbes émotionnels

**Usage:**
```bash
# Importer via l'interface web: copier-coller ou upload CSV
```

### 2. `test_flashcards_pinyin_only.csv` (Pinyin uniquement - 20 cartes)
**Format:** `caractère,pinyin,signification`

Fichier simplifié avec seulement le pinyin:
- Salutations de base
- Verbes essentiels (être, avoir, aller, venir, faire)
- Verbes modaux (pouvoir, vouloir, devoir)
- Expressions négatives

Idéal pour tester:
- Import avec pinyin seulement
- Affichage sans zhuyin
- Compatibilité avec l'ancien format

### 3. `test_flashcards_zhuyin_only.csv` (Zhuyin uniquement - 20 cartes)
**Format:** `caractère,zhuyin,signification`

Fichier avec uniquement le zhuyin (bopomofo):
- Salutations de base
- Adjectifs descriptifs (beau, intelligent, mignon)
- États émotionnels (content, triste, en colère)
- États physiques (fatigué, affamé, assoiffé)

Idéal pour tester:
- Import avec zhuyin seulement
- Affichage sans pinyin
- Support complet du zhuyin

## Comment utiliser ces fichiers

### Via l'interface web

1. **Connexion:**
   - Créer un compte ou se connecter

2. **Import par copier-coller:**
   - Cliquer sur "Gérer les Cartes"
   - Ouvrir un fichier CSV dans un éditeur de texte
   - Copier tout le contenu
   - Coller dans la zone de texte
   - Cliquer sur "Importer depuis le texte"

3. **Import par fichier:**
   - Cliquer sur "Gérer les Cartes"
   - Cliquer sur "Télécharger un fichier CSV"
   - Sélectionner un des fichiers de test
   - Les cartes seront importées automatiquement

### Modes de jeu à tester

Une fois les cartes importées, testez tous les modes:

1. **📇 Révision des Cartes**
   - Système de répétition espacée
   - Affichage du caractère, puis révélation du pinyin/zhuyin et de la signification

2. **🎴 Jeu de Mémoire**
   - Associer les caractères avec leurs significations
   - Nécessite au moins 4 cartes

3. **🌟 Caractères Tombants**
   - Attraper le bon caractère basé sur le pinyin/zhuyin affiché
   - Mode arcade avec score

4. **✅ Choix Multiple**
   - Quiz avec 4 options
   - Test de reconnaissance

## Statistiques de test recommandées

Pour une session de test complète:

- **Minimum:** 10-15 cartes (test_flashcards_pinyin_only.csv)
- **Optimal:** 50-100 cartes (test_flashcards.csv)
- **Durée estimée:** 10-20 minutes par session complète

## Notes techniques

### Encodage
- Tous les fichiers sont en **UTF-8**
- Support complet des caractères chinois traditionnels
- Tons pinyin avec diacritiques (ā, á, ǎ, à)
- Symboles zhuyin complets (ㄅㄆㄇㄈ avec tons)

### Format CSV
Les fichiers supportent deux formats:

```csv
# Format 3 colonnes (pinyin OU zhuyin)
caractère,prononciation,signification

# Format 4 colonnes (pinyin ET zhuyin)
caractère,pinyin,zhuyin,signification
```

### Compatibilité
- ✅ Import/Export via l'interface web
- ✅ Édition manuelle dans n'importe quel éditeur de texte
- ✅ Compatible LibreOffice Calc, Excel, Google Sheets
- ✅ Support UTF-8 obligatoire

## Contribution

Pour ajouter de nouvelles cartes de test:

1. Respecter le format CSV
2. Utiliser des caractères traditionnels (繁體字)
3. Inclure les tons dans le pinyin (obligatoire)
4. Inclure les tons dans le zhuyin si disponible
5. Fournir des traductions françaises précises

## Problèmes connus

- Certains éditeurs CSV peuvent mal gérer l'UTF-8 → utiliser un éditeur de texte
- Excel peut nécessiter un import spécial pour UTF-8
- Toujours vérifier que les tons sont correctement affichés

## Licence

Ces données de test sont fournies à titre éducatif et peuvent être modifiées librement.
