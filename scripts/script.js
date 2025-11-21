import { RandomFigure, Board } from './BoardScript.js';

// Game constants
const rows = 20;
const cols = 10;
const cell = 30;
const moveDelay = 1000; // delay between automatic moves in ms

// Create empty board (rows x cols) and store it globally for access from FigureScript
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
window.tetrisBoard = board; // Make it accessible to Board class
window.lastMoveTime = 0; // Track timing for moves

// Create instances
let boardGame = new Board();
let figure = new RandomFigure();

// Register keyboard input (only once, not every frame!)
document.addEventListener('keydown', (event) => {
    figure.HandleKeyboardInput(event);
});

// Game loop variable to control execution
let gameRunning = false;
let animationFrameId = null;
let lastBonusTime = 0; // Track time for bonus points
const bonusInterval = 5000; // Give bonus every 5 seconds (5000 ms)
const bonusAmount = 5; // Points per interval

// Game loop
function gameLoop() {
    try {
        boardGame.drawBoard(figure);
        figure.MovingFigureDown();
        
        // Give bonus points every 5 seconds while playing
        if (gameRunning) {
            const currentTime = Date.now();
            if (currentTime - lastBonusTime > bonusInterval) {
                addTimeBonus();
                lastBonusTime = currentTime;
            }
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    } catch (error) {
        console.error("Error in game loop:", error);
    }
}

// Add bonus points for playing time
function addTimeBonus() {
    const scoreElement = document.getElementById('score');
    let currentScore = parseInt(scoreElement.innerText) || 0;
    currentScore += bonusAmount;
    scoreElement.innerText = currentScore;
    window.score = currentScore;
}

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
let gameActive = false;

// Start game
startButton.addEventListener('click', () => {
    gameActive = true;
    gameRunning = true;
    document.body.style.overflow = 'hidden'; // Блокируем скролл
    startButton.disabled = true; // Отключаем кнопку "Начать"
    stopButton.disabled = false; // Включаем кнопку "Остановить"
    gameLoop();
});

// Stop game
function gameStop() {
    gameActive = false;
    gameRunning = false;
    
    // Отменяем текущий анимационный кадр
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Save score to localStorage
    const finalScore = parseInt(document.getElementById('score').innerText) || 0;
    saveScore(finalScore);
    
    document.body.style.overflow = 'auto'; // Разрешаем скролл
    startButton.disabled = false; // Включаем кнопку "Начать"
    stopButton.disabled = true; // Отключаем кнопку "Остановить"
}

// Save score to localStorage
function saveScore(score) {
    const timestamp = new Date().toLocaleString();
    const scoreData = {
        score: score,
        date: timestamp
    };
    
    // Get existing scores
    let scores = JSON.parse(localStorage.getItem('tetrisScores')) || [];
    
    // Add new score
    scores.push(scoreData);
    
    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('tetrisScores', JSON.stringify(scores));
    
    // Update best score display
    updateBestScoreDisplay();
    
    console.log('Score saved:', scoreData);
    console.log('Top scores:', scores);
}

// Stop button event listener
stopButton.addEventListener('click', () => {
    gameStop();
});

// Отключаем кнопку "Остановить" при загрузке
stopButton.disabled = true;

// Load and display best scores
function loadBestScores() {
    const scores = JSON.parse(localStorage.getItem('tetrisScores')) || [];
    return scores;
}

// Get best score
function getBestScore() {
    const scores = loadBestScores();
    return scores.length > 0 ? scores[0].score : 0;
}

// Display best score in console (можно добавить на страницу позже)
console.log('🏆 Best scores:');
const topScores = loadBestScores();
topScores.forEach((score, index) => {
    console.log(`${index + 1}. ${score.score} points - ${score.date}`);
});

// Update best score display on page load
function updateBestScoreDisplay() {
    const bestScore = getBestScore();
    const bestScoreElement = document.getElementById('bestScore');
    if (bestScoreElement) {
        bestScoreElement.innerText = bestScore;
    }
}

// Update display on page load
updateBestScoreDisplay();

