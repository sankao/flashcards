# Aventure des Caractères Chinois (Chinese Character Adventure)

Une application web de cartes mémoire pour apprendre les caractères chinois avec plusieurs modes de jeu interactifs.

## Fonctionnalités

- **Authentification utilisateur** : Inscription et connexion sécurisées avec mots de passe hachés
- **Système de répétition espacée** : Optimise l'apprentissage avec des intervalles de révision intelligents
- **Plusieurs modes de jeu** :
  - Révision des cartes classique
  - Jeu de mémoire (associer les paires)
  - Caractères tombants
  - Quiz à choix multiple
- **Gestion des cartes** : Import CSV, ajout manuel, suppression
- **Suivi des progrès** : Statistiques, séries, scores

## Installation

### Prérequis

- Python 3.7 ou supérieur
- [uv](https://github.com/astral-sh/uv) (recommandé) ou pip

### Installation avec uv (Recommandé)

1. Installer uv si ce n'est pas déjà fait :
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Créer et activer l'environnement virtuel :
```bash
source setup_env.sh
```

Ce script va automatiquement :
- Créer un environnement virtuel `flashcards_env` (si nécessaire)
- Activer l'environnement
- Installer toutes les dépendances depuis `pyproject.toml`

3. Lancer l'application :
```bash
python app.py
```

4. Ouvrir votre navigateur à l'adresse :
```
http://localhost:5000
```

### Installation classique avec pip

1. Créer un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Sur Linux/Mac
# ou
venv\Scripts\activate  # Sur Windows
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Lancer l'application :
```bash
python app.py
```

4. Ouvrir votre navigateur à l'adresse :
```
http://localhost:5000
```

## Premier lancement

1. Vous serez automatiquement redirigé vers la page de connexion
2. Cliquez sur "Créer un compte"
3. Entrez un nom d'utilisateur et un mot de passe
4. Cliquez sur "S'inscrire"

Vous pouvez maintenant commencer à ajouter des cartes et à apprendre !

## Structure de la base de données

La base de données SQLite (`flashcards.db`) contient deux tables :

- **users** : Stocke les informations des utilisateurs (nom, mot de passe haché)
- **flashcards** : Stocke les cartes mémoire avec les données de progression

## Format d'importation CSV

Pour importer des cartes en masse, utilisez un fichier CSV avec l'un de ces formats :

**Format avec Pinyin uniquement :**
```
caractère,pinyin,signification
你好,nǐ hǎo,bonjour
謝謝,xièxie,merci
再見,zàijiàn,au revoir
```

**Format avec Zhuyin (bopomofo) uniquement :**
```
caractère,zhuyin,signification
你好,ㄋㄧˇ ㄏㄠˇ,bonjour
謝謝,ㄒㄧㄝˋ ㄒㄧㄝ˙,merci
再見,ㄗㄞˋ ㄐㄧㄢˋ,au revoir
```

**Format avec les deux (Pinyin et Zhuyin) :**
```
caractère,pinyin,zhuyin,signification
你好,nǐ hǎo,ㄋㄧˇ ㄏㄠˇ,bonjour
謝謝,xièxie,ㄒㄧㄝˋ ㄒㄧㄝ˙,merci
再見,zàijiàn,ㄗㄞˋ ㄐㄧㄢˋ,au revoir
```

Au moins un système de prononciation (pinyin ou zhuyin) doit être fourni.

## Sécurité

- Les mots de passe sont hachés avec SHA-256
- Les sessions utilisateur sont gérées de manière sécurisée avec Flask
- Chaque utilisateur ne peut accéder qu'à ses propres cartes

## Technologies utilisées

- **Backend** : Flask (Python)
- **Base de données** : SQLite3
- **Frontend** : HTML, CSS, JavaScript vanilla
- **Authentification** : Sessions Flask avec mots de passe hachés
