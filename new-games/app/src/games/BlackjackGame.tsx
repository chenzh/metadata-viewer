import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;
}

const SUITS: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RANK_NAMES: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K',
};

export function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'finished'>('betting');
  const [result, setResult] = useState<string>('');

  const createDeck = useCallback(() => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        newDeck.push({ suit, rank });
      }
    }
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }, []);

  const getCardValue = (card: Card): number => {
    if (card.rank > 10) return 10;
    if (card.rank === 1) return 11;
    return card.rank;
  };

  const getHandValue = (hand: Card[]): number => {
    let value = 0;
    let aces = 0;
    for (const card of hand) {
      value += getCardValue(card);
      if (card.rank === 1) aces++;
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  };

  const deal = () => {
    const newDeck = createDeck();
    const playerCards = [newDeck.pop()!, newDeck.pop()!];
    const dealerCards = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState('playing');
    setResult('');

    // Check for blackjack
    if (getHandValue(playerCards) === 21) {
      setGameState('finished');
      setResult('Blackjack! 你赢了! 🎉');
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    
    setDeck(newDeck);
    setPlayerHand(newHand);

    const value = getHandValue(newHand);
    if (value > 21) {
      setGameState('finished');
      setResult('爆牌! 你输了 💥');
    }
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    
    setGameState('dealer');
    
    // Dealer plays
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    while (getHandValue(currentDealerHand) < 17) {
      currentDealerHand.push(currentDeck.pop()!);
    }
    
    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(currentDealerHand);

    setGameState('finished');
    
    if (dealerValue > 21) {
      setResult('庄家爆牌! 你赢了! 🎉');
    } else if (playerValue > dealerValue) {
      setResult('你赢了! 🎉');
    } else if (dealerValue > playerValue) {
      setResult('庄家赢了 😢');
    } else {
      setResult('平局 🤝');
    }
  };

  const renderCard = (card: Card, hidden: boolean = false) => (
    <div
      className={`
        w-12 h-16 md:w-14 md:h-20 rounded border-2 flex flex-col items-center justify-center text-sm font-bold bg-white
        ${hidden ? 'bg-[#3B89FF] border-[#2563EB]' : (card.suit === 'hearts' || card.suit === 'diamonds') ? 'text-[#FF3A7A]' : 'text-black'}
        border-gray-300
      `}
    >
      {!hidden && (
        <>
          <span>{RANK_NAMES[card.rank] || card.rank}</span>
          <span className="text-lg">{SUIT_SYMBOLS[card.suit]}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dealer */}
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">庄家</div>
        <div className="text-xl font-bold text-white">
          {gameState === 'playing' ? '?' : getHandValue(dealerHand)}
        </div>
      </div>
      
      <div className="flex gap-2">
        {dealerHand.map((card, i) => (
          <div key={i}>
            {renderCard(card, gameState === 'playing' && i === 1)}
          </div>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div className="text-center">
          <div className="text-2xl font-bold text-[#FACC15]">{result}</div>
        </div>
      )}

      {/* Player */}
      <div className="flex gap-2">
        {playerHand.map((card, i) => (
          <div key={i}>{renderCard(card)}</div>
        ))}
      </div>

      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">你</div>
        <div className="text-xl font-bold text-white">{getHandValue(playerHand)}</div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {gameState === 'betting' && (
          <Button onClick={deal} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
            发牌
          </Button>
        )}
        
        {gameState === 'playing' && (
          <>
            <Button onClick={hit} variant="outline" className="border-white/20 text-white">
              要牌
            </Button>
            <Button onClick={stand} variant="outline" className="border-white/20 text-white">
              停牌
            </Button>
          </>
        )}
        
        {gameState === 'finished' && (
          <Button onClick={deal} className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF]">
            <RotateCcw className="w-4 h-4 mr-2" />
            再来一局
          </Button>
        )}
      </div>

      <div className="text-white/40 text-sm text-center">
        目标: 尽可能接近21点，但不要爆牌
      </div>
    </div>
  );
}
