import { useEffect, useRef, useState } from 'react';
import { Brain, Zap, Shield, Puzzle } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: '锻炼大脑',
    description: '通过益智游戏提升逻辑思维和记忆力，让大脑保持活跃状态。',
    color: '#FF3A7A',
  },
  {
    icon: Zap,
    title: '即时游戏',
    description: '无需下载安装，点击即玩，随时随地享受游戏乐趣。',
    color: '#FACC15',
  },
  {
    icon: Shield,
    title: '安全有趣',
    description: '所有游戏经过精心挑选，适合各年龄段玩家，安全无忧。',
    color: '#4ADE80',
  },
  {
    icon: Puzzle,
    title: '益智挑战',
    description: '从简单到困难，各种难度级别的挑战等你来征服。',
    color: '#A42EFF',
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight + rect.height)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#FF3A7A]/5 blur-[120px] left-0 top-1/2 -translate-y-1/2" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#A42EFF]/5 blur-[100px] right-0 top-1/3" />
      </div>

      {/* Neon Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block">
        <div 
          className="w-full bg-gradient-to-b from-[#FF3A7A] via-[#A42EFF] to-[#3B89FF]"
          style={{ 
            height: `${scrollProgress * 100}%`,
            boxShadow: '0 0 20px rgba(255, 58, 122, 0.5), 0 0 40px rgba(164, 46, 255, 0.3)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            为什么选择<span className="text-[#FF3A7A]">我们</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            我们致力于为玩家提供最好的离线游戏体验
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLeft = index % 2 === 0;
            
            return (
              <div
                key={feature.title}
                className={`
                  relative group p-6 rounded-2xl bg-white/5 border border-white/10
                  hover:border-white/20 transition-all duration-500
                  ${isLeft ? 'md:mr-8' : 'md:ml-8'}
                `}
                style={{
                  opacity: scrollProgress > 0.2 + index * 0.15 ? 1 : 0.3,
                  transform: `translateY(${scrollProgress > 0.2 + index * 0.15 ? 0 : 30}px)`,
                  transition: 'all 0.6s ease',
                }}
              >
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ 
                    background: `radial-gradient(circle at center, ${feature.color}, transparent 70%)`,
                  }}
                />

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: `${feature.color}20`,
                      boxShadow: `0 0 20px ${feature.color}30`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF3A7A] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Node on line (desktop only) */}
                <div 
                  className={`
                    hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full
                    border-2 border-white/50 bg-[#0F0F1A]
                    group-hover:scale-150 group-hover:border-[#FF3A7A] transition-all
                    ${isLeft ? '-right-10' : '-left-10'}
                  `}
                  style={{
                    boxShadow: scrollProgress > 0.2 + index * 0.15 ? `0 0 15px ${feature.color}` : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
