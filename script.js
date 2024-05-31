const canvas = document.getElementById("myCanvas"); // Get the canvas element
const ctx = canvas.getContext("2d"); // Get the 2D drawing context for the canvas

const ballRadiusInitial = 5; // Initial radius of the ball
let ballRadius = ballRadiusInitial; // Variable to track current ball radius
let x = canvas.width / 2; // Initial x position of the ball
let y = canvas.height - 30; // Initial y position of the ball

let dx; // Change in x position of the ball
let dy; // Change in y position of the ball

const paddleHeight = 10; // Height of the paddle
let paddleWidth = 100; // Width of the paddle
let paddleX = (canvas.width - paddleWidth) / 2; // Initial x position of the paddle
let rightPressed = false; // Boolean to track if right arrow key is pressed
let leftPressed = false; // Boolean to track if left arrow key is pressed
let gamePaused = false; // Boolean to track if the game is paused

const brickRowCount = 10; // Number of rows of bricks
const brickColumnCount = 18; // Number of columns of bricks
const brickWidth = 28; // Width of each brick
const brickHeight = 20; // Height of each brick
const brickPadding = 5; // Padding between bricks
const brickOffsetTop = 30; // Offset from the top for the first row of bricks
const brickOffsetLeft = 5; // Offset from the left for the first column of bricks

const gridCellSize = Math.max(brickWidth, brickHeight); // Size of each grid cell for collision detection
const gridCols = Math.ceil(canvas.width / gridCellSize); // Number of columns in the grid
const gridRows = Math.ceil(canvas.height / gridCellSize); // Number of rows in the grid

// Initialize the grid for collision detection optimization
let grid = [];
for (let i = 0; i < gridCols; i++) { // Loop through each column
    grid[i] = [];
    for (let j = 0; j < gridRows; j++) { // Loop through each row in the column
        grid[i][j] = []; // Initialize each cell as an empty array
    }
}

// Initialize the bricks and assign them to grid cells
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) { // Loop through each column of bricks
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) { // Loop through each row in the column
        let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft; // Calculate x position of the brick
        let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop; // Calculate y position of the brick
        let brick = { x: brickX, y: brickY, status: 1, powerUp: null }; // Create a brick object with position and status
        bricks[c][r] = brick; // Add the brick to the array

        let gridX = Math.floor(brickX / gridCellSize); // Calculate the grid cell x index for the brick
        let gridY = Math.floor(brickY / gridCellSize); // Calculate the grid cell y index for the brick
        grid[gridX][gridY].push(brick); // Add the brick to the grid cell
    }
}

// Randomly assign power-ups to some bricks
function assignPowerUps() {
    let powerUpTypes = ["yellow", "green", "red", "blue"]; // Array of power-up types
    let numberOfPowerUps = 4; // Number of power-ups to assign
    for (let i = 0; i < numberOfPowerUps; i++) { // Loop to assign each power-up
        let powerUpBrick = bricks[Math.floor(Math.random() * brickColumnCount)][Math.floor(Math.random() * brickRowCount)]; // Select a random brick
        while (powerUpBrick.powerUp !== null) { // Ensure the brick doesn't already have a power-up
            powerUpBrick = bricks[Math.floor(Math.random() * brickColumnCount)][Math.floor(Math.random() * brickRowCount)]; // Select a new random brick
        }
        powerUpBrick.powerUp = powerUpTypes[i]; // Assign the power-up to the brick
    }
}

assignPowerUps(); // Call the function to assign power-ups

let score = 0; // Initialize the score
let lives = 3; // Initialize the number of lives
let animationFrameId; // Variable to track the animation frame ID

document.addEventListener("keydown", keyDownHandler, false); // Add event listener for keydown events
document.addEventListener("keyup", keyUpHandler, false); // Add event listener for keyup events
document.addEventListener("keydown", togglePause, false); // Add event listener for toggling pause

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") { // If right arrow key is pressed
        rightPressed = true; // Set rightPressed to true
    } else if (e.key === "Left" || e.key === "ArrowLeft") { // If left arrow key is pressed
        leftPressed = true; // Set leftPressed to true
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") { // If right arrow key is released
        rightPressed = false; // Set rightPressed to false
    } else if (e.key === "Left" || e.key === "ArrowLeft") { // If left arrow key is released
        leftPressed = false; // Set leftPressed to false
    }
}

function togglePause(e) {
    if (e.key === " " || e.key === "Spacebar") { // If spacebar is pressed
        e.preventDefault(); // Prevent default action
        gamePaused = !gamePaused; // Toggle gamePaused state
        if (!gamePaused) {
            draw(); // Resume drawing if the game is not paused
        }
    }
}

