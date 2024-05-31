import { Ball } from './ball.js';
import { Paddle } from './paddle.js';
import { Brick } from './brick.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ballRadiusInitial = 5;
        this.ball = new Ball(canvas, canvas.width / 2, canvas.height - 30, this.ballRadiusInitial, 2, -2);
        this.paddle = new Paddle(canvas, 100, 10, (canvas.width - 100) / 2);
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.gamePaused = false;
        this.animationFrameId = null;

        this.brickWidth = 28;
        this.brickHeight = 20;
        this.brickPadding = 5;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 5;

        this.updateBrickCounts();

        this.maxSpeed = 10; // Set the maximum speed for the ball

        this.initBricks();
        this.assignPowerUps();

        document.addEventListener('keydown', this.keyDownHandler.bind(this), false);
        document.addEventListener('keyup', this.keyUpHandler.bind(this), false);
        document.addEventListener('keydown', this.togglePause.bind(this), false);
    }

    updateBrickCounts() {
        this.brickColumnCount = Math.floor((this.canvas.width - this.brickOffsetLeft) / (this.brickWidth + this.brickPadding));
        this.brickRowCount = Math.floor((this.canvas.height / 2 - this.brickOffsetTop) / (this.brickHeight + this.brickPadding));
    }

    initBricks() {
        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                let brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                let brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                this.bricks[c][r] = new Brick(brickX, brickY, this.brickWidth, this.brickHeight, 1, null);
            }
        }
    }

    assignPowerUps() {
        let powerUpTypes = ["yellow", "green", "red", "blue"];
        let numberOfPowerUps = 4;
        for (let i = 0; i < numberOfPowerUps; i++) {
            let powerUpBrick = this.getRandomBrick();
            while (powerUpBrick.powerUp !== null) {
                powerUpBrick = this.getRandomBrick();
            }
            powerUpBrick.powerUp = powerUpTypes[i];
        }
    }

    getRandomBrick() {
        const c = Math.floor(Math.random() * this.brickColumnCount);
        const r = Math.floor(Math.random() * this.brickRowCount);
        return this.bricks[c][r];
    }

    keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.paddle.rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.paddle.leftPressed = true;
        }
    }

    keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.paddle.rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.paddle.leftPressed = false;
        }
    }

    togglePause(e) {
        if (e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            this.gamePaused = !this.gamePaused;
            if (!this.gamePaused) {
                this.draw();
            }
        }
    }

    start() {
        this.randomizeBallDirection();
        this.draw();
    }

    randomizeBallDirection() {
        let angle = Math.random() * Math.PI / 4 + Math.PI / 4;
        let speed = 3;
        this.ball.dx = speed * Math.cos(angle);
        this.ball.dy = -speed * Math.sin(angle);
        if (Math.random() > 0.5) {
            this.ball.dx = -this.ball.dx;
        }
    }

    draw() {
        if (this.gamePaused) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.ball.draw();
        this.paddle.draw();
        this.drawScore();
        this.drawLives();
        this.collisionDetection();

        this.ball.move();
        this.paddle.move();

        this.wallCollision();
        this.paddleCollision();

        this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
    }

    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r].draw(this.ctx);
            }
        }
    }

    drawScore() {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fillText("Score: " + this.score, 8, 20);
    }

    drawLives() {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 65, 20);
    }

    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                let b = this.bricks[c][r];
                if (b.status === 1) {
                    if (this.ball.x > b.x && this.ball.x < b.x + this.brickWidth && this.ball.y > b.y && this.ball.y < b.y + this.brickHeight) {
                        this.ball.dy = -this.ball.dy;
                        b.status = 0;
                        this.score++;
                        this.increaseBallSpeed();
                        if (b.powerUp) {
                            this.activatePowerUp(b.powerUp);
                        }
                        if (this.checkWinCondition()) {
                            this.showWinModal();
                        }
                    }
                }
            }
        }
    }

    checkWinCondition() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    return false;
                }
            }
        }
        return true;
    }

    wallCollision() {
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
            this.adjustBallAngle(); // Slightly adjust the angle
        }
        if (this.ball.y + this.ball.dy < this.ball.radius) {
            this.ball.dy = -this.ball.dy;
            this.adjustBallAngle(); // Slightly adjust the angle
        } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
            if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
                this.paddleCollision();
            } else {
                this.lives--;
                if (!this.lives) {
                    this.showGameOverModal();
                } else {
                    this.ball.reset(this.canvas.width / 2, this.canvas.height - 30, 2, -2);
                    this.paddle.reset((this.canvas.width - this.paddle.width) / 2);
                    this.randomizeBallDirection(); // Randomize the direction on reset
                }
            }
        }
    }

    paddleCollision() {
        if (this.ball.y + this.ball.dy > this.canvas.height - this.paddle.height - this.ball.radius) {
            if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
                let hitPoint = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
                let angle = hitPoint * Math.PI / 3;
                let speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                this.ball.dx = speed * Math.sin(angle);
                this.ball.dy = -speed * Math.cos(angle);
            }
        }
    }

    adjustBallAngle() {
        if (Math.abs(this.ball.dy) < 0.1) {
            this.ball.dy += (Math.random() - 0.5) * 0.2;
        }
        if (Math.abs(this.ball.dx) < 0.1) {
            this.ball.dx += (Math.random() - 0.5) * 0.2;
        }
    }

    increaseBallSpeed() {
        const speedMultiplier = 1.05;
        const currentSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        const newSpeed = Math.min(currentSpeed * speedMultiplier, this.maxSpeed);
        const angle = Math.atan2(this.ball.dy, this.ball.dx);

        this.ball.dx = newSpeed * Math.cos(angle);
        this.ball.dy = newSpeed * Math.sin(angle);
    }

    activatePowerUp(powerUp) {
        if (powerUp === "yellow") {
            this.paddle.width *= 1.5;
            setTimeout(() => {
                this.paddle.width /= 1.5;
                this.assignNewPowerUp();
            }, 10000);
        } else if (powerUp === "green") {
            this.ball.radius *= 1.5;
            setTimeout(() => {
                this.ball.radius = this.ballRadiusInitial;
                this.assignNewPowerUp();
            }, 10000);
        } else if (powerUp === "red") {
            this.ball.dx *= 0.5;
            this.ball.dy *= 0.5;
            setTimeout(() => {
                this.ball.dx *= 2;
                this.ball.dy *= 2;
                this.assignNewPowerUp();
            }, 10000);
        } else if (powerUp === "blue") {
            this.lives += 1;
            this.assignNewPowerUp();
        }
    }

    assignNewPowerUp() {
        let powerUpTypes = ["yellow", "green", "red", "blue"];
        let newPowerUpBrick = this.getRandomBrick();
        while (newPowerUpBrick.status !== 1 || newPowerUpBrick.powerUp !== null) {
            newPowerUpBrick = this.getRandomBrick();
        }
        newPowerUpBrick.powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    }

    showGameOverModal() {
        document.getElementById('gameOverModal').style.display = 'flex';
        cancelAnimationFrame(this.animationFrameId);
    }

    showWinModal() {
        document.getElementById('winModal').style.display = 'flex';
        cancelAnimationFrame(this.animationFrameId);
    }
}
