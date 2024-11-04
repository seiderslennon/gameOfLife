const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const metronomeLight = document.getElementById('metronomeLight');
const bpmInput = document.getElementById('bpmInput');
const resolution = 10; // Size of each cell in pixels

let cols, rows, grid, intervalId;
let running = false;
let bpm = 60; // Initial BPM value
let generationInterval = (60000 / bpm); // Interval in ms per generation based on BPM
let multiplier = 1; // Start with Quarter (1x)

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / resolution);
  rows = Math.floor(canvas.height / resolution);
  grid = createGrid(); // Initialize grid on canvas resize
  drawGrid(); // Ensure grid is drawn after resizing
}

function createGrid() {
  return new Array(cols).fill(null).map(() =>
    new Array(rows).fill(0)
  );
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.forEach((col, x) => {
    col.forEach((cell, y) => {
      ctx.beginPath();
      ctx.rect(x * resolution, y * resolution, resolution, resolution);
      ctx.fillStyle = cell ? '#61dafb' : '#282c34';
      ctx.fill();
      ctx.stroke();
    });
  });
}

function nextGen() {
  const nextGen = createGrid();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const neighbors = countNeighbors(grid, x, y);
      const cell = grid[x][y];
      if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
        nextGen[x][y] = 0;
      } else if (cell === 0 && neighbors === 3) {
        nextGen[x][y] = 1;
      } else {
        nextGen[x][y] = cell;
      }
    }
  }
  grid = nextGen;
  drawGrid();
  flashMetronomeLight(); // Flash the light with each generation
}

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) continue;
      const col = (x + i + cols) % cols;
      const row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  return sum;
}

function toggleGame() {
  const button = document.getElementById('startStopButton');
  if (running) {
    stopGame();
    button.textContent = "Start";
  } else {
    startGame();
    button.textContent = "Stop";
  }
}

function startGame() {
  if (!running) {
    running = true;
    intervalId = setInterval(nextGen, generationInterval / multiplier);
  }
}

function stopGame() {
  running = false;
  clearInterval(intervalId);
}

function clearGrid() {
  grid = createGrid();
  drawGrid();
}

function updateSpeed() {
  bpm = parseInt(bpmInput.value) || 60; // Fallback to 60 BPM if input is invalid
  bpmInput.value = bpm; // Ensure displayed BPM matches validated value
  generationInterval = 60000 / bpm; // Calculate ms per beat

  if (running) {
    clearInterval(intervalId); // Clear current interval
    intervalId = setInterval(nextGen, generationInterval / multiplier); // Restart with new interval
  }
}

function cycleSpeedMultiplier() {
  const multiplierButton = document.getElementById('speedMultiplierButton');
  if (multiplier === 1) {
    multiplier = 2; // Change from Quarter to Eighth
    multiplierButton.textContent = "Eighth";
  } else if (multiplier === 2) {
    multiplier = 4; // Change from Eighth to Sixteenth
    multiplierButton.textContent = "Sixteenth";
  } else {
    multiplier = 1; // Reset back to Quarter
    multiplierButton.textContent = "Quarter";
  }

  if (running) {
    clearInterval(intervalId); // Clear current interval
    intervalId = setInterval(nextGen, generationInterval / multiplier); // Apply new multiplier
  }
}

function flashMetronomeLight() {
  metronomeLight.style.backgroundColor = 'lightgreen'; // Flash the light
  setTimeout(() => {
    metronomeLight.style.backgroundColor = 'gray'; // Reset to gray after flash
  }, 100);
}

canvas.addEventListener('click', (event) => {
  const x = Math.floor(event.offsetX / resolution);
  const y = Math.floor(event.offsetY / resolution);
  grid[x][y] = grid[x][y] ? 0 : 1;
  drawGrid();
});

// Resize canvas and initialize grid on load and when window resizes
window.addEventListener('load', () => {
  resizeCanvas(); // Initialize the canvas and grid when the page loads
});
window.addEventListener('resize', resizeCanvas);
