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
    <div className="min-h-screen flex flex-col items-center justify-between p-4 space-y-4 bg-gray-900"> 
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
      <header className="w-full flex justify-between items-center p-4 bg-gray-800 rounded-xl shadow-md">
        
        <div className="flex items-center pr-6 pl-6">
          <div className="text-3xl font-bold text-white pr-6" >JD66</div>

          <div className="w-full flex justify-between items-center border-l border-r border-gray-600 pr-6 pl-6">
              
              <div className="text-center pr-2">
                  <div className="text-sm text-gray-400">Highest Score</div>
                  <div className="text-2xl font-bold text-gray-200">{highScores[gridSize] ?? 0}</div>
              </div>
            
              <div className="text-center pr-2">
                  <div className="text-sm text-gray-400">Score</div>
                  <div className="text-2xl font-bold text-gray-200">{score}</div>
              </div>
            
              <div className="text-center pr-2">
                  <div className="text-sm  text-gray-400">Deck</div>
                  <div className="text-2xl font-bold text-gray-200">{deck.length}</div>
              </div>
            
          </div>
          
          <button
              onClick={handleUndo}
              disabled={history.length === 0 || gameState !== GameState.PLAYING}
              aria-label="Undo last move"
              className="text-gray-400 hover:text-cyan-400 disabled:text-gray-600 transition-colors disabled:cursor-not-allowed pl-6"
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
                className="flex items-center gap-2 py-2 px-4 rounded-lg shadow-md transition-colors text-white bg-blue-500 hover:bg-blue-600 border border-blue-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">How to Play</span>
            </button>
        ) : (
            <div /> 
        )}
        <button
            onClick={() => handleStartGame(gridSize)}
            aria-label="Start a new game"
            className="flex items-center gap-2 py-2 px-4 rounded-lg shadow-md transition-colors text-white bg-purple-500 hover:bg-purple-500 border border-cyan-700"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">New Game</span>
        </button>
      </div>

      <main ref={boardRef} className="flex-grow flex items-center justify-center">
        {board.length > 0 && (
          
          <div className="p-6 bg-gray-800 rounded-xl">
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

      <footer className="w-full flex flex-col items-center space-y-2">
        {/* CHANGE 7: Message color update */}
        <div className="h-10 text-center font-semibold text-lg text-cyan-400 transition-opacity flex items-center justify-center">
          {message}
        </div>
        <PlayerHand 
          hand={playerHand} 
          onTileClick={handleTileSelect} 
          selectedTileIndex={selectedTileIndex}
          gridSize={gridSize}
        />
        {/* CHANGE 8: Footer controls container styling (dark frame) */}
        <div className="w-full max-w-lg flex justify-around items-center p-2 bg-gray-800 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Board Size:</span>
                <div className="flex items-center bg-gray-700 rounded-lg p-1">
                    {[5, 6, 7].map(size => (
                        <button
                            key={size}
                            onClick={() => handleSizeChange(size)}
                            aria-pressed={gridSize === size}
                            className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                                gridSize === size
                                ? 'bg-cyan-500 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
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
                className="flex items-center gap-2 p-2 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Shuffle</span>
            </button>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300" id="show-hints-label">Show Hints</span>
                <button
                    onClick={() => setShowHints(!showHints)}
                    type="button"
                    role="switch"
                    aria-checked={showHints}
                    aria-labelledby="show-hints-label"
                    className={`${
                        showHints ? 'bg-cyan-500' : 'bg-gray-400'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                >
                    <span
                        className={`${
                            showHints ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default App;

