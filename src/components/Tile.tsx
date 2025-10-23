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
  
  const styledBaseClasses = `border-4 shadow-lg shadow-black/30 ${colorClass.bg} ${colorClass.border} rounded-lg`;
 
  const interactionClasses = onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 ease-out' : '';
    
  // Ring classes
  const selectedClasses = isSelected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-amber-900' : '';
  const discardClasses = isDiscardTarget ? 'ring-4 ring-red-400 ring-offset-2 ring-offset-amber-900 animate-pulse' : '';
  const ghostClasses = isGhost ? 'opacity-60' : '';
  
  const combinedClasses = [
    styledBaseClasses, 
    selectedClasses, 
    discardClasses, 
    ghostClasses, 
    interactionClasses
  ].join(' ');

  return (
    <div 
      className={`flex items-center justify-center ${sizes.container} ${combinedClasses}`}
      onClick={onClick}
    >
      <div className={`flex items-center justify-center ${sizes.icon} ${colorClass.text}`}>
        {shapeIcon}
      </div>
    </div>
  );
};

export default Tile;
