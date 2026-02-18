import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🎨', '🎭', '🎪', '🎬'];

export function MemoryGame() {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const initGame = useCallback(() => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isMatched = true;
            updated[second].isMatched = true;
            return updated;
          });
          setFlippedCards([]);
          
          // Check win
          if (cards.filter(c => c.isMatched).length === cards.length - 2) {
            setGameComplete(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isFlipped = false;
            updated[second].isFlipped = false;
            return updated;
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-white/60 text-sm">步数</div>
          <div className="text-2xl font-bold text-[#A42EFF]">{moves}</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">配对</div>
          <div className="text-2xl font-bold text-[#4ADE80]">
            {cards.filter(c => c.isMatched).length / 2} / {EMOJIS.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-xl text-3xl md:text-4xl
              transition-all duration-300 transform
              ${card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-[#FF3A7A] to-[#A42EFF] rotate-0'
                : 'bg-white/10 hover:bg-white/20 rotate-180'
              }
              ${card.isMatched ? 'opacity-60' : ''}
            `}
            disabled={card.isMatched}
          >
            <span className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
              {card.emoji}
            </span>
          </button>
        ))}
      </div>

      {gameComplete && (
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-xl font-bold text-white mb-2">恭喜完成!</div>
          <div className="text-white/60 mb-4">用了 {moves} 步</div>
        </div>
      )}

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        重新开始
      </Button>

      <div className="text-white/40 text-sm text-center">
        翻转卡片，找到相同的配对
      </div>
    </div>
  );
}
