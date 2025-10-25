
import React from 'react';
import Tile from './Tile';
import { Board as BoardType, Tile as TileType, Move } from '../types';

interface BoardProps {
  board: BoardType;
  onCellClick: (row: number, col: number) => void;
  onBoardTileClick: (row: number, col: number) => void;
  validMoves: Move[];
  selectedTile: TileType | null;
  selectedBoardTile: Move | null;
  adjacentCells: Move[];
  showHints: boolean;
  gridSize: number;
}

const Board: React.FC<BoardProps> = ({ 
  board, 
  onCellClick,
  onBoardTileClick,
  validMoves, 
  selectedTile,
  selectedBoardTile,
  adjacentCells, 
  showHints, 
  gridSize,
}) => {
  const gridColsMap: Record<number, string> = {
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
  };

  const gridColsClass = gridColsMap[gridSize] || 'grid-cols-5';

  const TILE_SIZE_MAP: Record<number, string> = {
    5: 'w-16 h-16 md:w-24 md:h-24',
    6: 'w-14 h-14 md:w-20 md:h-20',
    7: 'w-12 h-12 md:w-16 md:h-16',
  };

  const tileSizeClass = TILE_SIZE_MAP[gridSize] || TILE_SIZE_MAP[5];

  return (
    // Outer container changed to dark wood background with a pronounced border and shadow
    <div className="boarder-4 bg-gray-800 rounded-xl shadow-inner">
      <div className={`grid ${gridColsClass} gap-1`}>
        {board.map((row, r) =>
          row.map((tile, c) => {
            const isPlaced = !!tile;
            const isAdjacent = adjacentCells.some(move => move.row === r && move.col === c);
            const isValidMove = validMoves.some(move => move.row === r && move.col === c);
            const isClickablePlacement = selectedTile && (isAdjacent || !!selectedBoardTile);
            const isSelectedOnBoard = selectedBoardTile?.row === r && selectedBoardTile?.col === c;
            const isDarkSquare = (r + c) % 2 === 1;

            const getCellClasses = () => {
              // HINT/VALID MOVE: Use a vibrant lime green highlight for hints
              if (showHints && isValidMove) return 'bg-green-700 cursor-pointer';
              
              // CLICKABLE PLACEMENT: Use a soft amber highlight for placement zones
              if (isClickablePlacement) return 'bg-gray-600 cursor-pointer hover:bg-gray-500';
  
              // DEFAULT EMPTY CELL: Use alternating dark green/brown shades for an old board look
              return isDarkSquare ? 'gap-1 bg-gray-600' : 'bg-gray-600';
            };

            return (
              <div
                key={`${r}-${c}`}
                // Changed border color to dark green/brown for separation
                className={`flex gap-1 items-center border-2 border-black justify-center rounded-lg transition-colors ${tileSizeClass} ${getCellClasses()}`}
                onClick={() => !isPlaced && (isClickablePlacement || isValidMove) ? onCellClick(r, c) : undefined}
              >
                {isPlaced ? (
                  <Tile
                    tile={tile}
                    gridSize={gridSize}
                    isSelected={isSelectedOnBoard}
                    onClick={() => onBoardTileClick(r, c)}
                  />
                ) : (selectedTile && isValidMove && showHints) ? (
                  <Tile tile={selectedTile} isGhost={true} gridSize={gridSize} onClick={null} />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;
