// Falling Characters Game Mode

function startFallingGame() {
    currentGame = 'falling';
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    if (flashcards.length === 0) {
        alert('Ajoutez d\'abord des cartes !');
        returnToMenu();
        return;
    }

    let score = 0;
    let gameActive = true;
    let currentRoundCards = [];
    let targetCard = null;
    let occupiedPositions = []; // Track x positions to avoid overlap

    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <h2 style="text-align: center; color: #667eea;">Attrapez le Caractère ! 🌟</h2>
        <div class="target-display" id="targetDisplay"></div>
        <div style="text-align: center; margin: 10px 0;">
            Score : <span id="fallingScore" style="font-size: 1.5em; color: #667eea; font-weight: bold;">0</span>
        </div>
        <div class="falling-game-area" id="fallingArea"></div>
    `;

    const area = document.getElementById('fallingArea');

    function findNonOverlappingPosition() {
        const charWidth = 100; // Character width + some padding
        const areaWidth = area.offsetWidth;
        const maxAttempts = 50;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const newPos = Math.random() * (areaWidth - charWidth);
            let overlaps = false;

            // Check if this position overlaps with any occupied position
            for (let occupied of occupiedPositions) {
                if (Math.abs(newPos - occupied) < charWidth) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                return newPos;
            }
        }

        // If we couldn't find a non-overlapping position, return a random one
        return Math.random() * (areaWidth - charWidth);
    }

    function generateNewRound() {
        // Clear any existing falling characters
        area.innerHTML = '';
        occupiedPositions = []; // Clear occupied positions for new round

        // Pick a new target card
        targetCard = flashcards[Math.floor(Math.random() * flashcards.length)];

        // Get pronunciation (pinyin and/or zhuyin)
        let pronunciation = '';
        if (targetCard.pinyin && targetCard.zhuyin) {
            pronunciation = `${targetCard.pinyin} / ${targetCard.zhuyin}`;
        } else {
            pronunciation = targetCard.pinyin || targetCard.zhuyin || '';
        }

        // Update the target display
        document.getElementById('targetDisplay').innerHTML = `
            Trouvez : <span style="color: #f5576c;">${pronunciation}</span> (${targetCard.meaning})
        `;

        // Generate a set of 5 cards that includes the target
        currentRoundCards = [targetCard];

        // Add 4 other random cards
        const otherCards = flashcards.filter(c => c !== targetCard);
        for (let i = 0; i < Math.min(4, otherCards.length); i++) {
            const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
            if (!currentRoundCards.includes(randomCard)) {
                currentRoundCards.push(randomCard);
            }
        }

        // Shuffle the cards
        for (let i = currentRoundCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentRoundCards[i], currentRoundCards[j]] = [currentRoundCards[j], currentRoundCards[i]];
        }

        // Create falling characters for all cards in this round
        currentRoundCards.forEach((card, index) => {
            setTimeout(() => {
                if (!gameActive) return;
                createFallingChar(card);
            }, index * 600); // Stagger the drops
        });
    }

    function createFallingChar(card) {
        if (!gameActive) return;

        const char = document.createElement('div');
        char.className = 'falling-character';
        char.textContent = card.character;

        // Find a non-overlapping position
        const xPosition = findNonOverlappingPosition();
        char.style.left = xPosition + 'px';
        char.style.top = '-60px';

        // Track this position
        occupiedPositions.push(xPosition);
        const positionIndex = occupiedPositions.length - 1;

        const isCorrect = card === targetCard;

        char.onclick = function() {
            if (!gameActive) return;

            if (isCorrect) {
                score += 10;
                document.getElementById('fallingScore').textContent = score;
                this.style.background = '#84fab0';
                cardAnswered(card, true);
            } else {
                score = Math.max(0, score - 5);
                document.getElementById('fallingScore').textContent = score;
                this.style.background = '#f5576c';
            }

            // Remove clicked card
            setTimeout(() => this.remove(), 200);

            // Generate a new round
            generateNewRound();
        };

        area.appendChild(char);

        let pos = -60;
        const interval = setInterval(() => {
            if (!gameActive) {
                clearInterval(interval);
                return;
            }

            pos += 2;
            char.style.top = pos + 'px';

            if (pos > area.offsetHeight) {
                clearInterval(interval);
                char.remove();
            }
        }, 20);
    }

    // Start the first round
    generateNewRound();

    // End game after 30 seconds
    setTimeout(() => {
        gameActive = false;
        area.innerHTML = '';
        alert(`🎉 Jeu Terminé ! Votre score : ${score}`);
        returnToMenu();
    }, 30000);
}
