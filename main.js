const SIZE = 13;
const NUMBER_OF_BOMBS = 18

class MineSweeper {
  /**
   * @typedef {Object} Cell
   * @property {HTMLElement} element - The DOM element representing the cell.
   * @property {('NOT_PLAYED'|'PLAYED'|'FLAGGED'|'REVEALED')} state - The state of the cell.
   * @property {boolean} bomb - Whether the cell contains a bomb.
   * @property {number} bombsCount - The number of bombs in adjacent cells.
   */

  constructor(width, height, numberOfBombs, context) {
    this.isPlaying = true;
    this.context = context;
    this.width = width;
    this.height = height;
    this.numberOfBombs = numberOfBombs;
    this.cells = [];
    this.cellBombs = [];
    this.rowStyleClasses = ['flex', 'h-10'];
    this.cellStyleClasses = ['w-10', 'border', 'bg-gray-400', 'text-center'];
    this.init();
    this.initContext();
    this.initCells();
  }

  init() {
    const cells = new Array(this.width);
    this.cells = cells;
    for (let i = 0; i < this.width; i++) {
      cells[i] = new Array(this.height);
      for (let j = 0; j < this.height; j++) {
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
  }

  initContext() {
    while (this.context.firstChild)
      this.context.removeChild(this.context.firstChild);
    this.context.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    })
  }

  restartGame(width, height, bombsNumber) {
    this.width = width;
    this.height = height;
    this.bombsNumber = bombsNumber;
    this.cells = [];
    this.cellBombs = [];
    this.isPlaying = true;
    this.init();
    this.initContext();
    this.initCells();
  }

  randomxy() {
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(Math.random() * this.height);
    return [x, y];
  }

  getNeighbors(cell) {
    const d = [-1, 0, 1]
    const neighbors = []
    for (let di of d) {
      for (let dj of d) {
        const x = cell.row + di;
        const y = cell.col + dj;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
        neighbors.push(this.cells[x][y])
      }
    }
    return neighbors;
  }

  newRow() {
    const row = document.createElement('div');
    //TODO: row.classList.add(...this.rowStyleClasses);
    this.rowStyleClasses.forEach((cssClass) => row.classList.add(cssClass));
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
    console.log("right mouse button");
    console.log(cell.state);
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
    console.log("left mouse button");
    if (cell.state === 'PLAYED' || cell.state === 'REAVELED')
      return;
    cell.state = 'PLAYED';
    if (cell.bomb) {
      this.isPlaying = false;
      console.log('boom');
      return;
    }
    this.markEmptyCell(cell);
    if (cell.bombsCount === 0) {
      this.expandSafeCells(cell);
    }
  }

  flagCell(cell) {
    cell.element.innerHTML = 'f';
    cell.state = 'FLAGED';
  }

  unflagCell(cell) {
    cell.element.innerHTML = '';
    cell.state = 'NOT_PLAYED';
  }

