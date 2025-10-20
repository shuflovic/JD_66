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
    <div className="p-4 bg-gray-800 rounded-xl">
      <div className={`grid gap-2 ${gridClass[gridSize] || "grid-cols-6"}`}>
        {hand.map((tile, index) => (
          <div
            key={index}
            onClick={() => onTileClick(index)}
            className={`flex items-center justify-center rounded-md cursor-pointer transition-transform transform hover:scale-105 border ${
              selectedTileIndex === index ? "border-yellow-400" : "border-gray-600"
            } ${tileSizeClass}`}
          >
            <Tile tile={tile} gridSize={gridSize} />
          </div>
        ))}
      </div>

      {isBoardTileSelected && (
        <button
          onClick={onMoveToHand}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Move to Hand
        </button>
      )}
    </div>
  );
};
