// Multiple Choice Quiz Game Mode

function startMultipleChoice() {
    currentGame = 'multiplechoice';
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    if (flashcards.length < 4) {
        alert('Vous avez besoin d\'au moins 4 cartes pour ce jeu !');
        returnToMenu();
        return;
    }

    currentCardIndex = 0;
    sessionStats = { correct: 0, incorrect: 0, streak: 0 };
    showMultipleChoice();
}

function showMultipleChoice() {
    if (currentCardIndex >= 10 || currentCardIndex >= flashcards.length) {
        showSessionResults();
        return;
    }

    const card = flashcards[currentCardIndex];
    const options = [card];

    while (options.length < 4) {
        const random = flashcards[Math.floor(Math.random() * flashcards.length)];
        if (!options.includes(random)) {
            options.push(random);
        }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(currentCardIndex / Math.min(10, flashcards.length)) * 100}%">
                ${currentCardIndex} / ${Math.min(10, flashcards.length)}
            </div>
        </div>

        <div class="flashcard">
            <div class="character">${card.character}</div>
            <p style="font-size: 1.3em; color: #666; margin: 20px 0;">Que signifie ceci ?</p>
        </div>

        <div class="answer-buttons" id="choiceButtons">
            ${options.map((opt, i) => `
                <button class="btn answer-btn" onclick="checkMultipleChoice(${opt === card}, '${opt.meaning}')">${opt.meaning}</button>
            `).join('')}
        </div>

        <div id="feedback"></div>
    `;
}

function checkMultipleChoice(correct, answer) {
    const card = flashcards[currentCardIndex];
    cardAnswered(card, correct);

    // Get pronunciation (pinyin and/or zhuyin)
    let pronunciation = '';
    if (card.pinyin && card.zhuyin) {
        pronunciation = `${card.pinyin} / ${card.zhuyin}`;
    } else {
        pronunciation = card.pinyin || card.zhuyin || '';
    }

    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
    feedback.innerHTML = correct ?
        `🎉 Correct ! ${card.character} (${pronunciation}) = ${card.meaning}` :
        `❌ Oups ! ${card.character} (${pronunciation}) = ${card.meaning}<br>Vous avez sélectionné : ${answer}`;

    document.getElementById('choiceButtons').style.display = 'none';

    setTimeout(() => {
        currentCardIndex++;
        showMultipleChoice();
    }, 2000);
}
