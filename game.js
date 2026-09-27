const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const gameOverEl = document.getElementById("game-over");

const HIGH_SCORE_KEY = "snakeHighScore";
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const TICK_MS = 100;

let snake, direction, nextDirection, food, score, gameOver, timer;

function randomFood() {
  return {
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT),
  };
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  food = randomFood();
  score = 0;
  gameOver = false;
  scoreEl.textContent = "Score: 0";
  highScoreEl.textContent = `High Score: ${highScore}`;
  gameOverEl.classList.add("hidden");
}

function draw() {
  ctx.fillStyle = "#11111b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f9e2af";
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

  ctx.fillStyle = "#a6e3a1";
  for (const segment of snake) {
    ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
  }
}

function tick() {
  if (gameOver) return;

  direction = nextDirection;
  if (direction.x === 0 && direction.y === 0) {
    draw();
    return;
  }

  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  const hitWall =
    newHead.x < 0 || newHead.x >= TILE_COUNT || newHead.y < 0 || newHead.y >= TILE_COUNT;
  const hitSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 1;
    scoreEl.textContent = `Score: ${score}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_SCORE_KEY, highScore);
      highScoreEl.textContent = `High Score: ${highScore}`;
    }
    food = randomFood();
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  gameOver = true;
  gameOverEl.classList.remove("hidden");
}

document.addEventListener("keydown", (e) => {
  if (gameOver && e.code === "Space") {
    resetGame();
    return;
  }

  const opposite = (a, b) => a.x === -b.x && a.y === -b.y;
  let proposed = null;

  switch (e.key) {
    case "ArrowUp":
      proposed = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      proposed = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      proposed = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      proposed = { x: 1, y: 0 };
      break;
    default:
      return;
  }

  if (!opposite(proposed, direction)) {
    nextDirection = proposed;
  }
});

resetGame();
draw();
setInterval(tick, TICK_MS);
