import React, { useState, useEffect, useRef } from 'react';
import { GameState } from './types';
import HowToPlayModal from './components/HowToPlayModal';
import useLocalStorage from './hooks/useLocalStorage';
import { useGameLogic } from './hooks/useGameLogic';
import Board from "./components/Board";
import { PlayerHand } from "./components/PlayerHand";
import { GameOverModal } from "./components/GameOverModal";

const App: React.FC = () => {
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage('town-seen-tutorial', false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  
  const boardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsHowToPlayOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  const {
    gameState,
    gridSize,
    board,
    deck,
    playerHand,
    selectedTileIndex,
    selectedBoardTile,
    score,
    message,
    showHints,
    canShare,
    history,
    highScores,
    lastScores,
    selectedTile,
    adjacentCells,
    validMoves,
    handleStartGame,
    handleTileSelect,
    handleBoardTileClick,
    handleCellClick,
    handleMoveToHand,
    handleUndo,
    handleShuffle,
    handleShare,
    handlePlayAgain,
    handleCloseGameOverModal,
    handleSizeChange,
    setShowHints,
  } = useGameLogic();

  const handleCloseHowToPlayModal = () => {
    setIsHowToPlayOpen(false);
    setHasSeenTutorial(true);
  };

  return (
    <div className="min-h-screen bg-[url('https://www.textures.com/system/gallery/photos/Wood/Wood%20Planks/139481/WoodPlanksClean0086_1_S.jpg')] bg-cover bg-center flex flex-col items-center justify-between p-4 space-y-4">
      <HowToPlayModal 
        isOpen={isHowToPlayOpen}
        onClose={handleCloseHowToPlayModal}
      />
      <GameOverModal 
        score={lastScores[gridSize] ?? 0} 
        highScore={highScores[gridSize] ?? 0} 
        onPlayAgain={handlePlayAgain} 
        isOpen={gameState === GameState.GAME_OVER} 
        onShare={() => handleShare(boardRef)} 
        canShare={canShare}
        onClose={handleCloseGameOverModal}
      />
      
      <header className="w-full flex justify-between items-center p-4 bg-[url('https://www.textures.com/system/gallery/photos/Paper/Parchment/134818/Parchment0008_1_S.jpg')] bg-cover bg-center rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.3)] border-2 border-amber-800">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-amber-900 font-serif">JD 66</h1>
          <div className="flex items-center space-x-4 border-l-2 border-r-2 border-amber-700 px-6">
            <div className="text-center">
              <div className="text-sm text-amber-800 font-serif">High Score</div>
              <div className="text-2xl font-bold text-amber-900 font-serif">{highScores[gridSize] ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-amber-800 font-serif">Score</div>
              <div className="text-2xl font-bold text-amber-900 font-serif">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-amber-800 font-serif">Deck</div>
              <div className="text-2xl font-bold text-amber-900 font-serif">{deck.length}</div>
            </div>
          </div>
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || gameState !== GameState.PLAYING}
            aria-label="Undo last move"
            className="text-amber-700 hover:text-amber-500 disabled:text-amber-400 transition-colors disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>
      
      <div className="w-full flex justify-between items-center gap-4">
        {hasSeenTutorial ? (
          <button
            onClick={() => setIsHowToPlayOpen(true)}
            aria-label="How to play"
            className="flex items-center gap-2 py-2 px-4 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-colors text-amber-900 bg-[url('https://www.textures.com/system/gallery/photos/Paper/Parchment/134818/Parchment0008_1_S.jpg')] bg-cover bg-center hover:bg-amber-100 border-2 border-amber-800 font-serif"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold font-serif">How to Play</span>
          </button>
        ) : (
          <div /> 
        )}
        <button
          onClick={() => handleStartGame(gridSize)}
          aria-label="Start a new game"
          className="flex items-center gap-2 py-2 px-4 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-colors text-amber-900 bg-[url('https://www.textures.com/system/gallery/photos/Paper/Parchment/134818/Parchment0008_1_S.jpg')] bg-cover bg-center hover:bg-amber-100 border-2 border-amber-800 font-serif"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold font-serif">New Game</span>
        </button>
      </div>

      <main ref={boardRef} className="flex-grow flex items-center justify-center">
        {board.length > 0 && (
          <Board 
            board={board} 
            onCellClick={handleCellClick} 
            onBoardTileClick={handleBoardTileClick} 
            validMoves={validMoves} 
            selectedTile={selectedTile} 
            selectedBoardTile={selectedBoardTile} 
            adjacentCells={adjacentCells} 
            showHints={showHints} 
            gridSize={gridSize} 
          />
        )}
      </main>

      <footer className="w-full flex flex-col items-center space-y-2">
        <div className="h-10 text-center font-semibold text-lg text-amber-900 font-serif transition-opacity flex items-center justify-center">
          {message}
        </div>
        <PlayerHand 
          hand={playerHand} 
          onTileClick={handleTileSelect} 
          selectedTileIndex={selectedTileIndex}
          gridSize={gridSize}
          isBoardTileSelected={!!selectedBoardTile}
          onMoveToHand={handleMoveToHand}
        />
        <div className="w-full max-w-lg flex justify-around items-center p-2 bg-[url('https://www.textures.com/system/gallery/photos/Paper/Parchment/134818/Parchment0008_1_S.jpg')] bg-cover bg-center rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.3)] border-2 border-amber-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-800 font-serif hidden sm:inline">Board Size:</span>
            <div className="flex items-center bg-amber-200 rounded-lg p-1">
              {[5, 6, 7].map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  aria-pressed={gridSize === size}
                  className={`px-3 py-1 text-sm font-bold font-serif rounded-md transition-colors ${
                    gridSize === size
                      ? 'bg-amber-700 text-amber-100 shadow-md'
                      : 'text-amber-900 hover:bg-amber-300'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleShuffle}
            disabled={deck.length < playerHand.length || gameState !== GameState.PLAYING}
            aria-label="Shuffle hand"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors text-amber-900 hover:bg-amber-100 disabled:text-amber-400 disabled:cursor-not-allowed font-serif"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm font-medium font-serif hidden sm:inline">Shuffle</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-amber-800 font-serif" id="show-hints-label">Show Hints</span>
            <button
              onClick={() => setShowHints(!showHints)}
              type="button"
              role="switch"
              aria-checked={showHints}
              aria-labelledby="show-hints-label"
              className={`${
                showHints ? 'bg-amber-700' : 'bg-amber-400'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  showHints ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-amber-100 transition-transform`}
              />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
