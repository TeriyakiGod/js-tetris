///Tetris

//Constants
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextBlockCanvas = document.getElementById('nextBlock');
const nextBlockContext = nextBlockCanvas.getContext('2d');
const scoreElement = document.getElementById("score");

const row = 40;
const column = 10;
const cellSize = 40;
const vacant = 'BLACK'; //Color of a vacant cell

//Variables
let gameStarted = false;
let gameOver = false;
let score = 0;
let p = generateRandomPiece();
let nextPiece = generateRandomPiece();

//CellFilling
function fillCell(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    context.strokeStyle = 'WHITE';
    context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function fillNextBlockCell(x, y, color) {
    nextBlockContext.fillStyle = color;
    nextBlockContext.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    nextBlockContext.strokeStyle = 'WHITE';
    nextBlockContext.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

//Board
function generateBoard() {
    let board = [];
    for (let r = 0; r < row; r++) {
        board[r] = [];
        for (let c = 0; c < column; c++) {
            board[r][c] = vacant;
        }
    }
    return board;
}

function drawBoard() {
    for (let r = 20; r < row; r++) {
        for (let c = 0; c < column; c++) {
            fillCell(c, r, board[r][c]);
        }
    }
}

let board = generateBoard();
drawBoard();

//NextBlock
function generateNextBlockBoard() {
    let board = [];
    for (let r = 0; r < 4; r++) {
        board[r] = [];
        for (let c = 0; c < 4; c++) {
            board[r][c] = vacant;
        }
    }
    return board;
}

function drawNextBlockBoard() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            nextBlockContext.fillStyle = 'BLACK';
            nextBlockContext.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            nextBlockContext.strokeStyle = 'WHITE';
            nextBlockContext.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }
}

let nextBlockBoard = generateNextBlockBoard();
drawNextBlockBoard();

//Tetrimino
function Tetrimino(tetrimino, color) {
    this.tetrimino = tetrimino;
    this.color = color;
    this.tetriminoRotation = 0;
    this.x = 3;
    if (tetrimino === O) {
        this.y = 17;
    }
    else {
        this.y = 18;
    }
    this.activeTetrimino = this.tetrimino[this.tetriminoRotation];
}

Tetrimino.prototype.fill = function (color) {
    for (let r = 0; r < this.activeTetrimino.length; r++) {
        for (let c = 0; c < this.activeTetrimino.length; c++) {
            if (this.activeTetrimino[r][c]) {
                if (this.y + r > 19) {
                    fillCell(this.x + c, this.y + r, color);
                }
            }
        }
    }
}

Tetrimino.prototype.fillNextBlock = function (color) {
    for (let r = 0; r < this.activeTetrimino.length; r++) {
        for (let c = 0; c < this.activeTetrimino.length; c++) {
            if (this.activeTetrimino[r][c]) {
                fillNextBlockCell(c, r, color);
            }
        }
    }
}

Tetrimino.prototype.drawNextBlock = function () {
    this.fillNextBlock(this.color);
}

Tetrimino.prototype.unDrawNextBlock = function () {
    this.fillNextBlock(vacant);
}

Tetrimino.prototype.draw = function () {
    this.fill(this.color);
}

Tetrimino.prototype.unDraw = function () {
    this.fill(vacant);
}

Tetrimino.prototype.lock = function () {
    for (let r = 0; r < this.activeTetrimino.length; r++) {
        for (let c = 0; c < this.activeTetrimino.length; c++) {
            if (!this.activeTetrimino[r][c]) {
                continue;
            }
            if (this.y + r < 20) {
                alert("Game over");
                gameOver = true;
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }
    //remove full rows
    for (let r = 0; r < row; r++) {
        let isRowFull = true;
        for (let c = 0; c < column; c++) {
            isRowFull = isRowFull && (board[r][c] != vacant);
        }
        if (isRowFull) {
            for (y = r; y > 1; y--) {
                for (let c = 0; c < column; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }
            for (y = row; y > 1; y--) {
                for (let c = 0; c < column; c++) {
                    board[0][c] = vacant;
                }
            }
            score += 10;
        }
        drawBoard();
        //UpdateScore
        scoreElement.innerHTML = score;
    }
}

Tetrimino.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetrimino)) {
        this.unDraw();
        this.y++;
        this.draw();
    }
    else {
        //lock
        this.lock();
        p = nextPiece;
        nextPiece = generateRandomPiece();
        drawNextBlockBoard();
        nextPiece.drawNextBlock();
    }
}

Tetrimino.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetrimino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

Tetrimino.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetrimino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

Tetrimino.prototype.rotateRight = function () {
    let nextRotation = this.tetrimino[(this.tetriminoRotation + 1) % this.tetrimino.length];
    let wallKick = 0;
    if (this.collision(0, 0, nextRotation)) {
        if (this.x > column / 2) {
            //right wall
            wallKick = -1;
        }
        else {
            //left wall
            wallKick = 1;
        }
    }
    if (!this.collision(wallKick, 0, nextRotation)) {
        this.unDraw();
        this.x += wallKick;
        this.tetriminoRotation = (this.tetriminoRotation + 1) % this.tetrimino.length;
        this.activeTetrimino = this.tetrimino[this.tetriminoRotation];
        this.draw();
    }
}

//Tetrimino collision detection
Tetrimino.prototype.collision = function (x, y, tetrimino) {
    for (let r = 0; r < tetrimino.length; r++) {
        for (let c = 0; c < tetrimino.length; c++) {
            if (!tetrimino[r][c]) {
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= column || newY >= row) {
                return true;
            }
            if (newY < 0) {
                continue;
            }
            if (board[newY][newX] != vacant) {
                return true;
            }
        }
    }
}

//INPUT
let input = document.addEventListener('keydown', control);

function control(event) {
    if (gameStarted && !gameOver) {
        switch (event.keyCode) {
            case 37:
                //Left arrow
                p.moveLeft();
                break;
            case 38:
                //Up arrow
                p.rotateRight();
                break;
            case 39:
                //Right arrow
                p.moveRight();
                break;
            case 40:
                //Down arrow
                p.moveDown();
                break;
        }
    }
}

//Drop
let dropStart = Date.now();
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

//Generate random tetrimino
function generateRandomPiece() {
    let random = Math.floor(Math.random() * tetriminos.length);
    return new Tetrimino(tetriminos[random][0], tetriminos[random][1]);
}

//Start Game
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        dropStart = Date.now();
        p.draw();
        drop();
        nextPiece.drawNextBlock();
    }
    else {
        score = 0;
        scoreElement.innerHTML = score;
        gameOver = false;
        board = generateBoard();
        drawBoard();
        dropStart = Date.now();
        p = generateRandomPiece();
        nextPiece = generateRandomPiece();
        drawNextBlockBoard();
        nextPiece.drawNextBlock();
        drop();
    }
}

