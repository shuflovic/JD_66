import React from 'react';
import { TileData } from '../types'; 
import { SHAPE_ICONS, COLOR_CLASSES } from '../constants'; 

interface TileProps {
    tile: TileData;
    isDraggable?: boolean;
    onTileClick?: (tile: TileData) => void;
    onDragStart?: (event: React.DragEvent<HTMLDivElement>, tile: TileData) => void;
    isGhost?: boolean;
}

const Tile: React.FC<TileProps> = ({ 
    tile, 
    isDraggable = false, 
    onTileClick, 
    onDragStart, 
    isGhost = false 
}) => {
    const { color, shape } = tile;
    
    // Default to 'red' if color is undefined for safety, though TileData should prevent this.
    const { bg, text } = COLOR_CLASSES[color] || { bg: 'bg-red-500', text: 'text-white' };
    const icon = SHAPE_ICONS[shape];

    const baseClasses = "w-full h-full flex items-center justify-center p-1.5 rounded-lg transition-transform duration-100 ease-in-out";
    
    // Style for the inner shape layer (colored inset)
    const shapeClasses = `${bg} ${text} rounded-lg shadow-inner-lg shadow-black/30`;
    
    // Style for the outer tile body (light wood)
    const tileClasses = `
        w-14 h-14 sm:w-16 sm:h-16 
        bg-amber-100 border-2 border-amber-300 rounded-lg 
        shadow-lg cursor-pointer 
        hover:shadow-xl hover:ring-2 hover:ring-amber-500/50
        ${isDraggable ? 'active:scale-95' : ''}
        ${isGhost ? 'opacity-50 pointer-events-none' : 'opacity-100'}
    `;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onTileClick) {
            e.stopPropagation();
            onTileClick(tile);
        }
    };

    return (
        <div 
            className={tileClasses}
            draggable={isDraggable}
            onDragStart={isDraggable ? (e) => onDragStart && onDragStart(e, tile) : undefined}
            onClick={handleClick}
            // Prevent default drag events on the hand tile when clicking 
            onMouseDown={(e) => isDraggable && e.preventDefault()}
        >
            <div className={baseClasses}>
                <div className={`${shapeClasses} w-full h-full p-1`}>
                    <div className="w-full h-full">
                        {/* Render the SVG icon */}
                        {React.cloneElement(icon, { 
                            className: "w-full h-full"
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tile;
