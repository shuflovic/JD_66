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

export interface BoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  onBoardTileClick: (row: number, col: number) => void;
  validMoves: Move[];
  selectedTile: Tile | null;
  selectedBoardTile: Move | null;
  adjacentCells: Move[];
  showHints: boolean;
}
