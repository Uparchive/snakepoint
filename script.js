const initialLogo = document.getElementById('initialLogo');
const menu = document.getElementById('menu');
const header = document.querySelector('header');
const storyModeButton = document.getElementById('storyModeButton');
storyModeButton.addEventListener('click', enterStoryMode);
const initialSnakeLength = 1;
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const backButton = document.getElementById('backButton');
const currentScoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const highScoreAIElement = document.getElementById('highScoreAI');
const scoreBoard = document.getElementById('scoreBoard');
const scoreHistoryElement = document.getElementById('scoreHistory');
const playerNameInput = document.getElementById('playerName');
const iaToggle = document.getElementById('iaToggle');
const redAppleImage = new Image();
redAppleImage.src = 'images/red_apple.png'; // Caminho para a sua imagem da maçã vermelha
const yellowAppleImage = new Image();
yellowAppleImage.src = 'images/yellow_apple.png'; // Caminho para a sua imagem da maçã amarela
const powerAppleImage = new Image();
powerAppleImage.src = 'images/power_apple.png'; // Caminho para a sua imagem da Power Apple
const gridSize = 20;
const tileCount = 30;
const resetHighScoresButton = document.getElementById('resetHighScoresButton');
resetHighScoresButton.addEventListener('click', resetHighScores);
const blackSpeedAppleImage = new Image();
blackSpeedAppleImage.src = 'images/black_speed_apple.png'; // Caminho para a sua imagem da Black Speed Apple
const snakeHeadImage = new Image();
snakeHeadImage.src = 'images/head.png'; // Caminho correto para a nova imagem da cabeça
const snakeBodyImage = new Image();
snakeBodyImage.src = 'images/skin.png'; // Caminho correto para a nova imagem do corpo
const scenarioImage = new Image();
scenarioImage.src = 'images/scenario.png'; // Caminho para a imagem do cenário
const snakeTailImage = new Image();
snakeTailImage.src = 'images/tail.png';
const restartButton = document.getElementById('restartButton');
const backToMenuButton = document.getElementById('backToMenuButton');

let snake = [{ x: 15, y: 15 }];
let direction = { x: 1, y: 0 };
let food = {};
let yellowApple = {};
let showYellowApple = false;
let score = 0;
let aiScore = 0;
let gameSpeed = 100;
let isAI = false;
let gameOver = false;
let isPaused = false;
let codeBuffer = '';
let nextDirection = { x: 1, y: 0 }; 
let redAppleCount = 0;
let yellowAppleThreshold = 115;
let pointMultiplier = 1;
let powerApple = {};
let showPowerApple = false;
let powerAppleCountdown = 0;
let isFrozen = false; 
let isPlayerGame = false;
let userInitiatedFullscreenToggle = false;
let isCheatAI = false;
let isStoryMode = false;
let currentLevel = 1; // Variável para rastrear o nível atual do modo história
let powerAppleCount = 0;
let yellowAppleCount = 0;
let objectiveApples = 0;
let objectivePowerApples = 0;
let objectiveYellowApples = 0;
let blackSpeedApple = {};
let showBlackSpeedApple = false;
let blackSpeedAppleThreshold = 30;
let blackSpeedAppleCount = 0;
let blackSpeedAppleProbability = 0.5; // 50% de chance de aparecer
let originalGameSpeed;
let blackSpeedAppleCountdown = 0;
let powerAppleInterval;
let blackSpeedAppleInterval;
let lastFrameTime = 0;

canvas.width = tileCount * gridSize;
canvas.height = tileCount * gridSize;

initialLogo.addEventListener('click', () => {
    document.getElementById('initialLogoContainer').style.display = 'none';
    header.style.display = 'flex';
    menu.style.display = 'block';
    menu.classList.add('show');
});

document.addEventListener('keydown', event => {
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }

    if (event.key.toLowerCase() === 'p') {
        if (isPaused) {
            startCountdown();
        } else {
            isPaused = true;
            showPauseMessage();
        }
    }

    if (!isAI && !isPaused) {
        switch (event.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                if (direction.x === 0) nextDirection = { x: -1, y: 0 };
                break;
            case 'arrowup':
            case 'w':
                if (direction.y === 0) nextDirection = { x: 0, y: -1 };
                break;
            case 'arrowright':
            case 'd':
                if (direction.x === 0) nextDirection = { x: 1, y: 0 };
                break;
            case 'arrowdown':
            case 's':
                if (direction.y === 0) nextDirection = { x: 0, y: 1 };
                break;
        }
    }
    detectCheatCode(event.key);
});

restartButton.addEventListener('click', () => {
    // Reiniciar o jogo
    startGame('normal'); // Use 'normal' ou ajuste conforme sua lógica de dificuldade
});

document.addEventListener('fullscreenchange', handleFullscreenChange);

// script.js Funções - Modo Fácil/Médio/Dificil e GERAIS - Snake Point

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Rotacionar a cabeça da cobra
            let directionString;
            if (direction.x === 1) directionString = 'right';
            else if (direction.x === -1) directionString = 'left';
            else if (direction.y === 1) directionString = 'down';
            else if (direction.y === -1) directionString = 'up';

            rotateHead(directionString);
        } else if (index === snake.length - 1) {
            drawTail(segment, index);
        } else {
            context.drawImage(snakeBodyImage, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    });
}

