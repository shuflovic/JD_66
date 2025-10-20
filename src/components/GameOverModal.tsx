// GameOverModal.tsx
import React from 'react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  onPlayAgain: () => void;
  onShare: () => void;
  canShare: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ 
  score, 
  highScore, 
  onPlayAgain, 
  onShare, 
  canShare, 
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isNewPersonalHighScore = score > 0 && score === highScore;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-8 text-center max-w-sm w-full animate-fade-in-up">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-4xl font-extrabold mb-4 text-cyan-500 dark:text-cyan-400">Game Over!</h2>
        
        {isNewPersonalHighScore && (
            <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-4 animate-pulse">
                New High Score!
            </p>
        )}

        <p className="text-lg mb-2 text-gray-600 dark:text-gray-300">You placed</p>
        <p className="text-7xl font-bold mb-6 text-gray-800 dark:text-white">{score}</p>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">tiles on the board.</p>
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <div className="flex justify-center text-lg text-gray-500 dark:text-gray-400">
            <div>Your Best: <span className="font-bold text-gray-700 dark:text-gray-200">{highScore}</span></div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onPlayAgain}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
            >
              Play Again
            </button>
            {canShare && (
                <button
                    onClick={onShare}
                    aria-label="Share your score"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

// HowToPlayModal.tsx
interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContentType {
  title: string;
  rules: (string | JSX.Element)[];
  buttonText: string;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = React.useState<'en' | 'sk'>('en');
  
  if (!isOpen) return null;
  
  const content: Record<'en' | 'sk', ContentType> = {
    en: {
      title: 'How to Play',
      rules: [
        'The goal is to place as many tiles as possible.',
        'Click a tile in your hand, then click an empty spot on the board to place it.',
        <span key="rule3">You can only place tiles <span className="font-semibold">next to</span> another tile.</span>,
        <span key="rule4"><span className="font-semibold text-red-500">THE MAIN RULE:</span> No two tiles can share a <span className="font-semibold">color</span> or a <span className="font-semibold">shape</span> in the same row or column.</span>,
        <span key="rule5">At the bottom, you can <span className="font-semibold">change board size</span>, <span className="font-semibold">shuffle</span> your hand, or toggle <span className="font-semibold">hints</span>.</span>
      ],
      buttonText: 'Start Playing!'
    },
    sk: {
      title: 'Ako hrať',
      rules: [
        'Cieľom hry je umiestniť na plochu čo najviac kociek.',
        'Klikni na kocku v ruke a potom na prázdne miesto na hracej ploche, kam ju chces položiť.',
        <span key="rule3">Kocku môžes položiť iba <span className="font-semibold">vedľa</span> inej kocky. Vedľa, nie diagonálne!</span>,
        <span key="rule4"><span className="font-semibold text-red-500">HLAVNÉ PRAVIDLO:</span> V jednom riadku alebo stĺpci sa nemôžu nachádzať dve kocky rovnakej <span className="font-semibold">farby</span> alebo <span className="font-semibold">tvaru. Podobne ako Sudoku.</span>.</span>,
        <span key="rule5">V spodnej časti obrazovky môžete <span className="font-semibold">zmeniť veľkosť</span>, <span className="font-semibold">zamiešať</span> karty alebo zapnúť <span className="font-semibold">nápovedy</span>.</span>
      ],
      buttonText: 'Začať hrať!'
    }
  };

  const currentContent = content[language];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-8 max-w-lg w-full m-4 animate-fade-in-up">
        <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                  language === 'en'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('sk')}
              aria-pressed={language === 'sk'}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                  language === 'sk'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              SK
            </button>
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-extrabold mb-6 pt-8 text-center text-cyan-500 dark:text-cyan-400">{currentContent.title}</h2>
        
        <ol className="space-y-4 text-lg text-gray-700 dark:text-gray-300 list-decimal list-inside">
          {currentContent.rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ol>

        <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
            >
              {currentContent.buttonText}
            </button>
        </div>
      </div>
    </div>
  );
};
