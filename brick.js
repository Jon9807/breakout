//brick.js
export class Brick {
    constructor(x, y, width, height, status, powerUp) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.status = status;
        this.powerUp = powerUp;
    }

    draw(ctx) {
        if (this.status === 1) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.getColor();
            ctx.fill();
            ctx.closePath();
        }
    }

    getColor() {
        switch (this.powerUp) {
            case "yellow":
                return "yellow";
            case "green":
                return "green";
            case "red":
                return "red";
            case "blue":
                return "blue";
            default:
                return "purple";
        }
    }
}
