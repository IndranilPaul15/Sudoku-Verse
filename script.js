const board = document.getElementById('sudoku-board');
const message = document.getElementById('message');
let timerInterval;
let seconds = 0;

const initialPuzzle = generatePuzzle();
const solvedPuzzle = [...Array(9)].map(() => Array(9).fill(0));
solveSudoku([...initialPuzzle.map(row => [...row])], solvedPuzzle);

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
            } else {
                cell.addEventListener('input', validateInput);
            }

            board.appendChild(cell);
        });
    });
}

function validateInput(e) {
    const input = e.target;
    const val = parseInt(input.value);
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);

    if (isNaN(val) || val < 1 || val > 9) {
        input.value = '';
        input.classList.remove('error');
        return;
    }

    if (!isValid(val, row, col)) {
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}

function isValid(val, row, col) {
    const cells = document.querySelectorAll('input');
    for (let i = 0; i < 9; i++) {
        const rowCell = cells[row * 9 + i];
        const colCell = cells[i * 9 + col];
        if ((rowCell.value == val && i !== col) || (colCell.value == val && i !== row)) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const idx = (boxRow + i) * 9 + (boxCol + j);
            const boxCell = cells[idx];
            if (boxCell.value == val && (boxRow + i !== row || boxCol + j !== col)) return false;
        }
    }
    return true;
}

function checkSolution() {
    const inputs = document.querySelectorAll('input');
    let correct = true;

    inputs.forEach(input => {
        if (!input.classList.contains('prefilled')) {
            const row = Number(input.getAttribute('data-row'));
            const col = Number(input.getAttribute('data-col'));
            const value = Number(input.value);

            // Skip if empty or NaN
            if (value) {
                if (isNaN(value) || value < 1 || value > 9) {
                    input.classList.add('error');
                    correct = false;
                    return;
                }


                // console.log(`User: ${value}, Correct: ${solvedPuzzle[row][col]}`);

                if (solvedPuzzle[row][col] !== value) {
                    input.classList.add('error');
                    correct = false;
                } else {
                    input.classList.remove('error');
                }
            }
        }
    });
    // console.log('correct', correct)
    if (correct) {
        message.textContent = '🎉 Puzzle Solved!';
        message.style.color = '#00ff99';
        clearInterval(timerInterval);
        updateStats();
    } else {
        message.textContent = '❌ Some entries are incorrect!';
        message.style.color = '#ff0044';
    }
}

function resetBoard() {
    if (!confirm("Reset your progress?")) return;
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (!input.classList.contains('prefilled')) {
            input.value = '';
            input.classList.remove('error');
        }
    });
    message.textContent = '';
    seconds = 0;
    updateTimer();
}

function newGame() {
    clearInterval(timerInterval);
    seconds = 0;
    updateTimer();
    timerInterval = setInterval(() => {
        seconds++;
        updateTimer();
    }, 1000);
    const puzzle = generatePuzzle();
    solveSudoku([...puzzle.map(row => [...row])], solvedPuzzle);
    createBoard(puzzle);
    message.textContent = '';
}

function updateTimer() {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `⏱ Time: ${mins}:${secs}`;
}

function updateStats() {
    let solved = parseInt(localStorage.getItem('solved') || '0');
    solved++;
    localStorage.setItem('solved', solved);
    document.getElementById('solved-count').textContent = solved;
}

function toggleTheme() {
    document.body.classList.toggle('dark');
}

function giveHint() {
    const inputs = document.querySelectorAll('input');
    for (let input of inputs) {
        if (!input.classList.contains('prefilled') && input.value === '') {
            const r = Number(input.dataset.row), c = Number(input.dataset.col);
            input.value = solvedPuzzle[r][c];
            break;
        }
    }
}

// ==== Sudoku Generator ====
function generatePuzzle() {
    const puzzle = [...Array(9)].map(() => Array(9).fill(0));
    solveSudoku(puzzle);
    removeCells(puzzle, 40); // Moderate difficulty
    return puzzle;
}

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

function solveSudoku(board, storeSolution = null) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isSafe(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board, storeSolution)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    if (storeSolution) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                storeSolution[i][j] = board[i][j];
            }
        }
    }
    return true;
}

function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num ||
            board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
            return false;
        }
    }
    return true;
}

// ==== Init ====
window.onload = () => {
    newGame();
    document.getElementById('solved-count').textContent = localStorage.getItem('solved') || '0';
};