function drawTail(segment, index) {
    const tailDirection = {
        x: segment.x - snake[index - 1].x,
        y: segment.y - snake[index - 1].y,
    };

    context.save();
    context.translate(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);

    if (tailDirection.x === 1) {
        context.rotate((90 * Math.PI) / 180);
    } else if (tailDirection.x === -1) {
        context.rotate((-90 * Math.PI) / 180);
    } else if (tailDirection.y === 1) {
        context.rotate(Math.PI);
    } else if (tailDirection.y === -1) {
        context.rotate(0);
    }

    context.drawImage(snakeTailImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    context.restore();
}

function rotateHead(direction) {
    let rotationAngle;

    switch (direction) {
        case 'up':
            rotationAngle = -90;
            break;
        case 'down':
            rotationAngle = 90;
            break;
        case 'left':
            rotationAngle = 180;
            break;
        case 'right':
        default:
            rotationAngle = 0;
            break;
    }

    context.save();
    context.translate(snake[0].x * gridSize + gridSize / 2, snake[0].y * gridSize + gridSize / 2);
    context.rotate((rotationAngle * Math.PI) / 180);
    context.drawImage(snakeHeadImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    context.restore();
}

function resetHighScores() {
    if (confirm('Tem certeza de que deseja resetar todas as melhores pontuações?')) {
        localStorage.removeItem('highScore');
        localStorage.removeItem('highScoreAI');
        highScoreElement.innerText = 0;
        highScoreAIElement.innerText = 0;
        alert('As melhores pontuações foram resetadas.');
        displayScoreHistory(); // Atualizar a exibição do histórico
    }
}

function handleFullscreenChange() {
    if (!document.fullscreenElement && !userInitiatedFullscreenToggle) {
        // Restaurar o modo de tela cheia se o jogador tentar sair de outra forma
        document.documentElement.requestFullscreen();
    }
}

function updateScoreDisplay() {
    currentScoreElement.innerText = score;
    highScoreElement.innerText = localStorage.getItem('highScore') || 0;
    highScoreAIElement.innerText = localStorage.getItem('highScoreAI') || 0;
}

function toggleAIControl() {
    isAI = !isAI;
    isCheatAI = isAI;
    console.log(isAI ? "IA assumiu o controle do jogo" : "Jogador reassumiu o controle do jogo");
    currentScoreElement.style.color = isAI ? 'red' : 'green'; // Mudar a cor para indicar quem está no controle
    updateScoreDisplay();
}

function getPriorityTarget() {
    if (showPowerApple) {
        console.log("Prioridade: Power Apple", powerApple);
        return powerApple;
    } else if (showYellowApple) {
        console.log("Prioridade: Maçã Amarela", yellowApple);
        return yellowApple;
    } else {
        console.log("Prioridade: Maçã Vermelha", food);
        return food;
    }
}

function toggleScores() {
    const collapsibleContent = document.querySelector('.collapsible-content');
    if (collapsibleContent.style.display === 'none' || collapsibleContent.style.display === '') {
        collapsibleContent.style.display = 'block';
    } else {
        collapsibleContent.style.display = 'none';
    }
}

function toggleScoreHistory() {
    const scoreHistory = document.getElementById('scoreHistory');
    const scoreHistoryButtons = document.getElementById('scoreHistoryButtons');
    const toggleArrow = document.getElementById('toggleArrow');

    if (scoreHistory.classList.contains('hidden')) {
        scoreHistory.classList.remove('hidden');
        scoreHistoryButtons.classList.remove('hidden');
        toggleArrow.innerHTML = '▲';
    } else {
        scoreHistory.classList.add('hidden');
        scoreHistoryButtons.classList.add('hidden');
        toggleArrow.innerHTML = '▼';
    }
}

function detectCheatCode(key) {
    const cheatCode = '2002p';
    const powerAppleCheatCode = '982879526p';
    const freezeCheatCode = '952141545p';
    const toggleAICheatCode = '47014p';
    const blackSpeedAppleCheatCode = '8753p';

    codeBuffer += key.toLowerCase();
    if (codeBuffer.length > Math.max(cheatCode.length, powerAppleCheatCode.length, freezeCheatCode.length, toggleAICheatCode.length, blackSpeedAppleCheatCode.length)) {
        codeBuffer = codeBuffer.slice(-Math.max(cheatCode.length, powerAppleCheatCode.length, freezeCheatCode.length, toggleAICheatCode.length, blackSpeedAppleCheatCode.length));
    }
    if (codeBuffer.endsWith(cheatCode)) {
        placeYellowApple();
        codeBuffer = '';
    } else if (codeBuffer.endsWith(powerAppleCheatCode)) {
        placePowerApple();
        codeBuffer = '';
    } else if (codeBuffer.endsWith(freezeCheatCode) && powerAppleCountdown > 0) {
        toggleFreeze();
        codeBuffer = '';
    } else if (codeBuffer.endsWith(toggleAICheatCode)) {
        console.log("Toggle AI Control Cheat Code Activated"); // Debug
        toggleAIControl();
        codeBuffer = '';
    } else if (codeBuffer.endsWith(blackSpeedAppleCheatCode)) {
        placeBlackSpeedApple();
        codeBuffer = '';
    }
}

function toggleFreeze() {
    isFrozen = !isFrozen;
}

function placePowerApple() {
    let newPowerApplePosition;
    do {
        newPowerApplePosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newPowerApplePosition.x && segment.y === newPowerApplePosition.y) ||
             (newPowerApplePosition.x === food.x && newPowerApplePosition.y === food.y));

    powerApple = newPowerApplePosition;
    showPowerApple = true;
}

function startGame(difficulty) {
    resetStoryModeVariables();
    isStoryMode = false;

    const playerName = playerNameInput.value.trim();
    if (playerName === "" && !iaToggle.checked) {
        alert("Por favor, insira o nome do jogador.");
        return;
    }

    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    backButton.style.display = 'block';
    scoreBoard.style.display = 'block';
    objectiveBoard.style.display = 'none';
    gameOver = false;
    isPaused = false;
    isAI = iaToggle.checked;
    isPlayerGame = !iaToggle.checked;

    // Definir a velocidade do jogo com base na dificuldade
    switch (difficulty) {
        case 'easy':
            originalGameSpeed = 150;
            break;
        case 'normal':
            originalGameSpeed = 100;
            break;
        case 'hard':
            originalGameSpeed = 50;
            break;
    }
    gameSpeed = originalGameSpeed;

    // Iniciar a cobra com dois blocos (cabeça e cauda)
    snake = [
        { x: 15, y: 15 }, // Cabeça
        { x: 14, y: 15 }  // Cauda
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    aiScore = 0;
    redAppleCount = 0;
    pointMultiplier = 1;

    // Resetar variáveis das maçãs especiais
    showYellowApple = false;
    yellowApple = {};
    showPowerApple = false;
    powerApple = {};
    powerAppleCountdown = 0;
    showBlackSpeedApple = false;
    blackSpeedApple = {};
    blackSpeedAppleCountdown = 0;
    blackSpeedAppleCount = 0;

    // Parar quaisquer intervalos em execução para maçãs especiais
    clearInterval(powerAppleInterval);
    clearInterval(blackSpeedAppleInterval);

    updateScoreDisplay();
    highScoreElement.innerText = localStorage.getItem('highScore') || 0;
    highScoreAIElement.innerText = localStorage.getItem('highScoreAI') || 0;
    placeFood();

    gameLoop();
}

function toggleIA() {
    if (iaToggle.checked) {
        iaToggle.nextElementSibling.style.backgroundColor = '#4CAF50';
    } else {
        iaToggle.nextElementSibling.style.backgroundColor = '#ccc';
    }
}

function backToMenu() {
    isAI = false;
    gameOver = true;

    const storyModeContainer = document.getElementById('storyModeContainer');
    if (storyModeContainer) {
        storyModeContainer.style.display = 'none';
    }

    document.getElementById('menu').style.display = 'block';
    canvas.style.display = 'none';
    backButton.style.display = 'none';
    scoreBoard.style.display = 'none';
    objectiveBoard.style.display = 'none'; // Esconder o painel de objetivos
    document.body.style.backgroundColor = '#1a1a2e';

    displayScoreHistory();
}

function backToMainMenu() {
    isAI = false;
    gameOver = true;

    document.getElementById('menu').style.display = 'block';
    canvas.style.display = 'none';
    backButton.style.display = 'none';
    scoreBoard.style.display = 'none';
    displayScoreHistory();
}

function placeFood() {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));

    food = newFoodPosition;
}

