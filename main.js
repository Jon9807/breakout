import { Game } from './game.js';

let game;

function initGame() {
    const canvas = document.getElementById('myCanvas');
    game = new Game(canvas);
    setCanvasSize(canvas);
    game.updateBrickCounts();
    game.initBricks();
    game.assignPowerUps(); // Ensure power-ups are assigned after bricks are initialized
    canvas.style.display = 'block';
    game.start();
}

function setCanvasSize(canvas) {
    if (window.innerWidth < 768) {
        canvas.width = window.innerWidth * 0.9;
        canvas.height = canvas.width * 700 / 600; // maintain the aspect ratio
    } else {
        canvas.width = 600;
        canvas.height = 700;
    }
}

document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startButton').style.display = 'none';
    initGame();
});

document.getElementById('gameOverButton').addEventListener('click', () => {
    document.getElementById('gameOverModal').style.display = 'none';
    initGame();
});

document.getElementById('winButton').addEventListener('click', () => {
    document.getElementById('winModal').style.display = 'none';
    initGame();
});

window.addEventListener('resize', () => {
    if (game) {
        const canvas = document.getElementById('myCanvas');
        setCanvasSize(canvas);
        game.updateBrickCounts();
        game.initBricks();
        game.assignPowerUps(); // Reassign power-ups on resize
        game.draw();
    }
});
