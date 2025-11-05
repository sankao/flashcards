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
window.onload = async function() {
    await loadData();
    updateStats();
    if (flashcards.length > 0) {
        goToMenu();
    }
};

// Data Management
async function loadData() {
    try {
        const response = await fetch('/api/flashcards');
        if (response.ok) {
            flashcards = await response.json();
        } else if (response.status === 401) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

async function saveData() {
    // Data is saved automatically via API calls, just update stats
    updateStats();
}

async function importPastedData() {
    const text = document.getElementById('pasteInput').value;
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
            // Format: character,pinyin,meaning OR character,pinyin,zhuyin,meaning
            const character = parts[0];
            const pinyin = parts[1];
            const zhuyin = parts.length >= 4 ? parts[2] : '';
            const meaning = parts.length >= 4 ? parts[3] : parts[2];
            await addCard(character, pinyin, meaning, zhuyin);
        }
    }

    document.getElementById('pasteInput').value = '';
    await loadData();
    updateCardList();
}

async function importCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 3) {
                // Format: character,pinyin,meaning OR character,pinyin,zhuyin,meaning
                const character = parts[0];
                const pinyin = parts[1];
                const zhuyin = parts.length >= 4 ? parts[2] : '';
                const meaning = parts.length >= 4 ? parts[3] : parts[2];
                await addCard(character, pinyin, meaning, zhuyin);
            }
        }

        await loadData();
        updateCardList();
    };

    reader.readAsText(file);
}

async function addManualCard() {
    const char = document.getElementById('manualChar').value.trim();
    const pinyin = document.getElementById('manualPinyin').value.trim();
    const meaning = document.getElementById('manualMeaning').value.trim();

    if (char && pinyin && meaning) {
        await addCard(char, pinyin, meaning);
        document.getElementById('manualChar').value = '';
        document.getElementById('manualPinyin').value = '';
        document.getElementById('manualMeaning').value = '';
        await loadData();
        updateCardList();
    }
}

async function addCard(character, pinyin, meaning, zhuyin = '') {
    try {
        const response = await fetch('/api/flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                character,
                pinyin,
                zhuyin,
                meaning
            })
        });

        if (response.ok) {
            const card = await response.json();
            return card;
        } else {
            console.error('Erreur lors de l\'ajout de la carte');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function updateCardList() {
    const list = document.getElementById('cardList');
    list.innerHTML = '<h3 style="color: #667eea;">Cartes Actuelles :</h3>';

    flashcards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'card-item';

        // Display pinyin and/or zhuyin
        let pronunciation = '';
        if (card.pinyin && card.zhuyin) {
            pronunciation = `${card.pinyin} / ${card.zhuyin}`;
        } else if (card.pinyin) {
            pronunciation = card.pinyin;
        } else if (card.zhuyin) {
            pronunciation = card.zhuyin;
        }

        item.innerHTML = `
            <span><strong>${card.character}</strong> (${pronunciation}) - ${card.meaning}</span>
            <button class="btn btn-secondary" style="padding: 5px 15px; margin: 0;" onclick="removeCard(${index})">Supprimer</button>
        `;
        list.appendChild(item);
    });

    document.getElementById('startBtn').disabled = flashcards.length === 0;
}

async function removeCard(index) {
    const card = flashcards[index];
    try {
        const response = await fetch(`/api/flashcards/${card.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadData();
            updateCardList();
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

function exportData() {
    const csvContent = flashcards.map(card => {
        if (card.pinyin && card.zhuyin) {
            return `${card.character},${card.pinyin},${card.zhuyin},${card.meaning}`;
        } else {
            return `${card.character},${card.pinyin || card.zhuyin},${card.meaning}`;
        }
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chinese_flashcards.csv';
    a.click();
}

async function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les cartes et la progression ?')) {
        try {
            const response = await fetch('/api/flashcards/clear', {
                method: 'DELETE'
            });

            if (response.ok) {
                flashcards = [];
                sessionStats = { correct: 0, incorrect: 0, streak: 0 };
                updateStats();
                updateCardList();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
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

async function cardAnswered(card, correct) {
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

    // Save to API
    try {
        await fetch(`/api/flashcards/${card.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: card.level,
                lastReview: card.lastReview,
                nextReview: card.nextReview,
                correctCount: card.correctCount,
                incorrectCount: card.incorrectCount,
                streak: card.streak
            })
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
    }

    saveData();
}

function getDueCards() {
    const now = new Date();
    return flashcards.filter(card => new Date(card.nextReview) <= now);
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
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
