import React from "react";
import Tile from "./Tile";
import { Tile as TileType } from "../types";

interface PlayerHandProps {
  hand: TileType[];
  onTileClick: (index: number) => void;
  selectedTileIndex: number | null;
  gridSize: number;
  isBoardTileSelected: boolean;
  onMoveToHand: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  onTileClick,
  selectedTileIndex,
  gridSize,
  isBoardTileSelected,
  onMoveToHand,
}) => {
  const gridClass: Record<number, string> = {
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
  };

  const TILE_SIZE_MAP: Record<number, string> = {
    5: "w-16 h-16 md:w-24 md:h-24",
    6: "w-14 h-14 md:w-20 md:h-20",
    7: "w-12 h-12 md:w-16 md:h-16",
  };

  const tileSizeClass = TILE_SIZE_MAP[gridSize] || TILE_SIZE_MAP[5];

  return (

    <div className="shadow-2xl p-2 bg-amber-900 border-6 border-stone-950 rounded-xl">
      {/* Tile Container: uses flex for cleaner wrapping/spacing */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-2">
        {hand.map((tile, index) => (
          <div
            key={index}
            // Removed fixed size class here as Tile handles it, kept flex layout
            className="flex items-center justify-center rounded-md transition-transform duration-100 ease-out hover:scale-105"
          >
            <Tile
              tile={tile}
              gridSize={gridSize}
              isSelected={selectedTileIndex === index}
              isGhost={false}
              onClick={() => onTileClick(index)}
            />
          </div>
        ))}
      </div>

      {isBoardTileSelected && (
        <button
          onClick={onMoveToHand}
          // Button styled for a deep, rich wood/gold effect
          className="mt-4 w-full 
                     bg-gradient-to-br from-yellow-700 to-yellow-900 
                     hover:from-yellow-600 hover:to-yellow-800 
                     text-yellow-100 
                     font-sans font-bold py-3 px-6 
                     rounded-lg 
                     border-2 border-yellow-950 
                     shadow-2xl 
                     transition-all duration-50 
                     active:scale-[0.98] 
                     tracking-wider uppercase"
        >
          Move to Hand
        </button>
      )}
    </div>
  );
};