function placePowerApple() {
    let newPowerApplePosition;
    do {
        newPowerApplePosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newPowerApplePosition.x && segment.y === newPowerApplePosition.y) ||
             (newPowerApplePosition.x === food.x && newPowerApplePosition.y === food.y));

    powerApple = newPowerApplePosition;
    showPowerApple = true;
}

function placeYellowApple() {
    let newYellowApplePosition;
    do {
        newYellowApplePosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newYellowApplePosition.x && segment.y === newYellowApplePosition.y) ||
             (newYellowApplePosition.x === food.x && newYellowApplePosition.y === food.y));

    yellowApple = newYellowApplePosition;
    showYellowApple = true;
}

function isFoodAccessible() {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    const target = showPowerApple ? powerApple : food; // Priorize a Power Apple se ela estiver presente
    
    const queue = [{ x: snake[0].x, y: snake[0].y }];
    const visited = new Set();
    visited.add(`${snake[0].x},${snake[0].y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        for (const dir of directions) {
            let next = {
                x: current.x + dir.x,
                y: current.y + dir.y
            };

            if (next.x < 0) {
                next.x = tileCount - 1;
            } else if (next.x >= tileCount) {
                next.x = 0;
            }
            if (next.y < 0) {
                next.y = tileCount - 1;
            } else if (next.y >= tileCount) {
                next.y = 0;
            }

            if (next.x === target.x && next.y === target.y) { // Verifique se alcançamos o target
                return true;
            }

            if (!visited.has(`${next.x},${next.y}`) && !snake.some(segment => segment.x === next.x && segment.y === next.y)) {
                visited.add(`${next.x},${next.y}`);
                queue.push(next);
            }
        }
    }

    return false;
}

function placeBlackSpeedApple() {
    let newBlackSpeedApplePosition;
    do {
        newBlackSpeedApplePosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newBlackSpeedApplePosition.x && segment.y === newBlackSpeedApplePosition.y) ||
             (newBlackSpeedApplePosition.x === food.x && newBlackSpeedApplePosition.y === food.y) ||
             (newBlackSpeedApplePosition.x === yellowApple.x && newBlackSpeedApplePosition.y === yellowApple.y) ||
             (newBlackSpeedApplePosition.x === powerApple.x && newBlackSpeedApplePosition.y === powerApple.y));
    
    blackSpeedApple = newBlackSpeedApplePosition;
    showBlackSpeedApple = true;
}

function applyBlackSpeedAppleEffect() {
    blackSpeedAppleCount += 1;
    gameSpeed = originalGameSpeed / 2; // Aumentar a velocidade do jogo
    blackSpeedAppleCountdown = 30; // 30 segundos

    clearInterval(blackSpeedAppleInterval); // Limpa o intervalo anterior, se houver
    blackSpeedAppleInterval = setInterval(() => {
        blackSpeedAppleCountdown--;
        if (blackSpeedAppleCountdown <= 0) {
            gameSpeed = originalGameSpeed; // Restaurar a velocidade original após 30 segundos
            clearInterval(blackSpeedAppleInterval);
        }
    }, 1000); // Intervalo de 1 segundo
}

function displayBlackSpeedAppleCountdown() {
    context.font = '16px Arial';
    context.fillStyle = 'black';
    context.fillText(`Velocidade Aumentada: ${blackSpeedAppleCountdown}s`, canvas.width / 2, 40);
}

function aiMove() {
    console.log("AI Move Called");
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    const target = getPriorityTarget();
    console.log("Target:", target);

    const queue = [{ x: snake[0].x, y: snake[0].y, path: [] }];
    const visited = new Set();
    visited.add(`${snake[0].x},${snake[0].y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        for (const dir of directions) {
            let next = {
                x: current.x + dir.x,
                y: current.y + dir.y,
                path: [...current.path, dir]
            };

            if (next.x < 0) next.x = tileCount - 1;
            if (next.x >= tileCount) next.x = 0;
            if (next.y < 0) next.y = tileCount - 1;
            if (next.y >= tileCount) next.y = 0;

            if (snake.some(segment => segment.x === next.x && segment.y === next.y)) continue;

            if (next.x === target.x && next.y === target.y) {
                nextDirection = next.path[0];
                console.log("New direction:", nextDirection);
                return;
            }

            if (!visited.has(`${next.x},${next.y}`)) {
                visited.add(`${next.x},${next.y}`);
                queue.push(next);
            }
        }
    }

    const safeMove = findSafeMove();
    if (safeMove) {
        nextDirection = safeMove;
        console.log("Safe move found:", nextDirection);
    } else {
        const validDirections = directions.filter(dir => {
            let next = {
                x: snake[0].x + dir.x,
                y: snake[0].y + dir.y
            };

            if (next.x < 0) next.x = tileCount - 1;
            else if (next.x >= tileCount) next.x = 0;
            if (next.y < 0) next.y = tileCount - 1;
            else if (next.y >= tileCount) next.y = 0;

            return !snake.some(segment => segment.x === next.x && segment.y === next.y);
        });

        if (validDirections.length > 0) {
            nextDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            console.log("Random valid direction:", nextDirection);
        }
    }
}

function findSafeMove() {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    let bestMove = null;
    let maxSafeArea = -1;

    for (const dir of directions) {
        let next = {
            x: snake[0].x + dir.x,
            y: snake[0].y + dir.y
        };

        if (next.x < 0) {
            next.x = tileCount - 1;
        } else if (next.x >= tileCount) {
            next.x = 0;
        }
        if (next.y < 0) {
            next.y = tileCount - 1;
        } else if (next.y >= tileCount) {
            next.y = 0;
        }

        if (!snake.some(segment => segment.x === next.x && segment.y === next.y)) {
            const safeArea = evaluateSafeArea(next.x, next.y);
            if (safeArea > maxSafeArea) {
                maxSafeArea = safeArea;
                bestMove = dir;
            }
        }
    }

    return bestMove;
}

function evaluateSafeArea(x, y) {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    const queue = [{ x, y }];
    const visited = new Set();
    visited.add(`${x},${y}`);
    let safeArea = 0;

    while (queue.length > 0) {
        const current = queue.shift();
        safeArea++;

        for (const dir of directions) {
            let next = {
                x: current.x + dir.x,
                y: current.y + dir.y
            };

            if (next.x < 0) {
                next.x = tileCount - 1;
            } else if (next.x >= tileCount) {
                next.x = 0;
            }
            if (next.y < 0) {
                next.y = tileCount - 1;
            } else if (next.y >= tileCount) {
                next.y = 0;
            }

            if (!visited.has(`${next.x},${next.y}`) && !snake.some(segment => segment.x === next.x && segment.y === next.y)) {
                visited.add(`${next.x},${next.y}`);
                queue.push(next);
            }
        }
    }

    return safeArea;
}

function compactMove() {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    for (const dir of directions) {
        let next = {
            x: snake[0].x + dir.x,
            y: snake[0].y + dir.y
        };

        if (next.x < 0) {
            next.x = tileCount - 1;
        } else if (next.x >= tileCount) {
            next.x = 0;
        }
        if (next.y < 0) {
            next.y = tileCount - 1;
        } else if (next.y >= tileCount) {
            next.y = 0;
        }

        if (!snake.some(segment => segment.x === next.x && segment.y === next.y)) {
            direction = dir;
            return;
        }
    }

    direction = directions[Math.floor(Math.random() * directions.length)];
}

function applyPowerAppleEffect() {
    powerAppleCount += 1;
    powerAppleCountdown = 15; // 15 segundos

    clearInterval(powerAppleInterval); // Limpa o intervalo anterior, se houver
    powerAppleInterval = setInterval(() => {
        powerAppleCountdown--;
        if (powerAppleCountdown <= 0) {
            clearInterval(powerAppleInterval);
        }
    }, 1000); // Intervalo de 1 segundo
}

function displayPowerAppleCountdown() {
    context.font = '16px Arial';
    context.fillStyle = 'black';
    context.fillText(`Invencibilidade: ${powerAppleCountdown}s`, canvas.width / 2, 20);
}

function gameLoop(currentTime) {
    if (gameOver || isPaused) return;

    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < gameSpeed) {
        requestAnimationFrame(gameLoop);
        return;
    }

    lastFrameTime = currentTime;

    if (isAI) {
        aiMove();
    }

    direction = nextDirection;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        if (powerAppleCountdown <= 0) {
            gameOver = true;
            showGameOverPopup(score);
            saveScoreHistory(playerNameInput.value, score, aiScore);
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 1 * pointMultiplier;
        redAppleCount += 1;
        console.log(`Maçã comida. Novo redAppleCount: ${redAppleCount}`);
        if (score > localStorage.getItem('highScore')) localStorage.setItem('highScore', score);
        updateScoreDisplay();
        updateObjectiveDisplay();  // Atualize os objetivos após coletar uma maçã vermelha
        placeFood();

        if (redAppleCount >= blackSpeedAppleThreshold && Math.random() < blackSpeedAppleProbability) {
            placeBlackSpeedApple();
            blackSpeedAppleThreshold += 50;
        }
        if (redAppleCount % 50 === 0) {
            placePowerApple();
        }
        if (redAppleCount % yellowAppleThreshold === 0) {
            placeYellowApple();
        }

        checkLevelCompletion();
    } else if (showPowerApple && head.x === powerApple.x && head.y === powerApple.y) {
        showPowerApple = false;
        powerAppleCount += 1;  // Incrementa o contador de Power Apples
        console.log(`Power Apple comida. Novo powerAppleCount: ${powerAppleCount}`);
        updateObjectiveDisplay();  // Atualize os objetivos após coletar uma Power Apple
        applyPowerAppleEffect();
    } else if (showYellowApple && head.x === yellowApple.x && head.y === yellowApple.y) {
        showYellowApple = false;
        yellowAppleCount += 1;  // Incrementa o contador de Maçãs Amarelas
        console.log(`Maçã Amarela comida. Novo yellowAppleCount: ${yellowAppleCount}`);
        updateObjectiveDisplay();  // Atualize os objetivos após coletar uma Maçã Amarela
        applyYellowAppleEffect();
    } else if (showBlackSpeedApple && head.x === blackSpeedApple.x && head.y === blackSpeedApple.y) {
        showBlackSpeedApple = false;
        applyBlackSpeedAppleEffect();
    } else {
        snake.pop();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(scenarioImage, 0, 0, canvas.width, canvas.height);

    context.drawImage(redAppleImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    if (showYellowApple) {
        context.drawImage(yellowAppleImage, yellowApple.x * gridSize, yellowApple.y * gridSize, gridSize, gridSize);
    }
    if (showPowerApple) {
        context.drawImage(powerAppleImage, powerApple.x * gridSize, powerApple.y * gridSize, gridSize, gridSize);
    }
    if (showBlackSpeedApple) {
        context.drawImage(blackSpeedAppleImage, blackSpeedApple.x * gridSize, blackSpeedApple.y * gridSize, gridSize, gridSize);
    }

    drawSnake();

    if (powerAppleCountdown > 0) {
        displayPowerAppleCountdown();
    }
    if (blackSpeedAppleCountdown > 0) {
        displayBlackSpeedAppleCountdown();
    }

    requestAnimationFrame(gameLoop);
}

function showGameOverPopup(score) {
    // Mostrar o popup de game over
    const gameOverPopup = document.getElementById('gameOverPopup');
    const finalScoreElement = document.getElementById('finalScoreGameOver');
    finalScoreElement.innerText = `Sua pontuação: ${score}`;
    gameOverPopup.style.display = 'flex';

    // Adicionar evento de clique ao botão de reiniciar
    const restartButton = document.getElementById('restartButton');
    restartButton.onclick = function() {
        gameOverPopup.style.display = 'none';
        resetStoryModeVariables();  // Resetar variáveis do modo história e do jogo

        if (isStoryMode) {
            startStoryModeLevel(currentLevel);
        } else {
            startGame('normal'); // Use 'normal' ou ajuste conforme sua lógica de dificuldade
        }
    };

    // Adicionar evento de clique ao botão de voltar ao menu
    const backToMenuButton = document.getElementById('backToMenuButton');
    backToMenuButton.onclick = function() {
        gameOverPopup.style.display = 'none';
        backToMenu();  // Voltar ao menu principal
    };

    // Salvar a pontuação do jogador
    saveScoreHistory(playerNameInput.value, score, aiScore);
}

function showCongratsPopup(score) {
    document.getElementById('finalScore').innerText = score;
    const congratsPopup = document.getElementById('congratsPopup');
    congratsPopup.style.display = 'flex';
    
    const nextLevelButton = document.getElementById('nextLevelButton');
    const restartLevelButton = document.getElementById('restartLevelButton');
    const backToMenuButtonCongrats = document.getElementById('backToMenuButtonCongrats');

    nextLevelButton.onclick = function() {
        congratsPopup.style.display = 'none';
        startStoryModeLevel(currentLevel + 1); // Iniciar a próxima fase
    };

    restartLevelButton.onclick = function() {
        congratsPopup.style.display = 'none';
        startStoryModeLevel(currentLevel); // Reiniciar a fase atual
    };

    backToMenuButtonCongrats.onclick = function() {
        congratsPopup.style.display = 'none'; // Ocultar o popup
        backToLevelMenu();
    };
}

function applyYellowAppleEffect() {
    yellowAppleCount += 1; // Incrementar contagem de Maçãs Amarelas
    pointMultiplier *= 2;  // Dobra a quantidade de pontos adquiridos
    resetSnakeToInitialSize();  // Redefine o tamanho da cobra
    updateObjectiveDisplay();
}

function showPauseMessage() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '48px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText('PAUSADO', canvas.width / 2, canvas.height / 2);
}

function startCountdown() {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '80px Arial';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.fillText(countdown, canvas.width / 2, canvas.height / 2);

        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            isPaused = false;
            gameLoop();
        }
    }, 1000);
}

