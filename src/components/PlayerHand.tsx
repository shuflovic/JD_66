import React from "react";

interface Tile {
  color: string;
  shape: string;
}

interface PlayerHandProps {
  hand: Tile[];
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

  return (
    <div className="p-4 bg-gray-800 rounded-xl">
      <div className={`grid gap-2 ${gridClass[gridSize] || "grid-cols-6"}`}>
        {hand.map((tile, index) => (
          <div
            key={index}
            onClick={() => onTileClick(index)}
            className={`p-3 rounded-lg border cursor-pointer transition-transform transform hover:scale-105 ${
              selectedTileIndex === index
                ? "border-yellow-400 scale-105"
                : "border-gray-600"
            }`}
            style={{
              backgroundColor: tile.color,
            }}
          >
            <span className="text-gray-100 text-lg font-semibold">
              {tile.shape}
            </span>
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
