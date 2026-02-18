import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const WORDS = [
  'COMPUTER', 'GAMING', 'JAVASCRIPT', 'REACT', 'PROGRAMMING',
  'ALGORITHM', 'DATABASE', 'NETWORK', 'SECURITY', 'INTERFACE',
  'FRAMEWORK', 'LIBRARY', 'FUNCTION', 'VARIABLE', 'COMPONENT'
];

const MAX_TRIES = 6;

export function HangmanGame() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const guessLetter = (letter: string) => {
    if (gameOver || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= MAX_TRIES) {
        setGameOver(true);
      }
    } else {
      // Check if won
      const allGuessed = word.split('').every(l => newGuessed.has(l));
      if (allGuessed) {
        setWon(true);
        setGameOver(true);
      }
    }
  };

  const getDisplayWord = () => {
    return word.split('').map(letter =>
      guessedLetters.has(letter) ? letter : '_'
    ).join(' ');
  };

  // Hangman drawing
  const drawHangman = () => {
    const parts = [
      // Head
      <circle key="head" cx="100" cy="60" r="20" stroke="#FF3A7A" strokeWidth="3" fill="none" />,
      // Body
      <line key="body" x1="100" y1="80" x2="100" y2="140" stroke="#FF3A7A" strokeWidth="3" />,
      // Left arm
      <line key="leftArm" x1="100" y1="100" x2="70" y2="120" stroke="#FF3A7A" strokeWidth="3" />,
      // Right arm
      <line key="rightArm" x1="100" y1="100" x2="130" y2="120" stroke="#FF3A7A" strokeWidth="3" />,
      // Left leg
      <line key="leftLeg" x1="100" y1="140" x2="70" y2="170" stroke="#FF3A7A" strokeWidth="3" />,
      // Right leg
      <line key="rightLeg" x1="100" y1="140" x2="130" y2="170" stroke="#FF3A7A" strokeWidth="3" />,
    ];

    return (
      <svg width="200" height="200" className="mx-auto">
        {/* Gallows */}
        <line x1="20" y1="180" x2="150" y2="180" stroke="white" strokeWidth="3" />
        <line x1="50" y1="180" x2="50" y2="20" stroke="white" strokeWidth="3" />
        <line x1="50" y1="20" x2="100" y2="20" stroke="white" strokeWidth="3" />
        <line x1="100" y1="20" x2="100" y2="40" stroke="white" strokeWidth="3" />
        {parts.slice(0, wrongGuesses)}
      </svg>
    );
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col items-center gap-4">
      {drawHangman()}

      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">猜单词</div>
        <div className="text-3xl md:text-4xl font-mono tracking-wider text-white">
          {getDisplayWord()}
        </div>
      </div>

      <div className="text-center">
        <div className="text-white/60 text-sm mb-1">剩余机会</div>
        <div className="text-2xl font-bold text-[#FF3A7A]">{MAX_TRIES - wrongGuesses}</div>
      </div>

      {gameOver && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {won ? '🎉 恭喜你赢了!' : '💥 游戏结束!'}
          </div>
          <div className="text-white/60">答案是: {word}</div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 md:gap-2 max-w-md">
        {alphabet.map(letter => (
          <Button
            key={letter}
            onClick={() => guessLetter(letter)}
            variant="outline"
            className={`
              w-8 h-8 md:w-10 md:h-10 p-0 text-sm font-bold
              ${guessedLetters.has(letter)
                ? word.includes(letter)
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-red-500/20 border-red-500 text-red-400'
                : 'border-white/20 text-white hover:bg-white/10'
              }
            `}
            disabled={guessedLetters.has(letter) || gameOver}
          >
            {letter}
          </Button>
        ))}
      </div>

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        猜出隐藏的单词，最多错6次
      </div>
    </div>
  );
}
