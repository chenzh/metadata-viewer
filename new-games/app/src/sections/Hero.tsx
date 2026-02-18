import { useEffect, useRef, useState } from 'react';
import { Search, Sparkles, Rocket, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroProps {
  onSearch: (query: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
    const gamesSection = document.querySelector('#games');
    if (gamesSection) {
      gamesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#0F0F1A]">
        {/* Gradient Orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] transition-transform duration-1000"
          style={{
            background: 'radial-gradient(circle, #FF3A7A 0%, transparent 70%)',
            left: '10%',
            top: '20%',
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px] transition-transform duration-1000"
          style={{
            background: 'radial-gradient(circle, #A42EFF 0%, transparent 70%)',
            right: '15%',
            bottom: '10%',
            transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`,
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px] transition-transform duration-1000"
          style={{
            background: 'radial-gradient(circle, #3B89FF 0%, transparent 70%)',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Game Icons */}
      <div
        className="absolute left-[10%] top-[30%] text-6xl transition-transform duration-700"
        style={{
          transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px) rotate(${mousePos.x * 10}deg)`,
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        🎮
      </div>
      <div
        className="absolute right-[15%] top-[25%] text-5xl transition-transform duration-700"
        style={{
          transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) rotate(${mousePos.x * -15}deg)`,
          animation: 'float 5s ease-in-out infinite 0.5s',
        }}
      >
        🕹️
      </div>
      <div
        className="absolute left-[15%] bottom-[25%] text-5xl transition-transform duration-700"
        style={{
          transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)`,
          animation: 'float 4.5s ease-in-out infinite 1s',
        }}
      >
        🎯
      </div>
      <div
        className="absolute right-[10%] bottom-[30%] text-6xl transition-transform duration-700"
        style={{
          transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -45}px) rotate(${mousePos.x * 20}deg)`,
          animation: 'float 5.5s ease-in-out infinite 1.5s',
        }}
      >
        🏆
      </div>
      <div
        className="absolute left-[8%] top-[50%] text-4xl transition-transform duration-700"
        style={{
          transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          animation: 'float 3.5s ease-in-out infinite 0.3s',
        }}
      >
        ⚡
      </div>
      <div
        className="absolute right-[12%] top-[55%] text-4xl transition-transform duration-700"
        style={{
          transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)`,
          animation: 'float 4.5s ease-in-out infinite 0.8s',
        }}
      >
        🌟
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#FF3A7A]" />
          <span className="text-sm text-white/80">免费畅玩，无需下载</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">无需WiFi</span>
          <br />
          <span className="bg-gradient-to-r from-[#FF3A7A] via-[#A42EFF] to-[#3B89FF] bg-clip-text text-transparent">
            乐趣不停歇
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto">
          立即畅玩 <span className="text-[#FF3A7A] font-semibold">30+</span> 款精彩游戏
          <br className="hidden md:block" />
          无需下载，无需网络，随时随地免费畅玩！
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#FF3A7A] transition-colors" />
            <Input
              type="text"
              placeholder="搜索游戏..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-14 pl-12 pr-32 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF3A7A] focus:ring-[#FF3A7A]/20 transition-all"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] hover:from-[#FF5A9A] hover:to-[#C44EFF] text-white border-0 rounded-xl px-6"
            >
              搜索
            </Button>
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => {
              const gamesSection = document.querySelector('#games');
              if (gamesSection) {
                gamesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] hover:from-[#FF5A9A] hover:to-[#C44EFF] text-white border-0 rounded-full px-8 h-14 text-lg group relative overflow-hidden"
          >
            <Gamepad2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">开始探索</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              const categoriesSection = document.querySelector('#categories');
              if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            浏览分类
          </Button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-16 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">30+</div>
            <div className="text-sm text-white/50">精选游戏</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-white/50">需要下载</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
            <div className="text-sm text-white/50">免费畅玩</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F1A] to-transparent" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </section>
  );
}
