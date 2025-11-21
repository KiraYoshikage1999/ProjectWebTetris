/* Board class definition */
export class Board {   
    constructor() {}

    // Draw a single cell at board coordinates
    drawCell(x, y, color) {
        const canvas = document.getElementById("board");
        const ctx = canvas.getContext("2d");
        const cell = 30;
        ctx.fillStyle = color;
        ctx.fillRect(x * cell, y * cell, cell, cell);
        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 2;
        ctx.strokeRect(x * cell, y * cell, cell, cell);
    }

    // Draw grid and locked cells and current figure
    drawBoard(currentFigure) {
        const canvas = document.getElementById("board");
        const ctx = canvas.getContext("2d");
        const cell = 30;
        const rows = 20;
        const cols = 10;
        const board = window.tetrisBoard; // reference to global board
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw grid and locked cells
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Draw grid (серая сетка)
                ctx.strokeStyle = "#666";
                ctx.lineWidth = 1;
                ctx.strokeRect(x * cell, y * cell, cell, cell);
                
                // Draw locked cells (цвет кирпича)
                if (board[y][x] !== 0) {
                    ctx.fillStyle = "#c85a3a";
                    ctx.fillRect(x * cell, y * cell, cell, cell);
                    // Add border for depth
                    ctx.strokeStyle = "#8b4513";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x * cell, y * cell, cell, cell);
                }
            }
        }

        // draw current falling figure (более яркий кирпич)
        currentFigure.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (!value) return;
                const x = currentFigure.x + dx;
                const y = currentFigure.y + dy;
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    this.drawCell(x, y, "#e8754a");
                }
            });
        });
    }
}

/* Figures */
export class RandomFigure extends Board {
    constructor() {
        super();
        this.x = 4; 
        this.y = 0;
        this.shape = this.Figure();
    }

    // Return a random figure (2D array of 0/1)
    Figure() {
        const figures = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 0, 0], [1, 1, 1]], // L
            [[0, 0, 1], [1, 1, 1]], // J
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]]  // Z
        ];
        const index = Math.floor(Math.random() * figures.length);
        return figures[index];
    }

    // Try to move figure down by one cell (respecting moveDelay)
    MovingFigureDown() {
        const rows = 20;
        const cols = 10;
        const moveDelay = 1000;
        const board = window.tetrisBoard;
        let lastMoveTime = window.lastMoveTime || 0;
        
        const currentTime = Date.now();
        if (currentTime - lastMoveTime < moveDelay) return; // not yet time

        // Check collision if moved down by 1
        let collision = false;
        this.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (!value) return;
                const newY = this.y + dy + 1;
                const newX = this.x + dx;
                // outside bottom
                if (newY >= rows) collision = true;
                // collision with locked cells on board
                else if (newX >= 0 && newX < cols && board[newY][newX] !== 0) collision = true;
            });
        });

        if (!collision) {
            this.y += 1;
        } else {
            // lock figure into the board
            this.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (!value) return;
                    const y = this.y + dy;
                    const x = this.x + dx;
                    if (y >= 0 && y < rows && x >= 0 && x < cols) board[y][x] = 1;
                });
            });
            // Clear completed rows
            this.ClearRows();
            // spawn a new figure
            const f = new RandomFigure();
            this.x = f.x; this.y = f.y; this.shape = f.shape;
        }

        window.lastMoveTime = currentTime;
    }

    // Handle keyboard input
    HandleKeyboardInput(event) {
        const rows = 20;
        const cols = 10;
        const board = window.tetrisBoard;
        let moved = false;

        if (event.key === 'ArrowLeft') {
            // Check if moving left won't cause collision
            let canMove = true;
            this.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (!value) return;
                    const newX = this.x + dx - 1;
                    const newY = this.y + dy;
                    if (newX < 0 || (newX < cols && newY < rows && board[newY][newX] !== 0)) {
                        canMove = false;
                    }
                });
            });
            if (canMove && this.x > 0) {
                this.x -= 1;
                moved = true;
            }
        } else if (event.key === 'ArrowRight') {
            // Check if moving right won't cause collision
            let canMove = true;
            this.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (!value) return;
                    const newX = this.x + dx + 1;
                    const newY = this.y + dy;
                    if (newX >= cols || (newX >= 0 && newY < rows && board[newY][newX] !== 0)) {
                        canMove = false;
                    }
                });
            });
            if (canMove && this.x < cols - 1) {
                this.x += 1;
                moved = true;
            }
        } else if (event.key === 'ArrowDown') {
            // Move down faster (same as automatic move, but triggered manually)
            let collision = false;
            this.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (!value) return;
                    const newY = this.y + dy + 1;
                    const newX = this.x + dx;
                    if (newY >= rows || (newX >= 0 && newX < cols && board[newY][newX] !== 0)) {
                        collision = true;
                    }
                });
            });
            if (!collision) {
                this.y += 1;
                moved = true;
            }
        } else if (event.key === 'ArrowUp') {
            let newShape = this.shape[0].map((_, index) => this.shape.map(row => row[index]).reverse());
            for(let i = 0; i < newShape.length; i++) {
                for(let j = 0; j < newShape[i].length; j++) {
                    const newX = this.x + j;
                    const newY = this.y + i;
                    if (newShape[i][j]) {
                        if (newX < 0 || newX >= cols || newY < 0 || newY >= rows || board[newY][newX] !== 0) {
                            return; // cannot rotate due to collision
                        }
                    }
                }
            }
            this.shape = newShape;
            moved = true;
        }
    }

    // Clear completed rows and update score
    ClearRows() {
        const rows = 20;
        const cols = 10;
        const board = window.tetrisBoard;
        const scoreElement = document.getElementById('score');
        
        let clearedRows = 0;
        
        // Check each row from bottom to top
        for (let i = rows - 1; i >= 0; i--) {
            // Check if row is completely filled
            if (board[i].every(cell => cell !== 0)) {
                // Remove the filled row
                board.splice(i, 1);
                // Add an empty row at the top
                board.unshift(Array(cols).fill(0));
                clearedRows++;
                i++; // Check this row again since we added new row at top
            }
        }
        
        // Update score
        if (clearedRows > 0) {
            let currentScore = parseInt(scoreElement.innerText) || 0;
            currentScore += clearedRows * 100; // 100 points per cleared row
            scoreElement.innerText = currentScore;
            window.score = currentScore;
        }
    }
}