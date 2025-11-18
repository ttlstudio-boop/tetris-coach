import { BOARD_HEIGHT, BOARD_WIDTH, FIGURES_DATA } from '../constants';
import { GameState } from '../types';

export class Figure {
  x: number;
  y: number;
  type: number;
  color: number;
  rotation: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.type = Math.floor(Math.random() * FIGURES_DATA.length);
    this.color = Math.floor(Math.random() * (7)) + 1; // 1-7
    this.rotation = 0;
  }

  image() {
    return FIGURES_DATA[this.type][this.rotation];
  }

  rotate() {
    this.rotation = (this.rotation + 1) % FIGURES_DATA[this.type].length;
  }
}

export class TetrisEngine {
  height: number;
  width: number;
  field: number[][];
  score: number;
  state: GameState;
  figure: Figure | null;

  constructor(height: number = BOARD_HEIGHT, width: number = BOARD_WIDTH) {
    this.height = height;
    this.width = width;
    this.field = [];
    this.score = 0;
    this.state = GameState.START;
    this.figure = null;
    this.initField();
    this.newFigure();
  }

  initField() {
    this.field = [];
    for (let i = 0; i < this.height; i++) {
      let newLine = [];
      for (let j = 0; j < this.width; j++) {
        newLine.push(0);
      }
      this.field.push(newLine);
    }
  }

  newFigure() {
    this.figure = new Figure(3, 0);
  }

  intersects(): boolean {
    if (!this.figure) return false;
    let intersection = false;
    let img = this.figure.image();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let p = i * 4 + j;
        if (img.includes(p)) {
          let y = i + this.figure.y;
          let x = j + this.figure.x;

          if (y > this.height - 1 || x > this.width - 1 || x < 0 ||
             (this.field[y] && this.field[y][x] > 0)) {
            intersection = true;
          }
        }
      }
    }
    return intersection;
  }

  breakLines() {
    let lines = 0;
    for (let i = 1; i < this.height; i++) {
      let zeros = 0;
      for (let j = 0; j < this.width; j++) {
        if (this.field[i][j] === 0) zeros++;
      }
      if (zeros === 0) {
        lines++;
        for (let i1 = i; i1 > 0; i1--) {
          for (let j = 0; j < this.width; j++) {
            this.field[i1][j] = this.field[i1 - 1][j];
          }
        }
      }
    }
    this.score += lines ** 2;
  }

  goSpace() {
    if (!this.figure) return;
    while (!this.intersects()) {
      this.figure.y += 1;
    }
    this.figure.y -= 1;
    this.freeze();
  }

  goDown() {
    if (!this.figure) return;
    this.figure.y += 1;
    if (this.intersects()) {
      this.figure.y -= 1;
      this.freeze();
    }
  }

  freeze() {
    if (!this.figure) return;
    let img = this.figure.image();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let p = i * 4 + j;
        if (img.includes(p)) {
          if (this.field[i + this.figure.y]) {
            this.field[i + this.figure.y][j + this.figure.x] = this.figure.color;
          }
        }
      }
    }
    this.breakLines();
    this.newFigure();
    if (this.intersects()) {
      this.state = GameState.GAMEOVER;
    }
  }

  goSide(dx: number) {
    if (!this.figure) return;
    let oldX = this.figure.x;
    this.figure.x += dx;
    if (this.intersects()) {
      this.figure.x = oldX;
    }
  }

  rotateFig() {
    if (!this.figure) return;
    let oldRotation = this.figure.rotation;
    this.figure.rotate();
    if (this.intersects()) {
      this.figure.rotation = oldRotation;
    }
  }
  
  reset() {
    this.initField();
    this.score = 0;
    this.state = GameState.START;
    this.newFigure();
  }
}