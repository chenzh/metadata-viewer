import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;
  faceUp: boolean;
}

const SUITS: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-[#FF3A7A]',
  diamonds: 'text-[#FF3A7A]',
  clubs: 'text-black',
  spades: 'text-black',
};

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RANK_NAMES: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K',
};

export function SolitaireGame() {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([]);
  const [selectedCard, setSelectedCard] = useState<{ pile: string; index: number; card: Card } | null>(null);

  const initGame = useCallback(() => {
    // Create deck
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, faceUp: false });
      }
    }

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Deal tableau
    const newTableau: Card[][] = [];
    for (let i = 0; i < 7; i++) {
      const pile: Card[] = [];
      for (let j = 0; j <= i; j++) {
        const card = deck.pop()!;
        card.faceUp = j === i;
        pile.push(card);
      }
      newTableau.push(pile);
    }

    setStock(deck.map(c => ({ ...c, faceUp: false })));
    setWaste([]);
    setFoundations([[], [], [], []]);
    setTableau(newTableau);
    setSelectedCard(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const drawFromStock = () => {
    if (stock.length === 0) {
      if (waste.length > 0) {
        setStock(waste.map(c => ({ ...c, faceUp: false })).reverse());
        setWaste([]);
      }
      return;
    }

    const newStock = [...stock];
    const card = newStock.pop()!;
    card.faceUp = true;
    setStock(newStock);
    setWaste([...waste, card]);
  };

  const canPlaceOnTableau = (card: Card, targetCard: Card | null): boolean => {
    if (!targetCard) return card.rank === 13;
    const oppositeColors = (card.suit === 'hearts' || card.suit === 'diamonds') !==
                          (targetCard.suit === 'hearts' || targetCard.suit === 'diamonds');
    return oppositeColors && card.rank === targetCard.rank - 1;
  };

  const canPlaceOnFoundation = (card: Card, foundation: Card[]): boolean => {
    if (foundation.length === 0) return card.rank === 1;
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && card.rank === topCard.rank + 1;
  };

  const handleCardClick = (pile: string, index: number, card: Card) => {
    if (!card.faceUp) return;

    if (selectedCard) {
      if (selectedCard.pile === pile && selectedCard.index === index) {
        setSelectedCard(null);
        return;
      }

      // Try to move card
      if (pile.startsWith('foundation')) {
        const foundationIndex = parseInt(pile.split('-')[1]);
        if (canPlaceOnFoundation(selectedCard.card, foundations[foundationIndex])) {
          const newFoundations = [...foundations];
          newFoundations[foundationIndex] = [...newFoundations[foundationIndex], selectedCard.card];
          setFoundations(newFoundations);
          removeCardFromSource(selectedCard);
        }
      } else if (pile.startsWith('tableau')) {
        const tableauIndex = parseInt(pile.split('-')[1]);
        const targetPile = tableau[tableauIndex];
        const targetCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : null;
        if (canPlaceOnTableau(selectedCard.card, targetCard)) {
          const newTableau = [...tableau];
          newTableau[tableauIndex] = [...targetPile, selectedCard.card];
          setTableau(newTableau);
          removeCardFromSource(selectedCard);
        }
      }
      setSelectedCard(null);
    } else {
      setSelectedCard({ pile, index, card });
    }
  };

  const removeCardFromSource = (selected: typeof selectedCard) => {
    if (!selected) return;

    if (selected.pile === 'waste') {
      setWaste(waste.slice(0, -1));
    } else if (selected.pile.startsWith('tableau')) {
      const tableauIndex = parseInt(selected.pile.split('-')[1]);
      const newTableau = [...tableau];
      newTableau[tableauIndex] = newTableau[tableauIndex].slice(0, -1);
      if (newTableau[tableauIndex].length > 0) {
        newTableau[tableauIndex][newTableau[tableauIndex].length - 1].faceUp = true;
      }
      setTableau(newTableau);
    }
  };

  const renderCard = (card: Card, isSelected: boolean) => (
    <div
      className={`
        w-12 h-16 md:w-14 md:h-20 rounded border-2 flex flex-col items-center justify-center text-sm font-bold
        ${card.faceUp ? 'bg-white ' + SUIT_COLORS[card.suit] : 'bg-[#3B89FF] border-[#2563EB]'}
        ${isSelected ? 'ring-2 ring-[#FF3A7A] ring-offset-2 ring-offset-[#0F0F1A]' : 'border-gray-300'}
      `}
    >
      {card.faceUp && (
        <>
          <span>{RANK_NAMES[card.rank] || card.rank}</span>
          <span className="text-lg">{SUIT_SYMBOLS[card.suit]}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top row */}
      <div className="flex justify-between w-full max-w-md">
        {/* Stock and Waste */}
        <div className="flex gap-2">
          <button
            onClick={drawFromStock}
            className="w-12 h-16 md:w-14 md:h-20 rounded border-2 border-gray-300 bg-[#3B89FF] flex items-center justify-center hover:bg-[#2563EB]"
          >
            <span className="text-white text-xs">{stock.length}</span>
          </button>
          <div
            onClick={() => waste.length > 0 && handleCardClick('waste', waste.length - 1, waste[waste.length - 1])}
            className="cursor-pointer"
          >
            {waste.length > 0 ? (
              renderCard(waste[waste.length - 1], selectedCard?.pile === 'waste')
            ) : (
              <div className="w-12 h-16 md:w-14 md:h-20 rounded border-2 border-gray-600 bg-transparent" />
            )}
          </div>
        </div>

        {/* Foundations */}
        <div className="flex gap-1">
          {foundations.map((foundation, i) => (
            <div
              key={i}
              onClick={() => foundation.length > 0 && handleCardClick(`foundation-${i}`, foundation.length - 1, foundation[foundation.length - 1])}
              className="cursor-pointer"
            >
              {foundation.length > 0 ? (
                renderCard(foundation[foundation.length - 1], selectedCard?.pile === `foundation-${i}`)
              ) : (
                <div className="w-12 h-16 md:w-14 md:h-20 rounded border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-600 text-xs">
                  {SUIT_SYMBOLS[SUITS[i]]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="flex gap-1 md:gap-2">
        {tableau.map((pile, i) => (
          <div key={i} className="flex flex-col items-center">
            {pile.map((card, j) => (
              <div
                key={j}
                onClick={() => handleCardClick(`tableau-${i}`, j, card)}
                className="cursor-pointer"
                style={{ marginTop: j === 0 ? 0 : '-40px' }}
              >
                {renderCard(card, selectedCard?.pile === `tableau-${i}` && selectedCard?.index === j)}
              </div>
            ))}
            {pile.length === 0 && (
              <div
                onClick={() => handleCardClick(`tableau-${i}`, 0, { suit: 'hearts', rank: 0, faceUp: true })}
                className="w-12 h-16 md:w-14 md:h-20 rounded border-2 border-dashed border-gray-600 cursor-pointer"
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={initGame} variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <RotateCcw className="w-4 h-4 mr-2" />
        新游戏
      </Button>

      <div className="text-white/40 text-sm text-center">
        点击牌堆抽牌，按规则移动纸牌
      </div>
    </div>
  );
}
