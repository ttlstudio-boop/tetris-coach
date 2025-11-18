export enum GameState {
  START = 'start',
  PLAYING = 'playing',
  GAMEOVER = 'gameover'
}

export interface FigureData {
  x: number;
  y: number;
  type: number;
  color: number;
  rotation: number;
}

export type Grid = number[][];

export interface TetrisStats {
  score: number;
  lines: number;
  level: number;
}