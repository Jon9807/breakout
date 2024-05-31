export class Paddle {
    constructor(canvas, width, height, x) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.x = x;
        this.rightPressed = false;
        this.leftPressed = false;

        document.addEventListener('keydown', this.keyDownHandler.bind(this), false);
        document.addEventListener('keyup', this.keyUpHandler.bind(this), false);
        this.addTouchControls();
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.canvas.height - this.height, this.width, this.height);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }

    move() {
        if (this.rightPressed && this.x < this.canvas.width - this.width) {
            this.x += 10;
        } else if (this.leftPressed && this.x > 0) {
            this.x -= 10;
        }
    }

    keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.leftPressed = true;
        }
    }

    keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.leftPressed = false;
        }
    }

    addTouchControls() {
        let touchStartX = null;
        let touchEndX = null;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            let deltaX = touchEndX - touchStartX;
            if (deltaX > 30) {
                this.rightPressed = true;
                this.leftPressed = false;
            } else if (deltaX < -30) {
                this.leftPressed = true;
                this.rightPressed = false;
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.rightPressed = false;
            this.leftPressed = false;
        });
    }

    reset(x) {
        this.x = x;
    }
}
