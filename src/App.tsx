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
    // CHANGE 1: Main container uses a dark stone/wood background color
    <div className="min-h-screen flex flex-col items-center justify-between p-4 space-y-4 bg-amber-800/90 border-8 border-amber-900 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]"> 
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
      
      {/* CHANGE 2: Updated Header classes for a dark, framed look with subtle transparency */}
      <header className="w-full flex flex-col sm:flex-row border-amber-900 border-3 rounded-xl justify-between items-center text-amber-300 p-3 shadow-[0_6px_12px_rgba(0,0,0,0.4)] bg-amber-700/80">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <h1 className="text-4xl font-extrabold text-stone-100 font-serif p-2 tracking-widest text-shadow-lg">JD 66</h1>
          <div className="flex items-center space-x-4 border-l-2 border-r-2 border-stone-900 px-6">
            <div className="text-center">
              <div className="text-sm text-amber-300 font-serif uppercase tracking-widest">High Score</div>
              <div className="text-2xl font-bold text-stone-100 font-serif">{highScores[gridSize] ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-amber-300 font-serif uppercase tracking-widest">Score</div>
              <div className="text-2xl font-bold text-stone-100 font-serif">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-amber-300 font-serif uppercase tracking-widest">Deck</div>
              <div className="text-2xl font-bold text-stone-100 font-serif">{deck.length}</div>
            </div>
          </div>
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || gameState !== GameState.PLAYING}
            aria-label="Undo last move"
            className="text-amber-300 hover:text-amber-100 p-2 disabled:text-stone-500 transition-colors disabled:cursor-not-allowed bg-stone-900/50 rounded-full mt-2 sm:mt-0"
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
            // CHANGE 4: Button Style update for a chunky, wooden/game piece look
            className="flex items-center gap-2 py-2 px-4 rounded-xl shadow-lg transition-all text-stone-100 bg-amber-700 hover:bg-amber-600 border-b-4 border-amber-900 font-serif font-bold active:border-b-2 active:translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>How to Play</span>
          </button>
        ) : (
          <div /> 
        )}
        <button
          onClick={() => handleStartGame(gridSize)}
          aria-label="Start a new game"
          // CHANGE 5: New Game Button Style update
          className="flex items-center gap-2 py-2 px-4 rounded-xl shadow-lg transition-all text-stone-100 bg-amber-700 hover:bg-amber-600 border-b-4 border-amber-900 font-serif font-bold active:border-b-2 active:translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>New Game</span>
        </button>
      </div>

      <main ref={boardRef} className="flex-grow flex items-center justify-center">
        {board.length > 0 && (
          // CHANGE 6: Board outer container - dark, thick frame around the lighter board
          <div className="shadow-2xl p-2 bg-stone-900 border-4 border-stone-950 rounded-xl">
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
          </div>
        )}
      </main>

      <footer className="w-full flex flex-col items-center space-y-2 p-2 bg-amber-900/80 border-3 border-amber-950 rounded-xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)]">
        {/* CHANGE 7: Message color update */}
        <div className="min-h-10 text-center font-semibold text-lg text-amber-300 font-serif transition-opacity flex items-center justify-center">
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
        {/* CHANGE 8: Footer controls container styling (dark frame) */}
        <div className="w-full max-w-lg flex justify-around items-center p-4 rounded-xl shadow-xl bg-stone-700/70 backdrop-blur-sm border-2 border-stone-900">
          <div className="flex items-center gap-2">
            {/* CHANGE 9: Text color update */}
            <span className="text-sm font-medium text-amber-300 font-serif hidden sm:inline uppercase tracking-widest">Board Size:</span>
            {/* CHANGE 10: Board Size button group styling */}
            <div className="flex items-center bg-stone-900/50 rounded-xl p-1 border border-stone-700">
              {[5, 6, 7].map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  aria-pressed={gridSize === size}
                  className={`px-3 py-1 text-sm font-bold font-serif rounded-lg transition-colors ${
                    gridSize === size
                      ? 'bg-amber-600 text-stone-50 shadow-md ring-2 ring-amber-400'
                      : 'text-amber-300 hover:text-stone-100 hover:bg-stone-800/50'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>
          {/* CHANGE 11: Shuffle button styling */}
          <button
            onClick={handleShuffle}
            disabled={deck.length < playerHand.length || gameState !== GameState.PLAYING}
            aria-label="Shuffle hand"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors text-amber-300 hover:text-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed font-serif"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm font-medium font-serif hidden sm:inline">Shuffle</span>
          </button>
          <div className="flex items-center space-x-2">
            {/* CHANGE 12: Hints toggle styling */}
            <span className="text-sm font-medium text-amber-300 font-serif uppercase tracking-widest" id="show-hints-label">Hints</span>
            <button
              onClick={() => setShowHints(!showHints)}
              type="button"
              role="switch"
              aria-checked={showHints}
              aria-labelledby="show-hints-label"
              className={`${
                showHints ? 'bg-green-600' : 'bg-stone-600'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 border-2 border-stone-800`}
            >
              <span
                className={`${
                  showHints ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-stone-100 transition-transform`}
              />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
