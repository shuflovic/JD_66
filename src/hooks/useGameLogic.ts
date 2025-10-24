```tsx
import { useState, useEffect, useCallback, useMemo, RefObject } from 'react';
import { GameState, Tile, Board as BoardType, Move } from '../types';
import { SHAPES, COLORS, INITIAL_HAND_SIZE } from '../constants';
import useLocalStorage from './useLocalStorage';
import html2canvas from 'html2canvas';

const shuffleDeck = (deck: Tile[]): Tile[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

type HighScores = Record<number, number>;

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [gridSize, setGridSize] = useState<number>(5);
  const [board, setBoard] = useState<BoardType>([]);
  const [deck, setDeck] = useState<Tile[]>([]);
  const [playerHand, setPlayerHand] = useState<Tile[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [selectedBoardTile, setSelectedBoardTile] = useState<Move | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('Welcome!');
  const [showHints, setShowHints] = useState<boolean>(true);
  const [canShare, setCanShare] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [gameOverDismissed, setGameOverDismissed] = useState<boolean>(false);

  const [highScores, setHighScores] = useLocalStorage<HighScores>('town-highScores', { 5: 0, 6: 0, 7: 0 });
  const [lastScores, setLastScores] = useLocalStorage<HighScores>('town-lastScores', { 5: 0, 6: 0, 7: 0 });

  useEffect(() => {
    if (navigator.share && typeof navigator.canShare === 'function') {
        try {
            const dummyFile = new File([""], "dummy.png", { type: "image/png" });
            if (navigator.canShare({ files: [dummyFile] })) {
                setCanShare(true);
            }
        } catch (error) {
            console.warn("Could not check navigator.canShare with files", error);
            setCanShare(!!navigator.share); // Fallback for browsers that support share but not canShare with files
        }
    }
  }, []);

  const generateDeck = useCallback((size: number): Tile[] => {
    const deck: Tile[] = [];
    let id = 0;
    const currentColors = COLORS.slice(0, size);
    const currentShapes = SHAPES.slice(0, size);
    for (const color of currentColors) {
      for (const shape of currentShapes) {
        deck.push({ id: id++, color, shape });
      }
    }
    return deck;
  }, []);
  
  const handleStartGame = useCallback((size: number) => {
    setGridSize(size);
    
    const newDeck = shuffleDeck(generateDeck(size));
    const newBoard: BoardType = Array(size).fill(null).map(() => Array(size).fill(null));
    
    const firstTile = newDeck.pop();
    if (firstTile) {
        const center = Math.floor(size / 2);
        newBoard[center][center] = firstTile;
    }

    setBoard(newBoard);
    setPlayerHand(newDeck.splice(0, INITIAL_HAND_SIZE));
    setDeck(newDeck);
    setMessage('Choose a tile and place it next to an existing one.');
    setScore(1);
    setSelectedTileIndex(null);
    setSelectedBoardTile(null);
    setGameState(GameState.PLAYING);
    setHistory([]);
    setGameOverDismissed(false);
  }, [generateDeck]);
  
  useEffect(() => {
    handleStartGame(5);
  }, [handleStartGame]);

  const isValidPlacement = useCallback((tile: Tile, r: number, c: number, currentBoard: BoardType): boolean => {
    if (currentBoard.length === 0) return true;
    // Check row
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[r][i];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
    // Check column
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[i][c];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
    return true;
  }, [gridSize]);

  const getAdjacentEmptyCells = useCallback((currentBoard: BoardType): Move[] => {
    if (currentBoard.length === 0) return [];
    const cells: Move[] = [];
    const seen = new Set<string>();

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (currentBoard[r][c]) {
          const neighbors = [
            { row: r - 1, col: c }, { row: r + 1, col: c },
            { row: r, col: c - 1 }, { row: r, col: c + 1 }
          ];
          for (const n of neighbors) {
            const key = `${n.row},${n.col}`;
            if (n.row >= 0 && n.row < gridSize && n.col >= 0 && n.col < gridSize && !currentBoard[n.row][n.col] && !seen.has(key)) {
              cells.push(n);
              seen.add(key);
            }
          }
        }
      }
    }
    return cells;
  }, [gridSize]);

  const canMakeMove = useCallback((hand: Tile[], currentBoard: BoardType): boolean => {
    if (currentBoard.length === 0) return true;
    const validSpots = getAdjacentEmptyCells(currentBoard);
    for (const tile of hand) {
      for (const spot of validSpots) {
        if (isValidPlacement(tile, spot.row, spot.col, currentBoard)) {
          return true;
        }
      }
    }
    return false;
  }, [getAdjacentEmptyCells, isValidPlacement]);

  const selectedTile = useMemo(() => {
    if (selectedTileIndex !== null) {
        return playerHand[selectedTileIndex];
    }
    if (selectedBoardTile !== null && board[selectedBoardTile.row]) {
        return board[selectedBoardTile.row][selectedBoardTile.col];
    }
    return null;
  }, [selectedTileIndex, playerHand, selectedBoardTile, board]);
  
  const adjacentCells = useMemo(() => getAdjacentEmptyCells(board), [board, getAdjacentEmptyCells]);
  
  const isRemovalValid = useCallback((currentBoard: BoardType, r: number, c: number): boolean => {
    const tempBoard = currentBoard.map(row => [...row]);
    tempBoard[r][c] = null;

    let remainingTilesCount = 0;
    let startTile: Move | null = null;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (tempBoard[i][j]) {
                remainingTilesCount++;
                if (!startTile) startTile = { row: i, col: j };
            }
        }
    }

    if (remainingTilesCount <= 1) return true;
    if (!startTile) return true;

    const queue = [startTile];
    const visited = new Set([`${startTile.row},${startTile.col}`]);
    let count = 0;

    while (queue.length > 0) {
        const { row: currR, col: currC } = queue.shift()!;
        count++;
        const neighbors = [{r:currR-1,c:currC},{r:currR+1,c:currC},{r:currR,c:currC-1},{r:currR,c:currC+1}];
        for (const n of neighbors) {
            const key = `${n.r},${n.c}`;
            if (n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize && tempBoard[n.r][n.c] && !visited.has(key)) {
                visited.add(key);
                queue.push({row: n.r, col: n.c});
            }
        }
    }
    return count === remainingTilesCount;
  }, [gridSize]);
  
  const validMoves = useMemo(() => {
    if (!selectedTile) return [];

    if (selectedBoardTile) {
        const tileToMove = selectedTile;
        const tempBoard = board.map(row => [...row]);
        tempBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
        
        const possibleSpots = getAdjacentEmptyCells(tempBoard);
        return possibleSpots.filter(cell => isValidPlacement(tileToMove, cell.row, cell.col, tempBoard));
    }
    
    return adjacentCells.filter(cell => isValidPlacement(selectedTile, cell.row, col, board));

  }, [selectedTile, selectedBoardTile, board, adjacentCells, isValidPlacement, getAdjacentEmptyCells]);

  const handleTileSelect = (index: number) => {
    if (selectedBoardTile) {
      const tileFromBoard = board[selectedBoardTile.row][selectedBoardTile.col];
      if (!tileFromBoard) return;

      setHistory(prev => [...prev, { board, playerHand, deck, score }]);

      const newBoard = board.map(row => [...row]);
      newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;

      if (playerHand.length >= INITIAL_HAND_SIZE) {
        // Swap the board tile with the selected hand tile
        const tileToDiscard = playerHand[index];
        const newPlayerHand = [...playerHand];
        newPlayerHand[index] = tileFromBoard;

        const newDeck = [...deck, tileToDiscard];
        
        setBoard(newBoard);
        setPlayerHand(newPlayerHand);
        setDeck(shuffleDeck(newDeck));
        setScore(prev => prev - 1);
        setMessage('Tile swapped. Select a tile to place.');
      } else {
        // Move the board tile to the hand
        const newPlayerHand = [...playerHand, tileFromBoard];
        
        setBoard(newBoard);
        setPlayerHand(newPlayerHand);
        setScore(prev => prev - 1);
        setMessage('Tile moved to hand. Select a tile to place.');
      }

      setSelectedBoardTile(null);
      setSelectedTileIndex(null);
      setGameOverDismissed(false);
      return;
    }

    setSelectedBoardTile(null);
    setSelectedTileIndex(index === selectedTileIndex ? null : index);
    if (index !== selectedTileIndex) {
      setMessage('Select a valid spot on the board.');
    }
  };

  const handleBoardTileClick = (r: number, c: number) => {
    if (score <= 1) return;

    if (selectedBoardTile && selectedBoardTile.row === r && selectedBoardTile.col === c) {
      setSelectedBoardTile(null);
      setMessage('Choose a tile.');
      return;
    }
    
    if (isRemovalValid(board, r, c)) {
      setSelectedTileIndex(null);
      setSelectedBoardTile({row: r, col: c});
      setMessage('Click a hand tile to swap or move to hand, or select a board spot to move.');
    } else {
      setMessage('This tile cannot be moved without disconnecting others.');
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (!selectedTile || !validMoves.some(m => m.row === r && m.col === c)) {
      setMessage('Invalid move! No duplicate shape or color in a row or column.');
      return;
    }

    setHistory(prev => [...prev, { board, playerHand, deck, score }]);
    const newBoard = board.map(row => [...row]);

    if (selectedBoardTile) {
      newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
      newBoard[r][c] = selectedTile;
      setBoard(newBoard);
      setSelectedBoardTile(null);
      setMessage('Tile moved!');
      return;
    }

    if (selectedTileIndex !== null) {
      newBoard[r][c] = selectedTile;
      setBoard(newBoard);
      setScore(prev => prev + 1);

      const newPlayerHand = playerHand.filter((_, i) => i !== selectedTileIndex);
      const newDeck = [...deck];
      if (newPlayerHand.length < INITIAL_HAND_SIZE && newDeck.length > 0) {
        const nextTile = newDeck.pop()
        if (nextTile) newPlayerHand.push(nextTile);
      }
      
      setPlayerHand(newPlayerHand);
      setDeck(newDeck);
      setSelectedTileIndex(null);
      setMessage('Nice move! Choose your next tile.');
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || gameState !== GameState.PLAYING) return;
    const lastState = history.pop();
    setBoard(lastState.board);
    setPlayerHand(lastState.playerHand);
    setDeck(lastState.deck);
    setScore(lastState.score);
    setHistory(history);
    setGameOverDismissed(false);
    setSelectedTileIndex(null);
    setSelectedBoardTile(null);
    setMessage('Last move undone.');
  };

  const handleShuffle = () => {
    if (deck.length < playerHand.length || gameState !== GameState.PLAYING) return;
    setHistory(prev => [...prev, { board, playerHand, deck, score }]);
    const combined = shuffleDeck([...deck, ...playerHand]);
    const newHand = combined.splice(0, playerHand.length);
    setPlayerHand(newHand);
    setDeck(combined);
    setSelectedTileIndex(null);
    setSelectedBoardTile(null);
    setMessage('Hand shuffled.');
  };
  
  const handleShare = async (boardRef: RefObject<HTMLElement>) => {
    if (!boardRef.current) return;
    setMessage('Generating share image...');
    try {
        const boardCanvas = await html2canvas(boardRef.current, { 
            logging: false,
            useCORS: true,
            backgroundColor: null,
            scale: 2,
        });

        const headerHeight = 240;
        const finalCanvas = document.createElement('canvas');
        const canvasPadding = 80;
        finalCanvas.width = boardCanvas.width + canvasPadding;
        finalCanvas.height = boardCanvas.height + headerHeight;
        const ctx = finalCanvas.getContext('2d');

        if (!ctx) {
            setMessage('Could not create image context.');
            return;
        }
        
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        const currentScore = lastScores[gridSize];
        
        ctx.textAlign = 'center';
        ctx.font = 'bold 96px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`Town ${gridSize}x${gridSize}`, finalCanvas.width / 2, 100);
        
        ctx.font = '66px sans-serif';
        ctx.fillText(`I scored ${currentScore}, can you beat me?`, finalCanvas.width / 2, 190);

        ctx.drawImage(boardCanvas, canvasPadding / 2, headerHeight);

        finalCanvas.toBlob(async (blob) => {
            if (!blob) {
                setMessage('Error creating image.');
                return;
            }
            const file = new File([blob], `town${gridSize}x${gridSize}-score.png`, { type: 'image/png' });
            
            const shareData = {
                title: `Town ${gridSize}x${gridSize} Score`,
                text: `I scored ${currentScore} in Town ${gridSize}x${gridSize}! Can you beat me?`,
                files: [file],
            };
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                setMessage('Shared successfully!');
            } else {
                 await navigator.share({
                    title: shareData.title,
                    text: shareData.text,
                 });
                 setMessage('Shared successfully!');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error sharing:', error);
        setMessage('Could not share. Maybe your browser does not support it.');
    }
  };

  useEffect(() => {
    if (gameState !== GameState.PLAYING || gameOverDismissed) return;
    if (board.length === 0) return;

    if (!canMakeMove(playerHand, board)) {
      setMessage(playerHand.length === 0 ? "Congratulations! You've placed all your tiles!" : 'No valid moves left. Game over!');
      setLastScores(prev => ({...prev, [gridSize]: score}));
      if (score > (highScores[gridSize] ?? 0)) {
        setHighScores(prev => ({...prev, [gridSize]: score}));
      }
      setTimeout(() => setGameState(GameState.GAME_OVER), 1500);
    }
  }, [playerHand, board, gameState, canMakeMove, score, gridSize, highScores, setHighScores, setLastScores, gameOverDismissed]);
  
  const handlePlayAgain = () => handleStartGame(gridSize);

  const handleCloseGameOverModal = () => {
    setGameState(GameState.PLAYING);
    setGameOverDismissed(true);
    setMessage('Game over. Undo your last move to continue playing.');
  };

  const handleSizeChange = (newSize: number) => {
    if (newSize === gridSize) return;
    if (score > 1 && !window.confirm('This will start a new game. Are you sure?')) return;
    handleStartGame(newSize);
  };
  
  return {
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
  };
};
```
