import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const TARGET_RADIUS = 80;
const KNIFE_LENGTH = 60;

export function KnifeThrowGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetAngle, setTargetAngle] = useState(0);
  const [knives, setKnives] = useState<number[]>([]);
  const [remainingKnives, setRemainingKnives] = useState(8);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);

  const initGame = useCallback(() => {
    setTargetAngle(0);
    setKnives([]);
    setRemainingKnives(8);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setStarted(true);
    setLevel(1);
  }, []);

  const nextLevel = useCallback(() => {
    setTargetAngle(0);
    setKnives([]);
    setRemainingKnives(8 + level);
    setLevel(l => l + 1);
  }, [level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver) return;
      
      if (e.key === ' ') {
        e.preventDefault();
        if (isPaused) {
          setIsPaused(false);
        } else {
          // Throw knife
          const knifeAngle = targetAngle % (Math.PI * 2);
          
          // Check collision with existing knives
          for (const existingAngle of knives) {
            const diff = Math.abs(knifeAngle - existingAngle);
            const normalizedDiff = Math.min(diff, Math.PI * 2 - diff);
            if (normalizedDiff < 0.15) {
              setGameOver(true);
              return;
            }
          }
          
          setKnives(prev => [...prev, knifeAngle]);
          setRemainingKnives(k => {
            const newK = k - 1;
            if (newK === 0) {
              setScore(s => s + 100);
              setTimeout(nextLevel, 500);
            }
            return newK;
          });
          setScore(s => s + 10);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver, isPaused, targetAngle, knives, nextLevel]);

  useEffect(() => {
    if (!started || gameOver || isPaused) return;

    const interval = setInterval(() => {
      setTargetAngle(a => a + (0.02 + level * 0.005));
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = CANVAS_WIDTH / 2;
    const centerY = 200;

    // Draw target
    ctx.beginPath();
    ctx.arc(centerX, centerY, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#8B4513';
    ctx.fill();
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Target rings
    ctx.beginPath();
    ctx.arc(centerX, centerY, TARGET_RADIUS * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#A0522D';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, TARGET_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#CD853F';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, TARGET_RADIUS * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#FF3A7A';
    ctx.fill();

    // Draw stuck knives
    knives.forEach(angle => {
      const knifeX = centerX + Math.cos(angle) * TARGET_RADIUS;
      const knifeY = centerY + Math.sin(angle) * TARGET_RADIUS;
      
      ctx.save();
      ctx.translate(knifeX, knifeY);
      ctx.rotate(angle + Math.PI / 2);
      
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(-3, 0, 6, KNIFE_LENGTH);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-8, KNIFE_LENGTH - 15, 16, 15);
      
      ctx.restore();
    });

    // Draw remaining knife
    if (remainingKnives > 0) {
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(centerX - 3, CANVAS_HEIGHT - 80, 6, KNIFE_LENGTH);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(centerX - 8, CANVAS_HEIGHT - 80 + KNIFE_LENGTH - 15, 16, 15);
    }

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Level: ${level}`, 20, 40);
    ctx.fillText(`Score: ${score}`, 20, 70);
    ctx.fillText(`Knives: ${remainingKnives}`, CANVAS_WIDTH - 120, 40);
  }, [targetAngle, knives, remainingKnives, score, level]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">关卡</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{level}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#FACC15]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">飞刀</div>
          <div className="text-2xl font-bold text-[#00D4FF]">{remainingKnives}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full cursor-pointer"
          onClick={() => {
            if (started && !gameOver && !isPaused) {
              const knifeAngle = targetAngle % (Math.PI * 2);
              
              for (const existingAngle of knives) {
                const diff = Math.abs(knifeAngle - existingAngle);
                const normalizedDiff = Math.min(diff, Math.PI * 2 - diff);
                if (normalizedDiff < 0.15) {
                  setGameOver(true);
                  return;
                }
              }
              
              setKnives(prev => [...prev, knifeAngle]);
              setRemainingKnives(k => {
                const newK = k - 1;
                if (newK === 0) {
                  setScore(s => s + 100);
                  setTimeout(nextLevel, 500);
                }
                return newK;
              });
              setScore(s => s + 10);
            }
          }}
        />
        
        {!started && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-xl font-bold text-white mb-2">飞刀挑战</div>
            <Button onClick={initGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              开始游戏
            </Button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-2xl font-bold text-white mb-2">击中飞刀!</div>
            <div className="text-white/60 mb-4">得分: {score}</div>
            <Button onClick={initGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          </div>
        )}

        {isPaused && !gameOver && started && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <div className="text-2xl font-bold text-white">暂停</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {started && (
          <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        )}
        {started && (
          <Button onClick={initGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="text-white/40 text-sm text-center">
        点击或按空格键投掷飞刀，不要击中其他飞刀
      </div>
    </div>
  );
}
