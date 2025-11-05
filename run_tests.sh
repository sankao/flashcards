#!/bin/bash

# Script to run the test suite
# Usage: ./run_tests.sh [options]

echo "🧪 Lancement de la suite de tests..."
echo ""

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Environnement virtuel non activé."
    echo "💡 Exécutez: source setup_env.sh"
    echo ""
    exit 1
fi

# Check if pytest is installed
if ! python -c "import pytest" 2>/dev/null; then
    echo "📦 Installation de pytest..."
    uv pip install pytest pytest-cov
    echo ""
fi

# Default: run tests with verbose output
if [ "$1" == "--coverage" ]; then
    echo "📊 Exécution avec rapport de couverture..."
    pytest test_app.py -v --cov=app --cov-report=term-missing
elif [ "$1" == "--quiet" ]; then
    echo "🤫 Exécution silencieuse..."
    pytest test_app.py -q
elif [ "$1" == "--failed" ]; then
    echo "🔄 Ré-exécution des tests échoués..."
    pytest test_app.py -v --lf
else
    echo "🚀 Exécution de tous les tests..."
    pytest test_app.py -v
fi

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
    echo "✅ Tous les tests sont passés avec succès!"
else
    echo "❌ Certains tests ont échoué."
fi

echo ""
echo "💡 Options disponibles:"
echo "   ./run_tests.sh              - Tests verbeux (défaut)"
echo "   ./run_tests.sh --coverage   - Avec couverture de code"
echo "   ./run_tests.sh --quiet      - Mode silencieux"
echo "   ./run_tests.sh --failed     - Ré-exécuter les tests échoués"

exit $exit_code
