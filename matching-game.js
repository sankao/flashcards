// Memory Match Game Mode

function startMatchingGame() {
    currentGame = 'matching';
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    const gameCards = flashcards.slice(0, 8);
    if (gameCards.length < 4) {
        alert('Vous avez besoin d\'au moins 4 cartes pour jouer à ce jeu !');
        returnToMenu();
        return;
    }

    const pairs = [];
    gameCards.slice(0, 8).forEach(card => {
        pairs.push({ type: 'char', value: card.character, match: card.meaning });
        pairs.push({ type: 'meaning', value: card.meaning, match: card.character });
    });

    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    let flipped = [];
    let matched = [];

    const content = document.getElementById('gameContent');
    content.innerHTML = '<h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">Associez les Paires ! 🎴</h2><div class="matching-grid" id="matchingGrid"></div>';

    const grid = document.getElementById('matchingGrid');
    pairs.forEach((pair, index) => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">?</div>
                <div class="flip-card-back">${pair.value}</div>
            </div>
        `;

        card.onclick = function() {
            if (flipped.length < 2 && !this.classList.contains('flipped') && !matched.includes(index)) {
                this.classList.add('flipped');
                flipped.push({ index, pair });

                if (flipped.length === 2) {
                    setTimeout(() => {
                        if (flipped[0].pair.match === flipped[1].pair.value ||
                            flipped[1].pair.match === flipped[0].pair.value) {
                            matched.push(flipped[0].index, flipped[1].index);

                            if (matched.length === pairs.length) {
                                setTimeout(() => {
                                    alert('🎉 Vous avez tout associé ! Excellent travail !');
                                    returnToMenu();
                                }, 500);
                            }
                        } else {
                            document.querySelectorAll('.flip-card')[flipped[0].index].classList.remove('flipped');
                            document.querySelectorAll('.flip-card')[flipped[1].index].classList.remove('flipped');
                        }
                        flipped = [];
                    }, 1000);
                }
            }
        };

        grid.appendChild(card);
    });
}