function collisionDetection() {
    let steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))); // Determine number of steps based on ball speed
    for (let i = 0; i <= steps; i++) { // Loop through each step
        let stepX = x + (dx * i) / steps; // Calculate x position for the step
        let stepY = y + (dy * i) / steps; // Calculate y position for the step
        let gridX = Math.floor(stepX / gridCellSize); // Calculate grid cell x index
        let gridY = Math.floor(stepY / gridCellSize); // Calculate grid cell y index

        for (let j = -1; j <= 1; j++) { // Loop through adjacent grid cells
            for (let k = -1; k <= 1; k++) {
                let newGridX = gridX + j; // Adjust grid x index
                let newGridY = gridY + k; // Adjust grid y index

                if (newGridX >= 0 && newGridX < gridCols && newGridY >= 0 && newGridY < gridRows) { // Check if the grid cell is valid
                    for (let b of grid[newGridX][newGridY]) { // Loop through each brick in the grid cell
                        if (b.status === 1) { // If the brick is active
                            if (stepX > b.x && stepX < b.x + brickWidth && stepY > b.y && stepY < b.y + brickHeight) { // Check for collision
                                dy = -dy; // Reverse ball direction
                                b.status = 0; // Deactivate the brick
                                score++; // Increment the score
                                increaseBallSpeed(); // Increase the ball speed
                                if (b.powerUp) {
                                    activatePowerUp(b.powerUp); // Activate power-up if the brick has one
                                }
                                if (score === brickRowCount * brickColumnCount) {
                                    showWinModal(); // Show win modal if all bricks are destroyed
                                }
                                return; // Exit the function
                            }
                        }
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath(); // Start drawing the ball
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2); // Draw the ball as a circle
    ctx.fillStyle = "#0095DD"; // Set the ball color
    ctx.fill(); // Fill the ball with color
    ctx.closePath(); // End drawing the ball
}

function drawPaddle() {
    ctx.beginPath(); // Start drawing the paddle
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight); // Draw the paddle as a rectangle
    ctx.fillStyle = "#0095DD"; // Set the paddle color
    ctx.fill(); // Fill the paddle with color
    ctx.closePath(); // End drawing the paddle
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) { // Loop through each column of bricks
        for (let r = 0; r < brickRowCount; r++) { // Loop through each row in the column
            if (bricks[c][r].status === 1) { // If the brick is active
                const brickX = bricks[c][r].x; // Get the x position of the brick
                const brickY = bricks[c][r].y; // Get the y position of the brick
                ctx.beginPath(); // Start drawing the brick
                ctx.rect(brickX, brickY, brickWidth, brickHeight); // Draw the brick as a rectangle
                if (bricks[c][r].powerUp === "yellow") {
                    ctx.fillStyle = "yellow"; // Set color for yellow power-up
                } else if (bricks[c][r].powerUp === "green") {
                    ctx.fillStyle = "green"; // Set color for green power-up
                } else if (bricks[c][r].powerUp === "red") {
                    ctx.fillStyle = "red"; // Set color for red power-up
                } else if (bricks[c][r].powerUp === "blue") {
                    ctx.fillStyle = "blue"; // Set color for blue power-up
                } else {
                    ctx.fillStyle = "purple"; // Set default brick color
                }
                ctx.fill(); // Fill the brick with color
                ctx.closePath(); // End drawing the brick
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial"; // Set font for score display
    ctx.fillStyle = "#0095DD"; // Set color for score text
    ctx.fillText("Score: " + score, 8, 20); // Display the score
}

function drawLives() {
    ctx.font = "16px Arial"; // Set font for lives display
    ctx.fillStyle = "#0095DD"; // Set color for lives text
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20); // Display the number of lives
}

function activatePowerUp(powerUp) {
    if (powerUp === "yellow") {
        // Increase paddle width
        paddleWidth *= 1.5; // Increase the paddle width by 50%
        setTimeout(() => {
            paddleWidth /= 1.5; // Reset the paddle width after 10 seconds
            assignNewPowerUp(); // Assign a new power-up
        }, 10000); // Duration of 10 seconds
    } else if (powerUp === "green") {
        // Increase ball size
        ballRadius *= 1.5; // Increase the ball radius by 50%
        setTimeout(() => {
            ballRadius = ballRadiusInitial; // Reset the ball radius after 10 seconds
            assignNewPowerUp(); // Assign a new power-up
        }, 10000); // Duration of 10 seconds
    } else if (powerUp === "red") {
        // Decrease ball speed
        dx *= 0.5; // Halve the ball's horizontal speed
        dy *= 0.5; // Halve the ball's vertical speed
        setTimeout(() => {
            dx *= 2; // Restore the ball's horizontal speed
            dy *= 2; // Restore the ball's vertical speed
            assignNewPowerUp(); // Assign a new power-up
        }, 10000); // Duration of 10 seconds
    } else if (powerUp === "blue") {
        // Increase lives
        lives += 1; // Increase the number of lives by 1
        assignNewPowerUp(); // Assign a new power-up
    }
}

function assignNewPowerUp() {
    let powerUpTypes = ["yellow", "green", "red", "blue"]; // Array of power-up types
    let newPowerUpBrick = bricks[Math.floor(Math.random() * brickColumnCount)][Math.floor(Math.random() * brickRowCount)]; // Select a random brick
    while (newPowerUpBrick.status !== 1 || newPowerUpBrick.powerUp !== null) { // Ensure the brick is active and doesn't already have a power-up
        newPowerUpBrick = bricks[Math.floor(Math.random() * brickColumnCount)][Math.floor(Math.random() * brickRowCount)]; // Select a new random brick
    }
    newPowerUpBrick.powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]; // Assign a random power-up to the brick
}

function randomizeBallDirection() {
    let angle = Math.random() * Math.PI / 4 + Math.PI / 4; // Randomize the ball's angle between 45 and 135 degrees
    let speed = 3; // Set the ball's initial speed
    dx = speed * Math.cos(angle); // Calculate the horizontal speed component
    dy = -speed * Math.sin(angle); // Calculate the vertical speed component
    if (Math.random() > 0.5) {
        dx = -dx; // Randomize the horizontal direction
    }
}

function increaseBallSpeed() {
    let speedMultiplier = 1.05; // Increase speed by 5%
    dx *= speedMultiplier; // Apply the multiplier to the horizontal speed
    dy *= speedMultiplier; // Apply the multiplier to the vertical speed
}

function draw() {
    if (gamePaused) return; // Stop drawing if the game is paused

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawBricks(); // Draw the bricks
    drawBall(); // Draw the ball
    drawPaddle(); // Draw the paddle
    drawScore(); // Draw the score
    drawLives(); // Draw the lives
    collisionDetection(); // Check for collisions

    // Wall collision detection
    if (x + dx > canvas.width - ballRadius || x - ballRadius < 0) {
        dx = -dx; // Reverse horizontal direction if the ball hits the left or right wall
    }
    if (y + dy < ballRadius) {
        dy = -dy; // Reverse vertical direction if the ball hits the top wall
    } else if (y + dy > canvas.height - ballRadius) {
        // Paddle collision detection
        if (x > paddleX && x < paddleX + paddleWidth) {
            // Adjust ball's direction based on where it hits the paddle
            let hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2); // Calculate the hit point on the paddle
            let angle = hitPoint * Math.PI / 3; // Adjust the ball's angle based on the hit point
            let speed = Math.sqrt(dx * dx + dy * dy); // Preserve the ball's speed
            dx = speed * Math.sin(angle); // Set the new horizontal speed
            dy = -speed * Math.cos(angle); // Set the new vertical speed
        } else {
            lives--; // Decrease the number of lives if the ball misses the paddle
            if (!lives) {
                showGameOverModal(); // Show the game over modal if no lives are left
            } else {
                x = canvas.width / 2; // Reset the ball's position
                y = canvas.height - 30; // Reset the ball's position
                randomizeBallDirection(); // Randomize the ball's direction
                paddleX = (canvas.width - paddleWidth) / 2; // Reset the paddle's position
            }
        }
    }

    // Paddle movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 10; // Move the paddle right if the right arrow key is pressed
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 10; // Move the paddle left if the left arrow key is pressed
    }

    x += dx; // Update the ball's x position
    y += dy; // Update the ball's y position
    animationFrameId = requestAnimationFrame(draw); // Request the next animation frame
}

