const gameScreen = document.getElementById('gameScreen');
let dino, ground, clouds = [];
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let isPaused = false;
let gameStarted = false;
let currentLevel = 1;
let obstacleInterval, cloudInterval;
const JUMP_HEIGHT = 300;
const CLOUD_COUNT = 3;

const LEVELS = {
    1: { speed: 2, interval: 2000, backgroundImage: 'url("/assets/game-background.jpg")' },
    2: { speed: 5, interval: 1500, backgroundImage: 'url("/assets/game-background.jpg")' },
    3: { speed: 8, interval: 1000, backgroundImage: 'url("/assets/game-background.jpg")' },
    4: { speed: 12, interval: 800, backgroundImage: 'url("/assets/game-background.jpg")' }
};

function init() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('homeBtn').addEventListener('click', backToHome);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('playAgainBtn').addEventListener('click', restartGame);
    document.getElementById('homeBtnWin').addEventListener('click', backToHome);

    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentLevel = parseInt(this.getAttribute('data-level'));
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameSpeed = LEVELS[currentLevel].speed;
        });
    });

    document.querySelector('.level-btn[data-level="1"]').classList.add('active');
}

function resetGameObjects() {
    document.querySelectorAll('.dino, .obstacle-low, .obstacle-high, .ground, .cloud').forEach(el => el.remove());

    dino = document.createElement('div');
    dino.className = 'dino';
    gameScreen.appendChild(dino);

    ground = document.createElement('div');
    ground.className = 'ground';
    gameScreen.appendChild(ground);

    clouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
        spawnCloud();
    }
}

function spawnCloud() {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.left = `${1500 + Math.random() * 500}px`;
    cloud.style.top = `${20 + Math.random() * 100}px`;
    cloud.style.animation = `moveCloud ${20 + Math.random() * 10}s linear`;
    gameScreen.appendChild(cloud);
    clouds.push(cloud);

    cloud.addEventListener('animationend', () => {
        if (!isGameOver && !isPaused) {
            cloud.remove();
            clouds = clouds.filter(c => c !== cloud);
            spawnCloud();
        }
    });
}

function startGame() {
    if (gameStarted) return;

    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    gameStarted = true;
    isGameOver = false;
    isPaused = false;
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameWin').style.display = 'none';

    resetGameObjects();
    gameScreen.style.background = LEVELS[currentLevel].backgroundImage;
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    gameScreen.style.backgroundRepeat = 'no-repeat'; 
    gameSpeed = LEVELS[currentLevel].speed;

    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(spawnObstacle, LEVELS[currentLevel].interval);
    gameLoop();
}

function gameLoop() {
    if (isGameOver || isPaused) return;

    const dinoRect = dino.getBoundingClientRect();
    const obstacles = document.querySelectorAll('.obstacle-low, .obstacle-high');
    
    for (const obstacle of obstacles) {
        const obsRect = obstacle.getBoundingClientRect();
        
        if (checkCollision(dinoRect, obsRect)) {
            if (dinoRect.bottom > obsRect.top && dinoRect.top < obsRect.bottom) {
                gameOver();
                return;
            }
        }
        
        if (obsRect.right < dinoRect.left && !obstacle.passed) {
            obstacle.passed = true;
            score += 1;
            document.getElementById('score').textContent = score;
            
            if (score >= 20) {
                gameWin();
                return;
            }
        }
        
        if (obsRect.right < 0) {
            obstacle.remove();
        }
    }

    requestAnimationFrame(gameLoop);
}

function spawnObstacle() {
    if (isGameOver || isPaused) return;

    const isHigh = Math.random() > 0.5;
    const obstacle = document.createElement('div');
    obstacle.className = isHigh ? 'obstacle-high' : 'obstacle-low';
    obstacle.style.left = '1500px';
    obstacle.style.animation = `moveObstacle ${10 / gameSpeed}s linear`;
    gameScreen.appendChild(obstacle);

    obstacle.addEventListener('animationend', () => {
        if (!isGameOver && !isPaused) obstacle.remove();
    });
}

function handleKeyDown(e) {
    if (e.code === 'Space' && gameStarted && !isPaused && !dino.classList.contains('jumping') && !isGameOver) {
        jump();
    }
    if (e.code === 'ArrowDown' && gameStarted && !isPaused && !dino.classList.contains('jumping') && !isGameOver) {
        duck();
    }
    if (e.code === 'Escape' && gameStarted) {
        togglePause();
    }
}

function handleKeyUp(e) {
    if (e.code === 'ArrowDown' && gameStarted && !isPaused && !isGameOver) {
        standUp();
    }
}

function jump() {
    dino.classList.add('jumping');
    dino.style.bottom = `${JUMP_HEIGHT}px`;
    
    setTimeout(() => {
        if (!isGameOver) {
            dino.style.bottom = '10px';
            dino.classList.remove('jumping');
        }
    }, 600);
}

function duck() {
    dino.classList.add('ducking');
}

function standUp() {
    dino.classList.remove('ducking');
}

function checkCollision(rect1, rect2) {
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
}

function gameOver() {
    isGameOver = true;
    gameStarted = false;
    clearInterval(obstacleInterval);
    
    document.querySelectorAll('.obstacle-low, .obstacle-high').forEach(obstacle => {
        obstacle.style.animationPlayState = 'paused';
    });
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('gameWin').style.display = 'none';
}

function gameWin() {
    isGameOver = true;
    gameStarted = false;
    clearInterval(obstacleInterval);
    
    dino.classList.remove('jumping', 'ducking');
    dino.style.bottom = '10px';
    dino.style.transition = 'none';
    
    document.querySelectorAll('.obstacle-low, .obstacle-high').forEach(obstacle => {
        obstacle.style.animationPlayState = 'paused';
    });
    
    document.getElementById('gameWin').style.display = 'block';
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameWin').style.display = 'none';
    resetGameObjects();
    startGame();
}

function backToHome() {
    isGameOver = true;
    gameStarted = false;
    clearInterval(obstacleInterval);
    
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameWin').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
}

function togglePause() {
    if (!gameStarted || isGameOver) return;
    
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        document.querySelectorAll('.obstacle-low, .obstacle-high, .cloud').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        document.querySelectorAll('.obstacle-low, .obstacle-high, .cloud').forEach(el => {
            el.style.animationPlayState = 'running';
        });
        gameLoop();
    }
}

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes moveObstacle {
        from { left: 1500px; }
        to { left: -80px; }
    }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
    @keyframes moveCloud {
        from { left: 1500px; }
        to { left: -80px; }
    }
`, styleSheet.cssRules.length);

window.onload = init;