function resetSnakeToInitialSize() {
    const head = { x: snake[0].x, y: snake[0].y };
    const newSnake = [];
    for (let i = 0; i < initialSnakeLength; i++) {
        newSnake.push({ x: head.x - i * direction.x, y: head.y - i * direction.y });
    }
    snake = newSnake;
}

function saveScoreHistory(playerName, playerScore, aiScore) {
    const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
    const timestamp = new Date().toLocaleString('pt-BR');
    let mode = getDifficulty(); // Obter a dificuldade atual

    if (isAI) {
        scoreHistory.unshift({ playerName: 'IA', playerScore: aiScore, mode: mode, timestamp });
    } else {
        scoreHistory.unshift({ playerName: playerName, playerScore: playerScore, mode: mode, timestamp });
    }

    localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
    displayScoreHistory();
}

function getDifficulty() {
    if (gameSpeed === 150) return 'easy';
    if (gameSpeed === 100) return 'normal';
    if (gameSpeed === 50) return 'hard';
    return 'unknown';
}

function displayScoreHistory() {
    const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
    scoreHistoryElement.innerHTML = '';
    scoreHistory.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.timestamp} - Jogador: ${entry.playerName}, Pontuação: ${entry.playerScore}, Modo: ${entry.mode}`;
        scoreHistoryElement.appendChild(li);
    });

    // Mostrar ou ocultar os botões com base na existência de pontuações
    const scoreHistoryButtons = document.getElementById('scoreHistoryButtons');
    if (scoreHistory.length > 0) {
        scoreHistoryButtons.style.display = 'flex';
    } else {
        scoreHistoryButtons.style.display = 'none';
    }
}

function getDifficulty() {
    if (gameSpeed === 150) return 'Fácil';
    if (gameSpeed === 100) return 'Normal';
    if (gameSpeed === 50) return 'Difícil';
    return 'Desconhecido';
}

function displayScoreHistory() {
    const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
    scoreHistoryElement.innerHTML = '';
    scoreHistory.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.timestamp} - Jogador: ${entry.playerName}, Pontuação: ${entry.playerScore}, Modo: ${entry.mode}`;
        scoreHistoryElement.appendChild(li);
    });
}

