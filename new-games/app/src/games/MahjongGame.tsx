import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const SYMBOLS = ['🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', '🀐', '🀑'];
const PAIRS_COUNT = 18;

export function MahjongGame() {
  const [tiles, setTiles] = useState<{ id: number; symbol: string; matched: boolean }[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const newTiles: { id: number; symbol: string; matched: boolean }[] = [];
    
    for (let i = 0; i < PAIRS_COUNT; i++) {
      const symbol = SYMBOLS[i % SYMBOLS.length];
      newTiles.push(
        { id: i * 2, symbol, matched: false },
        { id: i * 2 + 1, symbol, matched: false }
      );
    }

    // Shuffle
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }

    setTiles(newTiles);
    setSelectedTiles([]);
    setMatchedPairs(0);
    setTimeLeft(120);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (gameOver || won) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, won]);

  const handleTileClick = (id: number) => {
    if (gameOver || won) return;
    if (selectedTiles.length === 2) return;
    if (selectedTiles.includes(id)) return;
    if (tiles.find(t => t.id === id)?.matched) return;

    const newSelected = [...selectedTiles, id];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      const tile1 = tiles.find(t => t.id === newSelected[0]);
      const tile2 = tiles.find(t => t.id === newSelected[1]);

      if (tile1?.symbol === tile2?.symbol) {
        setTimeout(() => {
          setTiles(prev => prev.map(t =>
            newSelected.includes(t.id) ? { ...t, matched: true } : t
          ));
          setMatchedPairs(p => {
            const newPairs = p + 1;
            if (newPairs === PAIRS_COUNT) {
              setWon(true);
            }
            return newPairs;
          });
          setSelectedTiles([]);
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedTiles([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">配对</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{matchedPairs} / {PAIRS_COUNT}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">时间</div>
          <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-[#FF3A7A]' : 'text-[#FACC15]'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            className={`
              w-12 h-16 md:w-14 md:h-20 rounded-lg text-2xl md:text-3xl
              transition-all duration-300 transform
              ${tile.matched
                ? 'opacity-0 pointer-events-none'
                : selectedTiles.includes(tile.id)
                  ? 'bg-[#FF3A7A] scale-110 rotate-y-180'
                  : 'bg-gradient-to-b from-[#F0D9B5] to-[#D2B48C] hover:scale-105'
              }
            `}
            disabled={tile.matched}
          >
            <span className={selectedTiles.includes(tile.id) || tile.matched ? '' : 'opacity-0'}>
              {tile.symbol}
            </span>
          </button>
        ))}
      </div>

      {gameOver && !won && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white">时间到!</div>
          <div className="text-white/60">配对: {matchedPairs} / {PAIRS_COUNT}</div>
        </div>
      )}

      {won && (
        <div className="text-center">
          <div className="text-2xl font-bold text-[#FACC15]">🎉 恭喜完成!</div>
          <div className="text-white/60">剩余时间: {formatTime(timeLeft)}</div>
        </div>
      )}

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击翻转麻将牌，找到相同配对
      </div>
    </div>
  );
}
