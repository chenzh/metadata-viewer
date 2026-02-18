import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 20;

export function TowerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<{ x: number; y: number; width: number }[]>([]);
  const [movingBlock, setMovingBlock] = useState<{ x: number; direction: number } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const resetGame = useCallback(() => {
    setBlocks([{ x: CANVAS_WIDTH / 2 - BLOCK_WIDTH / 2, y: CANVAS_HEIGHT - 40, width: BLOCK_WIDTH }]);
    setMovingBlock({ x: 0, direction: 1 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setStarted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver) return;
      
      if (e.key === ' ') {
        e.preventDefault();
        if (!isPaused && movingBlock) {
          const lastBlock = blocks[blocks.length - 1];
          const overlap = Math.max(0, Math.min(movingBlock.x + BLOCK_WIDTH, lastBlock.x + lastBlock.width) - 
                                        Math.max(movingBlock.x, lastBlock.x));
          
          if (overlap <= 0) {
            setGameOver(true);
            return;
          }

          const newX = Math.max(movingBlock.x, lastBlock.x);
          const newBlock = {
            x: newX,
            y: lastBlock.y - BLOCK_HEIGHT,
            width: overlap,
          };

          setBlocks(prev => [...prev, newBlock]);
          setScore(s => s + 1);
          setMovingBlock({ x: 0, direction: movingBlock.direction * 1.02 });
        } else if (isPaused) {
          setIsPaused(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver, isPaused, movingBlock, blocks]);

  useEffect(() => {
    if (!started || gameOver || isPaused || !movingBlock) return;

    const interval = setInterval(() => {
      setMovingBlock(block => {
        if (!block) return null;
        let newX = block.x + block.direction * 3;
        let newDirection = block.direction;
        
        if (newX <= 0) {
          newX = 0;
          newDirection = 1;
        } else if (newX >= CANVAS_WIDTH - BLOCK_WIDTH) {
          newX = CANVAS_WIDTH - BLOCK_WIDTH;
          newDirection = -1;
        }
        
        return { x: newX, direction: newDirection };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [started, gameOver, isPaused, movingBlock]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0F0F1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw blocks
    blocks.forEach((block, i) => {
      const hue = (i * 20) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(block.x, block.y, block.width, BLOCK_HEIGHT);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(block.x, block.y, block.width, BLOCK_HEIGHT);
    });

    // Draw moving block
    if (movingBlock) {
      const lastBlock = blocks[blocks.length - 1];
      ctx.fillStyle = `hsl(${(blocks.length * 20) % 360}, 70%, 60%)`;
      ctx.fillRect(movingBlock.x, lastBlock.y - BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(movingBlock.x, lastBlock.y - BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
    }

    // Draw height indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(10, 10, 80, 30);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`高度: ${score}`, 20, 32);
  }, [blocks, movingBlock, score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-white/60 text-sm">高度</div>
        <div className="text-2xl font-bold text-[#4ADE80]">{score}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg max-w-full"
        />
        
        {!started && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">🏗️</div>
            <div className="text-xl font-bold text-white mb-2">堆塔</div>
            <div className="text-white/60 text-sm mb-4">按空格键开始</div>
            <Button onClick={resetGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
              开始游戏
            </Button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-2xl font-bold text-white mb-2">塔倒了!</div>
            <div className="text-white/60 mb-4">高度: {score}</div>
            <Button onClick={resetGame} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
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

      {/* Mobile Controls */}
      <div className="md:hidden w-full max-w-xs">
        <Button 
          onClick={() => {
            if (!started || gameOver) return;
            if (!isPaused && movingBlock) {
              const lastBlock = blocks[blocks.length - 1];
              const overlap = Math.max(0, Math.min(movingBlock.x + BLOCK_WIDTH, lastBlock.x + lastBlock.width) - 
                                            Math.max(movingBlock.x, lastBlock.x));
              
              if (overlap <= 0) {
                setGameOver(true);
                return;
              }

              const newX = Math.max(movingBlock.x, lastBlock.x);
              const newBlock = {
                x: newX,
                y: lastBlock.y - BLOCK_HEIGHT,
                width: overlap,
              };

              setBlocks(prev => [...prev, newBlock]);
              setScore(s => s + 1);
              setMovingBlock({ x: 0, direction: movingBlock.direction * 1.02 });
            } else if (isPaused) {
              setIsPaused(false);
            }
          }} 
          variant="outline" 
          className="w-full h-16 border-white/20 text-white text-xl"
          disabled={!started || gameOver}
        >
          👇 放置方块
        </Button>
      </div>

      <div className="flex gap-2 md:hidden">
        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm" className="flex-1">
          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isPaused ? '继续' : '暂停'}
        </Button>
        <Button onClick={resetGame} variant="outline" size="sm" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="text-white/40 text-sm text-center">
        按空格键放置方块，精准堆叠
      </div>
    </div>
  );
}
