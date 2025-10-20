export enum GameState {
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Tile {
  id: number;
  color: string;
  shape: string;
}

export type Board = (Tile | null)[][];

export interface Move {
  row: number;
  col: number;
}
