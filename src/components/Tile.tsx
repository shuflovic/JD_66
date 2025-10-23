import React from 'react';
import { SHAPE_ICONS, COLOR_CLASSES } from '../constants';
import { Tile as TileType } from '../types';

interface TileProps {
  tile: TileType | null;
  onClick?: (() => void) | null | undefined;
  isSelected?: boolean;
  isGhost?: boolean;
  gridSize: number;
  isDiscardTarget?: boolean;
}

const Tile: React.FC<TileProps> = ({ 
  tile, 
  onClick, 
  isSelected = false, 
  isGhost = false, 
  gridSize, 
  isDiscardTarget = false 
}) => {
  if (!tile) {
    return null;
  }

  const TILE_SIZE_MAP: Record<number, { container: string; icon: string }> = {
    5: { container: 'w-16 h-16 md:w-24 md:h-24', icon: 'w-8 h-8 md:w-12 md:h-12' },
    6: { container: 'w-14 h-14 md:w-20 md:h-20', icon: 'w-7 h-7 md:w-10 md:h-10' },
    7: { container: 'w-12 h-12 md:w-16 md:h-16', icon: 'w-6 h-6 md:w-8 md:h-8' },
  };

  const sizes = TILE_SIZE_MAP[gridSize] || TILE_SIZE_MAP[5];

  const colorClass = COLOR_CLASSES[tile.color];
  const shapeIcon = SHAPE_ICONS[tile.shape];
  
  // FIXED: Using a pale yellow/amber base (like natural wood) with a dark border 
  // to ensure the shape colors are the focal point.
  const woodenBaseClasses = 'bg-yellow-100 border-2 border-yellow-900 shadow-md';
  const interactionClasses = onClick ? 'cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all duration-100 ease-out' : '';
    
  // Ring classes are based on your provided logic
  const selectedClasses = isSelected ? 'ring-4 ring-offset-2 ring-cyan-400 dark:ring-offset-gray-800' : '';
  const discardClasses = isDiscardTarget ? 'ring-4 ring-offset-2 ring-red-500 dark:ring-offset-gray-800 animate-pulse' : '';
  const ghostClasses = isGhost ? 'opacity-50' : '';
  
  // Replaced the original generic classes with the custom wooden/interaction classes
  const combinedClasses = [
    woodenBaseClasses, 
    selectedClasses, 
    discardClasses, 
    ghostClasses, 
    interactionClasses
  ].join(' ');

  return (
    <div 
      // Merged classes to achieve the new wooden style
      className={`flex items-center justify-center rounded-lg ${sizes.container} ${combinedClasses}`}
      onClick={onClick || undefined}
    >
      {/* The colorClass.text applies the vibrant color to the shape icon */}
      <div className={`flex items-center justify-center ${sizes.icon} ${colorClass.text}`}>
        {shapeIcon}
      </div>
    </div>
  );
};

export default Tile;
