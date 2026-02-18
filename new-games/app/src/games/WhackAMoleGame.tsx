import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const GAME_DURATION = 30;

export function WhackAMoleGame() {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const moleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(() => {
    setMoles(Array(9).fill(false));
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setMoles(Array(9).fill(false));
    if (moleTimeoutRef.current) {
      clearTimeout(moleTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isPaused, endGame]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const spawnMole = () => {
      setMoles(() => {
        const newMoles = Array(9).fill(false);
        const randomIndex = Math.floor(Math.random() * 9);
        newMoles[randomIndex] = true;
        return newMoles;
      });

      moleTimeoutRef.current = setTimeout(() => {
        setMoles(Array(9).fill(false));
        if (isPlaying && !isPaused) {
          setTimeout(spawnMole, Math.random() * 500 + 300);
        }
      }, 800);
    };

    spawnMole();

    return () => {
      if (moleTimeoutRef.current) {
        clearTimeout(moleTimeoutRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  const whackMole = (index: number) => {
    if (!isPlaying || isPaused || !moles[index]) return;

    setMoles(prev => {
      const newMoles = [...prev];
      newMoles[index] = false;
      return newMoles;
    });
    setScore(s => {
      const newScore = s + 10;
      setHighScore(hs => Math.max(hs, newScore));
      return newScore;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">时间</div>
          <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-[#FF3A7A]' : 'text-[#4ADE80]'}`}>
            {timeLeft}s
          </div>
        </div>
        <div>
          <div className="text-white/60 text-sm">最高分</div>
          <div className="text-2xl font-bold text-[#A42EFF]">{highScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {moles.map((isMole, index) => (
          <button
            key={index}
            onClick={() => whackMole(index)}
            className={`
              w-20 h-20 md:w-24 md:h-24 rounded-full relative overflow-hidden
              transition-all duration-100 transform
              ${isPlaying && !isPaused ? 'cursor-pointer' : 'cursor-default'}
            `}
            style={{
              background: isMole
                ? 'radial-gradient(circle at 30% 30%, #8B4513, #654321)'
                : 'radial-gradient(circle at 30% 30%, #3d2817, #2a1b0f)',
            }}
            disabled={!isPlaying || isPaused}
          >
            {isMole && (
              <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                <div className="text-4xl md:text-5xl">🐹</div>
              </div>
            )}
            {!isMole && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-4 bg-black/30 rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      {!isPlaying && score > 0 && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">时间到!</div>
          <div className="text-white/60">最终得分: {score}</div>
        </div>
      )}

      <div className="flex gap-2">
        {!isPlaying ? (
          <Button onClick={startGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
            <Play className="w-4 h-4 mr-2" />
            开始游戏
          </Button>
        ) : (
          <>
            <Button onClick={() => setIsPaused(!isPaused)} variant="outline" className="border-white/20 text-white">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button onClick={endGame} variant="outline" className="border-white/20 text-white">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <div className="text-white/40 text-sm text-center">
        点击出现的地鼠，越快越好！
      </div>
    </div>
  );
}
