const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const gameOverEl = document.getElementById("game-over");
const music = document.getElementById("bg-music");
music.volume = 0.5;

const HIGH_SCORE_KEY = "snakeHighScore";
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;

const CELL = 19;
const BLOCK = 15;
const INSET = (CELL - BLOCK) / 2;
const TILE_COUNT = canvas.width / CELL;
const TICK_MS = 100;

const FOOD_COLOR = "#FFCC00";
const HEAD_COLOR = "#0088FF";
const TAIL_NEAR = [0x8e, 0x8e, 0x93];
const TAIL_FAR = [0xc7, 0xc7, 0xcc];

let snake, direction, nextDirection, food, score, gameOver, started;

function randomFood() {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT),
    };
  } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  started = false;
  food = randomFood();
  score = 0;
  gameOver = false;
  scoreEl.textContent = "Score: 0";
  highScoreEl.textContent = `High Score: ${highScore}`;
  gameOverEl.classList.add("hidden");
  music.pause();
  music.currentTime = 0;
  draw();
}

function tailColor(index, count) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const rgb = TAIL_NEAR.map((near, i) => Math.round(near + (TAIL_FAR[i] - near) * t));
  return `rgb(${rgb.join(",")})`;
}

function drawBlock(cell, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(cell.x * CELL + INSET, cell.y * CELL + INSET, BLOCK, BLOCK, 1);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = "rgba(0, 0, 0, 0.17)";
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 3;

  drawBlock(food, FOOD_COLOR);

  const tail = snake.slice(1);
  for (let i = tail.length - 1; i >= 0; i--) {
    drawBlock(tail[i], tailColor(i, tail.length));
  }
  drawBlock(snake[0], HEAD_COLOR);
}

function tick() {
  if (gameOver || !started) return;

  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };
  const willEat = newHead.x === food.x && newHead.y === food.y;

  const hitWall =
    newHead.x < 0 || newHead.x >= TILE_COUNT || newHead.y < 0 || newHead.y >= TILE_COUNT;
  // The last tail segment moves out of the way this tick unless we're growing
  const body = willEat ? snake : snake.slice(0, -1);
  const hitSelf = body.some((s) => s.x === newHead.x && s.y === newHead.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (willEat) {
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
  music.pause();
}

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (gameOver) resetGame();
    return;
  }

  const proposed = KEY_DIRECTIONS[e.key];
  if (!proposed) return;
  e.preventDefault();

  const isReverse = proposed.x === -direction.x && proposed.y === -direction.y;
  if (!isReverse) {
    nextDirection = proposed;
    if (!started) {
      started = true;
      // Browsers block audio until a user gesture, so the first arrow press is where music can begin
      music.play().catch(() => {});
    }
  }
});

resetGame();
setInterval(tick, TICK_MS);
