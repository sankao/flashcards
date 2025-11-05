// Flashcard Review Game Mode

function startFlashcardMode() {
    currentGame = 'flashcard';
    const dueCards = getDueCards();

    if (dueCards.length === 0) {
        alert('Aucune carte à réviser ! Excellent travail ! 🎉');
        return;
    }

    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    currentCardIndex = 0;
    sessionStats = { correct: 0, incorrect: 0, streak: 0 };
    showFlashcard(dueCards);
}

function showFlashcard(cards) {
    if (currentCardIndex >= cards.length) {
        showSessionResults();
        return;
    }

    const card = cards[currentCardIndex];
    const content = document.getElementById('gameContent');

    content.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(currentCardIndex / cards.length) * 100}%">
                ${currentCardIndex} / ${cards.length}
            </div>
        </div>

        <div class="flashcard" id="flashcardDisplay">
            <div class="character">${card.character}</div>
            <div id="flashcardInfo" class="hidden">
                <div class="pinyin">${card.pinyin}</div>
                <div class="meaning">${card.meaning}</div>
            </div>
            <button class="btn" onclick="revealAnswer()">Afficher la Réponse 👀</button>
        </div>

        <div id="answerButtons" class="hidden" style="text-align: center;">
            <button class="btn btn-secondary answer-btn" onclick="answerFlashcard(false)">❌ Je ne savais pas</button>
            <button class="btn btn-success answer-btn" onclick="answerFlashcard(true)">✅ Je le savais !</button>
        </div>

        <div id="feedback"></div>
    `;
}

function revealAnswer() {
    document.getElementById('flashcardInfo').classList.remove('hidden');
    document.querySelector('#flashcardDisplay button').classList.add('hidden');
    document.getElementById('answerButtons').classList.remove('hidden');
}

function answerFlashcard(correct) {
    const dueCards = getDueCards();
    const card = dueCards[currentCardIndex];
    cardAnswered(card, correct);

    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
    feedback.textContent = correct ? '🎉 Excellent travail !' : '💪 Continuez à pratiquer !';

    setTimeout(() => {
        currentCardIndex++;
        showFlashcard(dueCards);
    }, 1000);
}