function displayScoreHistory() {
    const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
    scoreHistoryElement.innerHTML = '';
    scoreHistory.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.timestamp} - Jogador: ${entry.playerName}, Pontuação: ${entry.playerScore}, Modo: ${entry.mode}`;
        scoreHistoryElement.appendChild(li);
    });
}

function exportScoreHistory() {
    const scoreHistory = localStorage.getItem('scoreHistory') || '[]';
    const blob = new Blob([scoreHistory], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scoreHistory.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importScoreHistory(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const importedData = e.target.result;
            try {
                const scoreHistory = JSON.parse(importedData);
                localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
                displayScoreHistory();
                updateHighScoresFromHistory(scoreHistory); // Atualizar as melhores pontuações se necessário
            } catch (err) {
                alert('Erro ao importar o histórico de pontuações. Verifique se o arquivo está no formato correto.');
            }
        };
        reader.readAsText(file);
    }
}

function clearScoreHistory() {
    if (confirm('Tem certeza de que deseja limpar o histórico de pontuações?')) {
        localStorage.removeItem('scoreHistory');
        displayScoreHistory();
    }
}

function toggleFullscreen() {
    userInitiatedFullscreenToggle = true;
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Erro ao tentar entrar em modo de tela cheia: ${err.message}`);
        }).finally(() => {
            userInitiatedFullscreenToggle = false;
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().finally(() => {
                userInitiatedFullscreenToggle = false;
            });
        }
    }
}