document.getElementById("startButton").addEventListener("click", function() {
    canvas.style.display = "block"; // Display the canvas
    document.getElementById("startButton").style.display = "none"; // Hide the start button
    randomizeBallDirection(); // Randomize the ball's direction at the start
    draw(); // Start the game
});

function showGameOverModal() {
    const gameOverModal = document.getElementById("gameOverModal"); // Get the game over modal element
    gameOverModal.style.display = "flex"; // Display the game over modal
    cancelAnimationFrame(animationFrameId); // Cancel the current animation frame
}

function showWinModal() {
    const winModal = document.getElementById("winModal"); // Get the win modal element
    winModal.style.display = "flex"; // Display the win modal
    cancelAnimationFrame(animationFrameId); // Cancel the current animation frame
}

function hideModals() {
    document.getElementById("gameOverModal").style.display = "none"; // Hide the game over modal
    document.getElementById("winModal").style.display = "none"; // Hide the win modal
}

document.getElementById("gameOverButton").addEventListener("click", function() {
    hideModals(); // Hide modals when the game over button is clicked
    resetGame(); // Reset the game
});

document.getElementById("winButton").addEventListener("click", function() {
    hideModals(); // Hide modals when the win button is clicked
    resetGame(); // Reset the game
});

function resetGame() {
    score = 0; // Reset the score
    lives = 3; // Reset the number of lives
    x = canvas.width / 2; // Reset the ball's position
    y = canvas.height - 30; // Reset the ball's position
    ballRadius = ballRadiusInitial; // Reset the ball's radius
    randomizeBallDirection(); // Randomize the ball's direction
    paddleX = (canvas.width - paddleWidth) / 2; // Reset the paddle's position

    // Reset bricks
    for (let c = 0; c < brickColumnCount; c++) { // Loop through each column of bricks
        for (let r = 0; r < brickRowCount; r++) { // Loop through each row in the column
            bricks[c][r].status = 1; // Activate the brick
            bricks[c][r].powerUp = null; // Remove any power-up from the brick
        }
    }

    assignPowerUps(); // Reassign power-ups to bricks

    cancelAnimationFrame(animationFrameId); // Ensure the previous animation is canceled
    draw(); // Start a new animation
}
