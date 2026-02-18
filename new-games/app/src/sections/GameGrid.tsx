import { useState, useEffect, useRef } from 'react';
import { games, type Game } from '@/data/games';
import { Star, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SnakeGame } from '@/games/SnakeGame';
import { TetrisGame } from '@/games/TetrisGame';
import { PacmanGame } from '@/games/PacmanGame';
import { PongGame } from '@/games/PongGame';
import { BreakoutGame } from '@/games/BreakoutGame';
import { FlappyGame } from '@/games/FlappyGame';
import { DinoGame } from '@/games/DinoGame';
import { MemoryGame } from '@/games/MemoryGame';
import { MinesweeperGame } from '@/games/MinesweeperGame';
import { SudokuGame } from '@/games/SudokuGame';
import { Game2048 } from '@/games/Game2048';
import { TicTacToeGame } from '@/games/TicTacToeGame';
import { Connect4Game } from '@/games/Connect4Game';
import { HangmanGame } from '@/games/HangmanGame';
import { WhackAMoleGame } from '@/games/WhackAMoleGame';
import { SpaceInvadersGame } from '@/games/SpaceInvadersGame';
import { AsteroidsGame } from '@/games/AsteroidsGame';
import { FroggerGame } from '@/games/FroggerGame';
import { SimonGame } from '@/games/SimonGame';
import { SlidingPuzzleGame } from '@/games/SlidingPuzzleGame';
import { ChessGame } from '@/games/ChessGame';
import { CheckersGame } from '@/games/CheckersGame';
import { SolitaireGame } from '@/games/SolitaireGame';
import { BlackjackGame } from '@/games/BlackjackGame';
import { WordSearchGame } from '@/games/WordSearchGame';
import { CrosswordGame } from '@/games/CrosswordGame';
import { MahjongGame } from '@/games/MahjongGame';
import { BubbleGame } from '@/games/BubbleGame';
import { JewelGame } from '@/games/JewelGame';
import { TowerGame } from '@/games/TowerGame';
import { ColorJumpGame } from '@/games/ColorJumpGame';
import { ZigzagGame } from '@/games/ZigzagGame';
import { KnifeThrowGame } from '@/games/KnifeThrowGame';

interface GameGridProps {
  searchQuery: string;
  selectedCategory: string;
}

const gameComponents: Record<string, React.ComponentType> = {
  snake: SnakeGame,
  tetris: TetrisGame,
  pacman: PacmanGame,
  pong: PongGame,
  breakout: BreakoutGame,
  flappy: FlappyGame,
  dino: DinoGame,
  memory: MemoryGame,
  minesweeper: MinesweeperGame,
  sudoku: SudokuGame,
  '2048': Game2048,
  tictactoe: TicTacToeGame,
  connect4: Connect4Game,
  hangman: HangmanGame,
  whackamole: WhackAMoleGame,
  spaceinvaders: SpaceInvadersGame,
  asteroids: AsteroidsGame,
  frogger: FroggerGame,
  simon: SimonGame,
  slidingpuzzle: SlidingPuzzleGame,
  chess: ChessGame,
  checkers: CheckersGame,
  solitaire: SolitaireGame,
  blackjack: BlackjackGame,
  wordsearch: WordSearchGame,
  crossword: CrosswordGame,
  mahjong: MahjongGame,
  bubble: BubbleGame,
  jewel: JewelGame,
  tower: TowerGame,
  colorjump: ColorJumpGame,
  zigzag: ZigzagGame,
  knifethrow: KnifeThrowGame,
};

export function GameGrid({ searchQuery, selectedCategory }: GameGridProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [visibleGames, setVisibleGames] = useState<number>(12);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedGames = filteredGames.slice(0, visibleGames);

  useEffect(() => {
    setVisibleGames(12);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const cards = gridRef.current?.querySelectorAll('.game-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [displayedGames]);

  const loadMore = () => {
    setVisibleGames((prev) => Math.min(prev + 12, filteredGames.length));
  };

  const GameComponent = selectedGame ? gameComponents[selectedGame.id] : null;

  return (
    <section id="games" className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#3B89FF]/10 blur-[120px] right-0 top-0" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#00D4FF]/10 blur-[100px] left-0 bottom-0" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#FF3A7A]" />
              <span className="text-white/60 text-sm uppercase tracking-wider">精选游戏</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              全部<span className="text-[#FF3A7A]">游戏</span>
            </h2>
          </div>
          <div className="text-white/60">
            共 <span className="text-white font-semibold">{filteredGames.length}</span> 款游戏
          </div>
        </div>

        {/* Games Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {displayedGames.map((game, index) => (
            <div
              key={game.id}
              className="game-card group relative opacity-0 translate-y-8"
              style={{
                transitionDelay: `${(index % 4) * 100}ms`,
              }}
            >
              <div
                onClick={() => setSelectedGame(game)}
                className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF3A7A]/50 transition-all duration-500 cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF3A7A]/10"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-[4/3] flex items-center justify-center text-8xl relative overflow-hidden"
                  style={{ backgroundColor: `${game.color}15` }}
                >
                  <span className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                    {game.thumbnail}
                  </span>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] text-white border-0 rounded-full px-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      立即玩
                    </Button>
                  </div>

                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${game.color} 0%, transparent 70%)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg group-hover:text-[#FF3A7A] transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-white/80">{game.rating}</span>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm line-clamp-2 mb-3">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${game.color}20`,
                        color: game.color,
                      }}
                    >
                      {game.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleGames < filteredGames.length && (
          <div className="text-center mt-12">
            <Button
              onClick={loadMore}
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-8"
            >
              加载更多
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-white mb-2">没有找到游戏</h3>
            <p className="text-white/60">试试其他搜索词或分类</p>
          </div>
        )}
      </div>

      {/* Game Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-[#0F0F1A] border-white/10 p-0 overflow-hidden">
          {selectedGame && (
            <>
              <DialogHeader className="p-4 border-b border-white/10">
                <DialogTitle className="text-white flex items-center gap-3">
                  <span className="text-2xl">{selectedGame.thumbnail}</span>
                  {selectedGame.title}
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {GameComponent && <GameComponent />}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .game-card {
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .game-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