function getDifficulty() {
    if (gameSpeed === 150) return 'easy';
    if (gameSpeed === 100) return 'normal';
    if (gameSpeed === 50) return 'hard';
    return 'unknown';
}

function updateHighScoresFromHistory(scoreHistory) {
    let highestPlayerScore = 0;
    let highestAIScore = 0;

    scoreHistory.forEach(entry => {
        if (entry.playerName !== 'IA' && entry.playerScore > highestPlayerScore) {
            highestPlayerScore = entry.playerScore;
        } else if (entry.playerName === 'IA' && entry.playerScore > highestAIScore) {
            highestAIScore = entry.playerScore;
        }
    });

    const currentHighScore = localStorage.getItem('highScore') || 0;
    const currentHighScoreAI = localStorage.getItem('highScoreAI') || 0;

    if (highestPlayerScore > currentHighScore) {
        localStorage.setItem('highScore', highestPlayerScore);
        highScoreElement.innerText = highestPlayerScore;
    } else {
        highScoreElement.innerText = currentHighScore; // Atualizar a interface mesmo que não mude o valor
    }

    if (highestAIScore > currentHighScoreAI) {
        localStorage.setItem('highScoreAI', highestAIScore);
        highScoreAIElement.innerText = highestAIScore;
    } else {
        highScoreAIElement.innerText = currentHighScoreAI; // Atualizar a interface mesmo que não mude o valor
    }
}

