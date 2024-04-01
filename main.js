class MineSweeper {
  /**
   * @typedef {Object} Cell
   * @property {HTMLElement} element - The DOM element representing the cell.
   * @property {('NOT_PLAYED'|'PLAYED'|'FLAGGED'|'REVEALED')} state - The state of the cell.
   * @property {boolean} bomb - Whether the cell contains a bomb.
   * @property {number} bombsCount - The number of bombs in adjacent cells.
   */

  constructor(width, height, numberOfBombs, context) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.numberOfBombs = numberOfBombs;
    this.state;
    this.cells;
    this.cellBombs;
    this.rowStyleClasses = ['flex', 'h-10'];
    this.cellStyleClasses = ['w-10', 'border', 'bg-gray-400', 'text-center'];
    this.NumberOfFlags;
    this.timer;
    this.timerInterval;
    this.playedCells;
    this.dashBoard = {};
    this.init();
  }

  init() {
    this.state = 'NOT_STARTED';
    this.NumberOfFlags = 0;
    this.timer = 0;
    this.cellBombs = [];
    this.dashBoard = {};
    this.playedCells = 0;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = null;
    const cells = new Array(this.height);
    this.cells = cells;
    for (let i = 0; i < this.height; i++) {
      cells[i] = new Array(this.width);
      for (let j = 0; j < this.width; j++) {
        cells[i][j] = { bomb: false, checked: false, state: "NOT_PLAYED", bombsCount: 0, row: i, col: j }
      }
    }

    for (let i = 0; i < this.numberOfBombs; i++) {
      let [x, y] = this.randomxy();
      while(cells[x][y].bomb === true)
        [x, y] = this.randomxy();
      const cell = cells[x][y];
      cell.bomb= true;
      this.cellBombs.push(cell);
    }

    for (let cell of this.cellBombs) {
      for (const neighborCell of this.getNeighbors(cell))
        neighborCell.bombsCount++;
    }

    this.initContext();
    this.initDashBoard();
    this.initCells();
  }

  initContext() {
    while (this.context.firstChild)
      this.context.removeChild(this.context.firstChild);
    this.context.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    })
  }

  initDashBoard() {
    this.dashBoard = {};
    const dashBoard = document.createElement('div');
    const control = document.createElement('div');
    control.classList.add('flex', 'justify-between', 'items-center', 'w-full', 'p-2', 'bg-gray-200', 'mt-2');
    const widthInput = document.createElement('input');
    widthInput.setAttribute('type', 'number');
    widthInput.placeholder = 'Width';
    const heightInput = document.createElement('input');
    heightInput.setAttribute('type', 'number');
    heightInput.placeholder = 'Height';
    const bombsInput = document.createElement('input');
    bombsInput.setAttribute('type', 'number');
    bombsInput.placeholder = 'number of bombs';

    const info = document.createElement('div');
    const remainingBombs = document.createElement('div');
    remainingBombs.innerHTML = this.numberOfBombs;
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
    const timer = document.createElement('div');
    timer.innerHTML = 0;

    restartButton.addEventListener('click', () => this.restartGame());

    const gameStatus = document.createElement('div');
    gameStatus.classList.add('font-extrabold', 'text-center', 'text-3xl', 'w-full');

    info.classList.add('flex', 'justify-between', 'items-center', 'w-full', 'p-2', 'bg-gray-200', 'mt-2');
    info.append(remainingBombs, restartButton, timer);

    control.append(widthInput, heightInput, bombsInput);
    dashBoard.append(gameStatus, control, info);
    this.context.prepend(dashBoard);

    this.dashBoard.root = dashBoard;
    this.dashBoard.control = control;
    this.dashBoard.widthInput = widthInput;
    this.dashBoard.heightInput = heightInput;
    this.dashBoard.bombsInput = bombsInput;
    this.dashBoard.info = info;
    this.dashBoard.remainingBombs = remainingBombs;
    this.dashBoard.restartButton = restartButton;
    this.dashBoard.timer = timer;
    this.dashBoard.gameStatus = gameStatus;
  }

  restartGame() {
    if (this.dashBoard.widthInput.value && this.dashBoard.heightInput.value && this.dashBoard.bombsInput.value) {
      this.width = parseInt(this.dashBoard.widthInput.value);
      this.height = parseInt(this.dashBoard.heightInput.value);
      this.numberOfBombs = parseInt(this.dashBoard.bombsInput.value);
    }
    this.init();
  }

  randomxy() {
    const x = Math.floor(Math.random() * this.height);
    const y = Math.floor(Math.random() * this.width);
    return [x, y];
  }

  getNeighbors(cell) {
    const offSets = [-1, 0, 1]
    const neighbors = []

    for (let dx of offSets) {
      for (let dy of offSets) {
        const x = cell.row + dx;
        const y = cell.col + dy;

        if (x < 0 || x >= this.height || y < 0 || y >= this.width || dx === 0 && dy === 0) continue;
        neighbors.push(this.cells[x][y])
      }
    }

    return neighbors;
  }

  newRow() {
    const row = document.createElement('div');
    row.classList.add(...this.rowStyleClasses);
    this.context.appendChild(row);
    return row;
  }

  newCell(parent) {
    const cellElement = document.createElement('div');
    this.cellStyleClasses.forEach((cssClass) => cellElement.classList.add(cssClass));
    parent.appendChild(cellElement);
    return cellElement;
  }

  handleRightClick(cell) {
    switch (cell.state) {
      case "PLAYED":
      case "REVEALED":
        break;
      case "NOT_PLAYED":
        this.flagCell(cell);
        break;
      case "FLAGED":
        this.unflagCell(cell);
        break;
      default:
        throw new Error("Invalid cell state");
    }
  }

  handleLeftClick(cell) {
    cell.state = 'PLAYED';
    if (cell.bomb) {
      this.endGame();
      return;
    }
    this.markEmptyCell(cell);
    this.playedCells++;
    if (cell.bombsCount === 0) {
      this.expandSafeCells(cell);
    }
    if (this.playedCells === this.width * this.height - this.numberOfBombs) {
      this.state = 'WON';
      clearInterval(this.timerInterval);
      this.dashBoard.gameStatus.innerHTML = 'You won!';
    }
  }

  flagCell(cell) {
    cell.element.innerHTML = 'f';
    cell.state = 'FLAGED';
    this.NumberOfFlags++;
    this.dashBoard.remainingBombs.innerHTML = this.numberOfBombs - this.NumberOfFlags;
  }

  unflagCell(cell) {
    cell.element.innerHTML = '';
    cell.state = 'NOT_PLAYED';
    this.NumberOfFlags--;
    this.dashBoard.remainingBombs.innerHTML = this.numberOfBombs - this.NumberOfFlags;
  }

  isPlaying() {
    return this.state === 'STARTED' || this.state === 'NOT_STARTED';
  }

  /**
   * Handles the click event on a cell.
   * @param {Event} e - The click event object.
   * @param {Cell} cell - The cell object representing the clicked cell.
   */
  handleClick(e, cell) {
    if (!this.isPlaying() || cell.state === 'PLAYED' || cell.state === 'REVEALED') {
      return;
    }

    if (this.state === 'NOT_STARTED') {
      this.state = 'STARTED';
      this.startTimer();
    }

    switch (e.button) {
      case 0:
        this.handleLeftClick(cell);
        break;
      case 1:
        console.log("middle mouse button");
        break;
      case 2:
        this.handleRightClick(cell);
        break;
    }
  }

  initCells() {
    for (let i = 0; i < this.height; i++) {
      const row = this.newRow();
      for (let j = 0; j < this.width; j++) {
        const cell = this.cells[i][j];
        const cellElement = this.newCell(row);
        cell.element = cellElement;
        cellElement.addEventListener('mouseup', (e) => this.handleClick(e, cell))
      }
    }
  }

  markEmptyCell(cell) {
    if (cell.bombsCount > 0) {
      cell.element.className = 'w-10 border bg-gray-300 text-center'
      cell.element.innerHTML = cell.bombsCount;
    } else {
      cell.element.className = 'w-10 border bg-gray-200 text-center'
    }
  }

  expandSafeCells(cell) {
    for (let neighborCell of this.getNeighbors(cell)) {
      this.markEmptyCell(neighborCell);
      this.playedCells++;
      if (neighborCell.bombsCount === 0 && 
        (neighborCell.state === 'FLAGED' || neighborCell.state === 'NOT_PLAYED')) {
        neighborCell.state = 'REVEALED';
        this.expandSafeCells(neighborCell);
      } else {
        neighborCell.state = 'REVEALED';
      }
    }
  }

  endGame() {
    this.state = 'LOST';
    this.revealBombs();
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.dashBoard.gameStatus.innerHTML = 'You lost!';
  }

  revealBombs() {
    for (let cell of this.cellBombs) {
      cell.element.innerHTML = 'B';
      cell.element.className = 'w-10 border bg-red-500 text-center'
    }
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.dashBoard.timer.innerHTML = this.timer;
    }, 1000);
  }
}


const SIZE = 10;
const NUMBER_OF_BOMBS = 11

let width = SIZE;
let height = SIZE;
let bombs = NUMBER_OF_BOMBS;

let game = new MineSweeper(width, height, bombs, app);