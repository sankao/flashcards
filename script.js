// Data structure for flashcards
let flashcards = [];
let currentGame = null;
let currentCardIndex = 0;
let sessionStats = {
    correct: 0,
    incorrect: 0,
    streak: 0
};

// Initialize
window.onload = function() {
    loadData();
    updateStats();
    if (flashcards.length > 0) {
        goToMenu();
    }
};

// Data Management
function loadData() {
    const saved = localStorage.getItem('chineseFlashcards');
    if (saved) {
        flashcards = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem('chineseFlashcards', JSON.stringify(flashcards));
    updateStats();
}

function importPastedData() {
    const text = document.getElementById('pasteInput').value;
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
            addCard(parts[0], parts[1], parts[2]);
        }
    });

    document.getElementById('pasteInput').value = '';
    updateCardList();
}

function importCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        lines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 3) {
                addCard(parts[0], parts[1], parts[2]);
            }
        });

        updateCardList();
    };

    reader.readAsText(file);
}

function addManualCard() {
    const char = document.getElementById('manualChar').value.trim();
    const pinyin = document.getElementById('manualPinyin').value.trim();
    const meaning = document.getElementById('manualMeaning').value.trim();

    if (char && pinyin && meaning) {
        addCard(char, pinyin, meaning);
        document.getElementById('manualChar').value = '';
        document.getElementById('manualPinyin').value = '';
        document.getElementById('manualMeaning').value = '';
        updateCardList();
    }
}

function addCard(character, pinyin, meaning) {
    const card = {
        character,
        pinyin,
        meaning,
        level: 0,
        lastReview: null,
        nextReview: new Date().toISOString(),
        correctCount: 0,
        incorrectCount: 0,
        streak: 0
    };
    flashcards.push(card);
    saveData();
}

function updateCardList() {
    const list = document.getElementById('cardList');
    list.innerHTML = '<h3 style="color: #667eea;">Cartes Actuelles :</h3>';

    flashcards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <span><strong>${card.character}</strong> (${card.pinyin}) - ${card.meaning}</span>
            <button class="btn btn-secondary" style="padding: 5px 15px; margin: 0;" onclick="removeCard(${index})">Supprimer</button>
        `;
        list.appendChild(item);
    });

    document.getElementById('startBtn').disabled = flashcards.length === 0;
}

function removeCard(index) {
    flashcards.splice(index, 1);
    saveData();
    updateCardList();
}

function exportData() {
    const csvContent = flashcards.map(card =>
        `${card.character},${card.pinyin},${card.meaning}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chinese_flashcards.csv';
    a.click();
}

function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les cartes et la progression ?')) {
        flashcards = [];
        sessionStats = { correct: 0, incorrect: 0, streak: 0 };
        localStorage.clear();
        updateStats();
        updateCardList();
    }
}

// Navigation
function goToSetup() {
    document.getElementById('setupScreen').classList.remove('hidden');
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    updateCardList();
}

function goToMenu() {
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    updateDueCards();
}

function startLearning() {
    if (flashcards.length > 0) {
        goToMenu();
    }
}

function returnToMenu() {
    goToMenu();
}

// Stats
function updateStats() {
    document.getElementById('totalCards').textContent = flashcards.length;
    const totalStreak = flashcards.reduce((sum, card) => sum + card.streak, 0);
    document.getElementById('streak').textContent = totalStreak;
    const totalCorrect = flashcards.reduce((sum, card) => sum + card.correctCount, 0);
    document.getElementById('score').textContent = totalCorrect;

    const today = new Date().toDateString();
    const todayReviews = flashcards.filter(card =>
        card.lastReview && new Date(card.lastReview).toDateString() === today
    ).length;
    document.getElementById('todayReviews').textContent = todayReviews;
}

function updateDueCards() {
    const now = new Date();
    const due = flashcards.filter(card => new Date(card.nextReview) <= now).length;
    document.getElementById('dueCards').textContent = due;
}

// Spaced Repetition Logic
function getIntervalDays(level) {
    const intervals = [0, 1, 3, 7, 14, 30, 60, 120];
    return intervals[Math.min(level, intervals.length - 1)];
}

function cardAnswered(card, correct) {
    const now = new Date();
    card.lastReview = now.toISOString();

    if (correct) {
        card.correctCount++;
        card.level = Math.min(card.level + 1, 7);
        card.streak++;
        sessionStats.correct++;
        sessionStats.streak++;
    } else {
        card.incorrectCount++;
        card.level = 0;
        card.streak = 0;
        sessionStats.incorrect++;
        sessionStats.streak = 0;
    }

    const daysToAdd = getIntervalDays(card.level);
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    card.nextReview = nextReview.toISOString();

    saveData();
}

function getDueCards() {
    const now = new Date();
    return flashcards.filter(card => new Date(card.nextReview) <= now);
}

// Session Results (Shared by multiple game modes)

function showSessionResults() {
    const content = document.getElementById('gameContent');
    const accuracy = sessionStats.correct + sessionStats.incorrect > 0 ?
        Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100) : 0;

    content.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h2 style="color: #667eea; font-size: 2.5em; margin-bottom: 30px;">🎉 Session Terminée ! 🎉</h2>

            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin: 30px 0;">
                <div class="stat-box" style="font-size: 1.3em; padding: 20px 40px;">
                    ✅ Correct : ${sessionStats.correct}
                </div>
                <div class="stat-box" style="font-size: 1.3em; padding: 20px 40px;">
                    ❌ Incorrect : ${sessionStats.incorrect}
                </div>
                <div class="stat-box" style="font-size: 1.3em; padding: 20px 40px;">
                    🎯 Précision : ${accuracy}%
                </div>
            </div>

            <p style="font-size: 1.5em; color: #667eea; margin: 30px 0;">Continuez votre excellent travail ! 加油！</p>

            <button class="btn" style="font-size: 1.3em; padding: 20px 50px;" onclick="returnToMenu()">Retour au Menu</button>
        </div>
    `;
}
