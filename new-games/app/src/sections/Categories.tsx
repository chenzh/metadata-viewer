import { useRef, useEffect, useState } from 'react';
import { categories } from '@/data/games';

interface CategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bubblePositions, setBubblePositions] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // Generate random positions for bubbles
    const positions = categories.map(() => ({
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
    }));
    setBubblePositions(positions);
  }, []);

  useEffect(() => {
    if (bubblePositions.length === 0) return;

    const interval = setInterval(() => {
      setBubblePositions((prev) =>
        prev.map(() => ({
          x: Math.sin(Date.now() / 1000 + Math.random() * 10) * 15,
          y: Math.cos(Date.now() / 1200 + Math.random() * 10) * 15,
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [bubblePositions.length]);

  return (
    <section id="categories" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#A42EFF]/10 blur-[100px] -left-20 top-1/2 -translate-y-1/2" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[#FF3A7A]/10 blur-[80px] -right-10 top-1/3" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            游戏<span className="text-[#FF3A7A]">分类</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            探索各种类型的游戏，找到你最喜欢的玩法
          </p>
        </div>

        {/* Category Bubbles */}
        <div
          ref={containerRef}
          className="flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.id;
            const pos = bubblePositions[index] || { x: 0, y: 0 };

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`
                  relative group px-6 py-4 rounded-2xl transition-all duration-500
                  ${isSelected
                    ? 'bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] scale-110 shadow-lg shadow-[#FF3A7A]/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }
                `}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) ${isSelected ? 'scale(1.1)' : 'scale(1)'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    {category.name}
                  </span>
                </div>

                {/* Glow Effect */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] blur-xl opacity-50 -z-10" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Category Indicator */}
        <div className="mt-12 text-center">
          <span className="text-white/40 text-sm">
            当前选择: <span className="text-[#FF3A7A] font-medium">
              {categories.find(c => c.id === selectedCategory)?.name || '全部'}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
