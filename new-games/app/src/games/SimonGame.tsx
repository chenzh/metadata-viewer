import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

const COLORS = [
  { id: 0, color: '#22C55E', active: '#4ADE80', sound: 261.63 }, // C4
  { id: 1, color: '#DC2626', active: '#EF4444', sound: 329.63 }, // E4
  { id: 2, color: '#FACC15', active: '#FDE047', sound: 392.00 }, // G4
  { id: 3, color: '#2563EB', active: '#3B82F6', sound: 523.25 }, // C5
];

export function SimonGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)() : null;

  const playTone = useCallback((frequency: number, duration: number = 300) => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }, [audioContext]);

  const playSequence = useCallback(async (seq: number[]) => {
    setIsPlayerTurn(false);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const buttonId = seq[i];
      setActiveButton(buttonId);
      playTone(COLORS[buttonId].sound);
      await new Promise(resolve => setTimeout(resolve, 300));
      setActiveButton(null);
    }
    setIsPlayerTurn(true);
  }, [playTone]);

  const startGame = useCallback(() => {
    const firstSequence = [Math.floor(Math.random() * 4)];
    setSequence(firstSequence);
    setPlayerSequence([]);
    setGameOver(false);
    setIsPlaying(true);
    setScore(0);
    setTimeout(() => playSequence(firstSequence), 500);
  }, [playSequence]);

  const handleButtonClick = (id: number) => {
    if (!isPlayerTurn || gameOver) return;

    setActiveButton(id);
    playTone(COLORS[id].sound);
    setTimeout(() => setActiveButton(null), 200);

    const newPlayerSequence = [...playerSequence, id];
    setPlayerSequence(newPlayerSequence);

    // Check if correct
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true);
      setIsPlayerTurn(false);
      return;
    }

    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      setHighScore(hs => Math.max(hs, newScore));
      
      setTimeout(() => {
        const newSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSequence);
        setPlayerSequence([]);
        playSequence(newSequence);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">得分</div>
          <div className="text-2xl font-bold text-[#4ADE80]">{score}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">最高分</div>
          <div className="text-2xl font-bold text-[#FF3A7A]">{highScore}</div>
        </div>
      </div>

      <div className="relative w-64 h-64">
        {/* Simon buttons */}
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          {COLORS.map(({ id, color, active }) => (
            <button
              key={id}
              onClick={() => handleButtonClick(id)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleButtonClick(id);
              }}
              disabled={!isPlayerTurn || gameOver}
              className="rounded-2xl transition-all duration-150 transform active:scale-95"
              style={{
                backgroundColor: activeButton === id ? active : color,
                opacity: isPlayerTurn ? 1 : 0.7,
              }}
            />
          ))}
        </div>

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#0F0F1A] rounded-full flex items-center justify-center border-4 border-white/20">
          <span className="text-white font-bold text-xl">
            {gameOver ? '💀' : isPlayerTurn ? '?' : '...'}
          </span>
        </div>
      </div>

      {gameOver && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">游戏结束!</div>
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
          <Button onClick={startGame} variant="outline" className="border-white/20 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            重新开始
          </Button>
        )}
      </div>

      <div className="text-white/40 text-sm text-center">
        记住并重复颜色序列
      </div>
    </div>
  );
}