  /**
   * Handles the click event on a cell.
   * @param {Event} e - The click event object.
   * @param {Cell} cell - The cell object representing the clicked cell.
   */
  handleClick(e, cell) {
    if (!this.isPlaying || cell.state === 'PLAYED' || cell.state === 'REVEALED') {
      return;
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
    for (let i = 0; i < this.width; i++) {
      const row = this.newRow();
      for (let j = 0; j < this.height; j++) {
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
      if (neighborCell.bombsCount === 0 && 
        (neighborCell.state === 'FLAGED' || neighborCell.state === 'NOT_PLAYED')) {
        neighborCell.state = 'REVEALED';
        this.expandSafeCells(neighborCell);
      } else {
        neighborCell.state = 'REVEALED';
      }
    }
  }
}

// let isPlaying = true;

// function newCells(size, bombsNumber) {
//   const cells = new Array(size);
//   const bombs = [];
//   for (let i = 0; i < size; i++) {
//     cells[i] = new Array(size);
//     for (let j = 0; j < size; j++) {
//       cells[i][j] = { bomb: false, checked: false, bombsCount: 0 }
//     }
//   }

//   for (let i = 0; i < bombsNumber; i++) {
//     let [x, y] = randomxy();
//     while(cells[x][y].bomb)
//       [x, y] = randomxy();
//     cells[x][y].bomb = true;
//     bombs.push([x, y])
//   }

//   const d = [-1, 0, 1]
//   for (let [i, j] of bombs) {
//     for (const [x, y] of getNeighbors(i, j))
//       cells[x][y].bombsCount++;
//   }

//   function randomxy() {
//     const x = Math.floor(Math.random() * size);
//     const y = Math.floor(Math.random() * size);
//     return [x, y];
//   }

//   return [cells, bombs];
// }

// let [cells, bombs] = newCells(SIZE, NUMBER_OF_BOMBS);

// const app = document.getElementById("app");
// app.addEventListener('contextmenu', (e) => {
//   e.preventDefault();
// })

// function initGame() {
//   [cells, bombs] = newCells(SIZE, NUMBER_OF_BOMBS);
//   isPlaying = true;
//   while (app.firstChild)
//     app.removeChild(app.firstChild);

//   for (let i = 0; i < SIZE; i++) {
//     const row = document.createElement('div');
//     row.classList.add('flex', 'h-10');
//     app.appendChild(row);
//     for (let j = 0; j < SIZE; j++) {
//       const cell = cells[i][j];
//       const cellElement = document.createElement('div');
//       cellElement.className = 'w-10 border bg-gray-400 text-center'
//       cell.element = cellElement;
//       let flaged = false;
//       cellElement.addEventListener('mouseup', (e) => {
//         if (!isPlaying) return;
//         switch (e.button) {
//           case 0:
//             console.log("left mouse button");
//             if (cell.bomb) {
//               isPlaying = false;
//               console.log('boom');
//             } else {
//               markEmptyCell(cell);
//               if (cell.bombsCount === 0) {
//                 expandSafeCells(i, j);
//               }
//             }
//             break;
//           case 1:
//             console.log("middle mouse button");
//             break;
//           case 2:
//             console.log("right mouse button");
//             if (!flaged) {
//               cellElement.innerHTML = 'f';
//               flaged = true;
//             }
//             else {
//               cellElement.innerHTML = '';
//               flaged = false;
//             }
//             break;
//         }
//       })
//       row.appendChild(cellElement);
//     }
//   }
// }


// function markEmptyCell(cell) {
//   if (cell.bombsCount > 0) {
//     cell.element.className = 'w-10 border bg-gray-300 text-center'
//     cell.element.innerHTML = cell.bombsCount;
//   } else {
//     cell.element.className = 'w-10 border bg-gray-200 text-center'
//   }
// }

// function expandSafeCells(i, j) {
//   cells[i][j].checked = true;
//   const neighbors = getNeighbors(i, j);
//   for (let [x, y] of neighbors) {
//     const cell = cells[x][y];
//     markEmptyCell(cell);
//     if (cell.bombsCount === 0 && !cell.checked) {
//       cell.checked = true;
//       expandSafeCells(x, y);
//     }
//   }
// }

// function getNeighbors(i, j) {
//   const d = [-1, 0, 1]
//   const neighbors = []
//   for (let di of d) {
//     for (let dj of d) {
//       const x = i + di;
//       const y = j + dj;
//       if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue;
//       neighbors.push([x, y])
//     }
//   }
//   return neighbors;
// }

// let [cells, bombs] = newCells(SIZE, NUMBER_OF_BOMBS);

const app = document.getElementById("app");

let game = new MineSweeper(SIZE, SIZE, NUMBER_OF_BOMBS, app);

document.getElementById("restart").addEventListener('click', () => {
  game = new MineSweeper(SIZE, SIZE, NUMBER_OF_BOMBS, app);
});
// document.getElementById("restart").addEventListener('click', initGame);
// initGame();