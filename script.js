
  const board = document.getElementById('sudoku-board');
  const message = document.getElementById('message');
  let timerInterval;
  let seconds = 0;
  let solvedPuzzle = Array.from({ length: 9 }, () => Array(9).fill(0));

  // Create board UI from puzzle array
  function createBoard(puzzle) {
    board.innerHTML = '';
    puzzle.forEach((row, i) => {
      row.forEach((num, j) => {
        const cell = document.createElement('input');
        cell.setAttribute('maxlength', '1');
        cell.dataset.row = i;
        cell.dataset.col = j;

        if (num !== 0) {
          cell.value = num;
          cell.classList.add('prefilled');
          cell.readOnly = true;
        } else {
          cell.value = '';
          cell.readOnly = false;
          cell.addEventListener('input', validateInput);
        }
        board.appendChild(cell);
      });
    });
  }

  // Validate user input to be digit 1-9 or clear
  function validateInput(e) {
    const input = e.target;
    const val = input.value;

    if (val === '') {
      input.classList.remove('error');
      return;
    }

    if (!/^[1-9]$/.test(val)) {
      input.value = '';
      input.classList.remove('error');
    } else {
      input.classList.remove('error');
    }
  }

  // Check if user input matches solved puzzle
  function checkSolution() {
    const inputs = document.querySelectorAll('#sudoku-board input');
    let correct = true;

    inputs.forEach(input => {
      const row = parseInt(input.dataset.row, 10);
      const col = parseInt(input.dataset.col, 10);
      const val = parseInt(input.value, 10);

      if (isNaN(val)) {
        input.classList.add('error');
        correct = false;
        return;
      }

      if (val !== solvedPuzzle[row][col]) {
        input.classList.add('error');
        correct = false;
      } else {
        input.classList.remove('error');
      }
    });

    if (correct) {
      message.textContent = '🎉 Puzzle Solved!';
      message.style.color = '#00aa00';
      clearInterval(timerInterval);
      updateStats();
    } else {
      message.textContent = '❌ Entries are incorrect or incomplete!';
      message.style.color = '#cc0000';
    }
  }

  // Reset all editable cells to empty
  function resetBoard() {
    if (!confirm('Reset your progress?')) return;
    const inputs = document.querySelectorAll('#sudoku-board input');
    inputs.forEach(input => {
      if (!input.classList.contains('prefilled')) {
        input.value = '';
        input.classList.remove('error');
      }
    });
    message.textContent = '';
    seconds = 0;
    updateTimer();
    startTimer();
  }

  // Start a new game
  function newGame() {
    clearInterval(timerInterval);
    seconds = 0;
    updateTimer();
    startTimer();

    const puzzle = generatePuzzle();
    const solution = puzzle.map(row => [...row]);
    solveSudoku(solution);
    solvedPuzzle = solution;
    createBoard(puzzle);
    message.textContent = '';
  }

  // Timer update display
  function updateTimer() {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `⏱ Time: ${mins}:${secs}`;
  }

  // Start timer interval
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      seconds++;
      updateTimer();
    }, 1000);
  }

  // Update solved count in local storage and display
  function updateStats() {
    let solved = parseInt(localStorage.getItem('solved') || '0', 10);
    solved++;
    localStorage.setItem('solved', solved);
    document.getElementById('solved-count').textContent = `Solved: ${solved}`;
  }

  // Give a hint by filling one empty cell correctly
  function giveHint() {
    const inputs = document.querySelectorAll('#sudoku-board input');
    for (const input of inputs) {
      if (!input.classList.contains('prefilled') && input.value === '') {
        const r = parseInt(input.dataset.row, 10);
        const c = parseInt(input.dataset.col, 10);
        input.value = solvedPuzzle[r][c];
        input.classList.remove('error');
        break;
      }
    }
  }

  // Sudoku solver using backtracking
  function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // Check if placing num at (row,col) is safe
  function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (
        board[row][x] === num ||
        board[x][col] === num ||
        board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + (x % 3)] === num
      ) {
        return false;
      }
    }
    return true;
  }

  // Generate a full solved puzzle and then remove cells for the game
  function generatePuzzle() {
    const puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
    solveSudoku(puzzle);
    removeCells(puzzle, 40); // remove 40 cells to create puzzle
    return puzzle;
  }

  // Remove cells from puzzle randomly
  function removeCells(grid, count) {
    while (count > 0) {
      const i = Math.floor(Math.random() * 9);
      const j = Math.floor(Math.random() * 9);
      if (grid[i][j] !== 0) {
        grid[i][j] = 0;
        count--;
      }
    }
  }

  // Initialize game on page load
  window.onload = () => {
    newGame();
    const solved = localStorage.getItem('solved') || '0';
    document.getElementById('solved-count').textContent = `Solved: ${solved}`;
  };