// script.js - Funções do Modo História - Snake Point

document.getElementById('storyModeButton').addEventListener('click', enterStoryMode);

function enterStoryMode() {
    isStoryMode = true;
    currentLevel = 1;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('storyModeContainer').style.display = 'block';
    loadLevelProgress();
}

function startStoryModeLevel(level) {
    isStoryMode = true; // Marcar como modo história
    currentLevel = level; // Definir o nível atual
    document.getElementById('menu').style.display = 'none';
    document.getElementById('storyModeContainer').style.display = 'none';
    canvas.style.display = 'block';
    backButton.style.display = 'block';
    objectiveBoard.style.display = 'block';

    // Iniciar a cobra com dois blocos (cabeça e cauda)
    snake = [
        { x: 15, y: 15 }, // Cabeça
        { x: 14, y: 15 }  // Cauda
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    powerAppleCount = 0; // Resetar contagem de Power Apples
    yellowAppleCount = 0; // Resetar contagem de Maçãs Amarelas
    redAppleCount = 0; // Resetar contagem de Maçãs Vermelhas
    gameOver = false;
    isPaused = false;

    // Resetar variáveis das maçãs especiais
    showYellowApple = false;
    yellowApple = {};
    showPowerApple = false;
    powerApple = {};
    powerAppleCountdown = 0;
    showBlackSpeedApple = false;
    blackSpeedApple = {};
    blackSpeedAppleCountdown = 0;
    blackSpeedAppleCount = 0;

    // Parar quaisquer intervalos em execução para maçãs especiais
    clearInterval(powerAppleInterval);
    clearInterval(blackSpeedAppleInterval);

    // Definir a velocidade do jogo fixa para o modo história
    originalGameSpeed = 100; // Velocidade padrão para o modo história
    gameSpeed = originalGameSpeed;

    // Definir os objetivos da fase
    switch (level) {
        case 1:
            objectiveApples = 10;
            objectivePowerApples = 0;
            objectiveYellowApples = 0;
            break;
        case 2:
            objectiveApples = 60;
            objectivePowerApples = 1;
            objectiveYellowApples = 0;
            break;
        case 3:
            objectiveApples = 100;
            objectivePowerApples = 2;
            objectiveYellowApples = 0;
            break;
        case 4:
            objectiveApples = 120;
            objectivePowerApples = 2;
            objectiveYellowApples = 1;
            break;
        default:
            objectiveApples = 0;
            objectivePowerApples = 0;
            objectiveYellowApples = 0;
            break;
    }

    updateObjectiveDisplay();

    obstacles = [];
    placeObstacles(level);
    placeFood();

    gameLoop();
}

function resetStoryModeVariables() {
    powerAppleCount = 0;
    yellowAppleCount = 0;
    redAppleCount = 0;
    showYellowApple = false;
    yellowApple = {};
    showPowerApple = false;
    powerApple = {};
    powerAppleCountdown = 0;
    showBlackSpeedApple = false;
    blackSpeedApple = {};
    blackSpeedAppleCountdown = 0;
    blackSpeedAppleCount = 0;
    clearInterval(powerAppleInterval);
    clearInterval(blackSpeedAppleInterval);
    gameSpeed = originalGameSpeed;
}

function placeObstacles(level) {
    obstacles = [];
    switch(level) {
        case 1:
            obstacles = [
                { x: 10, y: 10 },
                { x: 10, y: 11 },
                { x: 10, y: 12 },
                { x: 20, y: 20 },
                { x: 20, y: 21 },
                { x: 20, y: 22 }
            ];
            break;
        case 2:
            obstacles = [
                { x: 5, y: 5 },
                { x: 5, y: 6 },
                { x: 5, y: 7 },
                { x: 15, y: 15 },
                { x: 15, y: 16 },
                { x: 15, y: 17 }
            ];
            break;
        // Adicionar configurações de obstáculos para outros níveis conforme necessário
    }
}

function completeLevel(level) {
    const levelProgress = JSON.parse(localStorage.getItem('levelProgress')) || { level1: true, level2: false, level3: false, level4: false };
    if (level < 4) {
        levelProgress[`level${level + 1}`] = true;
    }
    localStorage.setItem('levelProgress', JSON.stringify(levelProgress));
    loadLevelProgress();
}

function resetGameStyle() {
    document.body.style.backgroundColor = '#1a1a2e'; // Cor de fundo original
    canvas.style.display = 'none';
    backButton.style.display = 'none';
    scoreBoard.style.display = 'none';
}

function backToLevelMenu() {
    isAI = false;
    gameOver = false; // Corrigir o estado do gameOver
    resetGameStyle();
    document.getElementById('storyModeContainer').style.display = 'block';
    canvas.style.display = 'none';
    backButton.style.display = 'none';
    objectiveBoard.style.display = 'none'; // Esconder o painel de objetivos
    document.getElementById('congratsPopup').style.display = 'none'; // Esconder o pop-up de parabéns
    document.getElementById('gameOverPopup').style.display = 'none'; // Esconder o pop-up de Game Over
    displayScoreHistory();
}

function checkLevelCompletion() {
    if (!isStoryMode) return;

    let levelComplete = false;

    switch (currentLevel) {
        case 1:
            levelComplete = (score >= 10);
            break;
        case 2:
            levelComplete = (score >= 60 && powerAppleCount >= 1);
            break;
        case 3:
            levelComplete = (score >= 100 && powerAppleCount >= 2);
            break;
        case 4:
            levelComplete = (score >= 120 && powerAppleCount >= 2 && yellowAppleCount >= 1);
            break;
        default:
            break;
    }

    if (levelComplete) {
        gameOver = true;
        showCongratsPopup(score);
        completeLevel(currentLevel); // Marcar a fase atual como completa
    }
}

function backToLevelMenu() {
    isAI = false;
    gameOver = false; // Corrigir o estado do gameOver
    resetGameStyle();
    document.getElementById('storyModeContainer').style.display = 'block';
    canvas.style.display = 'none';
    backButton.style.display = 'none';
    objectiveBoard.style.display = 'none'; // Esconder o painel de objetivos
    document.getElementById('congratsPopup').style.display = 'none'; // Esconder o pop-up de parabéns
    document.getElementById('gameOverPopup').style.display = 'none'; // Esconder o pop-up de Game Over
    displayScoreHistory();
}

function updateObjectiveDisplay() {
    console.log('Atualizando a tabela de objetivos...');
    console.log(`Maçãs: ${redAppleCount}/${objectiveApples}`);
    console.log(`Power Apples: ${powerAppleCount}/${objectivePowerApples}`);
    console.log(`Maçãs Amarelas: ${yellowAppleCount}/${objectiveYellowApples}`);

    // Atualizar o texto dos objetivos
    document.getElementById('objectiveApples').innerText = `Maçãs: ${redAppleCount}/${objectiveApples}`;
    document.getElementById('objectivePowerApples').innerText = `Power Apples: ${powerAppleCount}/${objectivePowerApples}`;
    document.getElementById('objectiveYellowApples').innerText = `Maçãs Amarelas: ${yellowAppleCount}/${objectiveYellowApples}`;

    // Mostrar ou ocultar elementos com base nos objetivos
    document.getElementById('objectiveApples').style.display = objectiveApples > 0 ? 'block' : 'none';
    document.getElementById('objectivePowerApples').style.display = objectivePowerApples > 0 ? 'block' : 'none';
    document.getElementById('objectiveYellowApples').style.display = objectiveYellowApples > 0 ? 'block' : 'none';
}

function resetObjectiveCounts() {
    score = 0;
    redAppleCount = 0;
    powerAppleCount = 0;
    yellowAppleCount = 0;
    updateObjectiveDisplay();
}

function loadLevelProgress() {
    const levelProgress = JSON.parse(localStorage.getItem('levelProgress')) || {
        level1: true,
        level2: false,
        level3: false,
        level4: false,
        level5: false,
        level6: false
    };
    for (let i = 1; i <= 6; i++) {
        const level = document.getElementById(`level${i}`);
        if (levelProgress[`level${i}`]) {
            level.classList.remove('locked');
            level.onclick = () => startStoryModeLevel(i);
        } else {
            level.classList.add('locked');
            level.onclick = null;
        }
    }
}

function toggleObjectives() {
    const collapsibleObjective = document.querySelector('.collapsible-objective');
    if (collapsibleObjective.style.display === 'none' || collapsibleObjective.style.display === '') {
        collapsibleObjective.style.display = 'block';
    } else {
        collapsibleObjective.style.display = 'none';
    }
}

// Função para detectar se o dispositivo é móvel
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Funções para mover a cobra com os controles responsivos
function moveSnake(direction) {
    if (direction === 'up' && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (direction === 'down' && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (direction === 'left' && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (direction === 'right' && direction.x === 0) nextDirection = { x: 1, y: 0 };
}

// Adicionar event listeners aos botões de controle
function addMobileControls() {
    document.getElementById('upButton').addEventListener('click', () => moveSnake('up'));
    document.getElementById('downButton').addEventListener('click', () => moveSnake('down'));
    document.getElementById('leftButton').addEventListener('click', () => moveSnake('left'));
    document.getElementById('rightButton').addEventListener('click', () => moveSnake('right'));
}

// Mostrar controles móveis se o dispositivo for móvel
if (isMobile()) {
    document.getElementById('mobileControls').style.display = 'flex';
    addMobileControls();
}


window.onload = function() {
    displayScoreHistory();
    document.getElementById('fullscreenButton').style.display = 'block';
    loadLevelProgress();
    if (isMobile()) {
        document.getElementById('mobileControls').style.display = 'flex';
        addMobileControls();
    }
};
