#!/bin/bash

# Script to create or activate uv virtual environment
# Usage: source setup_env.sh

ENV_NAME="flashcards_env"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv n'est pas installé. Veuillez l'installer d'abord:"
    echo "   curl -LsSf https://astral.sh/uv/install.sh | sh"
    return 1
fi

# Check if virtual environment exists
if [ -d "$ENV_NAME" ]; then
    echo "✅ Environnement virtuel '$ENV_NAME' trouvé."
    echo "🔄 Activation de l'environnement..."
    source "$ENV_NAME/bin/activate"
    echo "✅ Environnement activé!"
else
    echo "📦 Création de l'environnement virtuel '$ENV_NAME'..."
    uv venv "$ENV_NAME"

    if [ $? -eq 0 ]; then
        echo "✅ Environnement créé avec succès!"
        echo "🔄 Activation de l'environnement..."
        source "$ENV_NAME/bin/activate"
        echo "✅ Environnement activé!"

        echo "📥 Installation des dépendances..."
        uv pip install flask

        if [ $? -eq 0 ]; then
            echo "✅ Dépendances installées avec succès!"
        else
            echo "❌ Erreur lors de l'installation des dépendances"
            return 1
        fi
    else
        echo "❌ Erreur lors de la création de l'environnement"
        return 1
    fi
fi

echo ""
echo "🎉 Environnement prêt!"
echo "💡 Pour lancer l'application: python app.py"
echo "💡 Pour désactiver l'environnement: deactivate"
