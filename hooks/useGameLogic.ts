import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, SHAPES, COLORS, INITIAL_HAND_SIZE } from '../constants';
import useLocalStorage from './useLocalStorage';

declare var html2canvas: any;

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState(GameState.PLAYING);
  const [gridSize, setGridSize] = useState(5);
  const [board, setBoard] = useState([]);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);
  const [selectedBoardTile, setSelectedBoardTile] = useState(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Welcome!');
  const [showHints, setShowHints] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [history, setHistory] = useState([]);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);

  const [highScores, setHighScores] = useLocalStorage('town-highScores', { 5: 0, 6: 0, 7: 0 });
  const [lastScores, setLastScores] = useLocalStorage('town-lastScores', { 5: 0, 6: 0, 7: 0 });

  useEffect(() => {
    if (navigator.share && typeof navigator.canShare === 'function') {
        const dummyFile = new File([""], "dummy.png", { type: "image/png" });
        if (navigator.canShare({ files: [dummyFile] })) {
            setCanShare(true);
        }
    }
  }, []);

  const generateDeck = useCallback((size) => {
    const deck = [];
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
  
  const handleStartGame = useCallback((size) => {
    setGridSize(size);
    
    const newDeck = shuffleDeck(generateDeck(size));
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    
    const firstTile = newDeck.pop();
    const center = Math.floor(size / 2);
    newBoard[center][center] = firstTile;

    setBoard(newBoard);
    setPlayerHand(newDeck.splice(0, INITIAL_HAND_SIZE));
    setDeck(newDeck);
    setMessage('Place a tile adjacent to an existing one.');
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

  const isValidPlacement = useCallback((tile, r, c, currentBoard) => {
    if (currentBoard.length === 0) return true;
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[r][i];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[i][c];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
    return true;
  }, [gridSize]);

  const getAdjacentEmptyCells = useCallback((currentBoard) => {
    if (currentBoard.length === 0) return [];
    const cells = [];
    const seen = new Set();

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

  const canMakeMove = useCallback((hand, currentBoard) => {
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
  
  const isRemovalValid = useCallback((currentBoard, r, c) => {
    const tempBoard = currentBoard.map(row => [...row]);
    tempBoard[r][c] = null;

    let remainingTilesCount = 0;
    let startTile = null;
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
        const { row: currR, col: currC } = queue.shift();
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
    
    return adjacentCells.filter(cell => isValidPlacement(selectedTile, cell.row, cell.col, board));

  }, [selectedTile, selectedBoardTile, board, adjacentCells, isValidPlacement, getAdjacentEmptyCells]);

  const handleTileSelect = (index) => {
    if (selectedBoardTile && playerHand.length >= INITIAL_HAND_SIZE) {
        const tileFromBoard = board[selectedBoardTile.row][selectedBoardTile.col];
        if (!tileFromBoard) return;

        setHistory(prev => [...prev, { board, playerHand, deck, score }]);
        
        const tileToDiscard = playerHand[index];
        const newPlayerHand = [...playerHand];
        newPlayerHand[index] = tileFromBoard;

        const newDeck = [...deck, tileToDiscard];

        const newBoard = board.map(row => [...row]);
        newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
        
        setBoard(newBoard);
        setPlayerHand(newPlayerHand);
        setDeck(shuffleDeck(newDeck));
        setScore(prev => prev - 1);
        
        setSelectedBoardTile(null);
        setSelectedTileIndex(null);
        setGameOverDismissed(false);
        setMessage('Tile swapped. Select a tile to place.');
        return;
    }

    setSelectedBoardTile(null);
    setSelectedTileIndex(index === selectedTileIndex ? null : index);
    if (index !== selectedTileIndex) {
        setMessage('Select a valid spot on the board.');
    }
  };

  const handleBoardTileClick = (r, c) => {
    if (score <= 1) return;

    if (selectedBoardTile && selectedBoardTile.row === r && selectedBoardTile.col === c) {
        setSelectedBoardTile(null);
        setMessage('Select a tile from your hand.');
        return;
    }
    
    if (isRemovalValid(board, r, c)) {
        setSelectedTileIndex(null);
        setSelectedBoardTile({row: r, col: c});
        if (playerHand.length >= INITIAL_HAND_SIZE) {
            setMessage('Move this tile, or click a hand tile to swap.');
        } else {
            setMessage('Move this tile, or return it to your hand.');
        }
    } else {
        setMessage('This tile cannot be moved without disconnecting others.');
    }
  };

  const handleCellClick = (r, c) => {
    if (!selectedTile || !validMoves.some(m => m.row === r && m.col === c)) {
        setMessage('Invalid move! No duplicate shape or color in a row or column.');
        return;
    };

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
        newPlayerHand.push(newDeck.pop());
      }
      
      setPlayerHand(newPlayerHand);
      setDeck(newDeck);
      setSelectedTileIndex(null);
      setMessage('Nice move! Place your next tile.');
    }
  };
  
  const handleMoveToHand = () => {
    if (!selectedBoardTile || playerHand.length >= INITIAL_HAND_SIZE) return;
    const tileToRemove = board[selectedBoardTile.row][selectedBoardTile.col];
    if (!tileToRemove) return;

    setHistory(prev => [...prev, { board, playerHand, deck, score }]);
    
    const newBoard = board.map(row => [...row]);
    newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
    setBoard(newBoard);
    
    setPlayerHand(prev => [...prev, tileToRemove]);
    setMessage('Tile returned to your hand.');
    setScore(prev => prev - 1);
    setGameOverDismissed(false);
    setSelectedBoardTile(null);
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
  
  const handleShare = async (boardRef) => {
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
        ctx.fillText(`i did  ${currentScore}, can you beat me?`, finalCanvas.width / 2, 190);

        ctx.drawImage(boardCanvas, canvasPadding / 2, headerHeight);

        finalCanvas.toBlob(async (blob) => {
            if (!blob) {
                setMessage('Error creating image.');
                return;
            }
            const file = new File([blob], `town${gridSize}x${gridSize}-score.png`, { type: 'image/png' });
            
            const shareData = {
                title: `Town ${gridSize}x${gridSize} Score`,
                text: `https://shuflovic.github.io/town_66`,
                url: `https://shuflovic.github.io/town_66`,
                files: [file],
            };

            await navigator.share(shareData);
            setMessage('Shared successfully!');
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

  const handleSizeChange = (newSize) => {
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
    handleMoveToHand,
    handleUndo,
    handleShuffle,
    handleShare,
    handlePlayAgain,
    handleCloseGameOverModal,
    handleSizeChange,
    setShowHints,
  };
};
