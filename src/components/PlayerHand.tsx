
import React from "react";
import Tile from "./Tile";
import { Tile as TileType } from "../types";

interface PlayerHandProps {
  hand: TileType[];
  onTileClick: (index: number) => void;
  selectedTileIndex: number | null;
  gridSize: number;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  onTileClick,
  selectedTileIndex,
  gridSize,
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
    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Tile Container: uses flex for cleaner wrapping/spacing */}
      <div className="flex justify-center items-center gap-2 md:gap-4 min-h-[88px] md:min-h-[110px]">
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
    </div>
  );
};
