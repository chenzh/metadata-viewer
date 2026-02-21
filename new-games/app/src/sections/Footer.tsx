import { Gamepad2, Github, Twitter, Heart } from 'lucide-react';

// 声明构建时注入的全局变量
declare const __GIT_COMMIT_TIME__: string;

const footerLinks = {
  games: [
    { name: '动作游戏', href: '#games' },
    { name: '益智游戏', href: '#games' },
    { name: '街机游戏', href: '#games' },
    { name: '策略游戏', href: '#games' },
  ],
  support: [
    { name: '联系我们', href: '#' },
    { name: '常见问题', href: '#' },
    { name: '反馈建议', href: '#' },
    { name: '举报问题', href: '#' },
  ],
  legal: [
    { name: '隐私政策', href: '#' },
    { name: '使用条款', href: '#' },
    { name: 'Cookie政策', href: '#' },
  ],
};

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 使用构建时注入的 git 提交时间
  const updateTime = typeof __GIT_COMMIT_TIME__ !== 'undefined' ? __GIT_COMMIT_TIME__ : '未知时间';

  return (
    <footer className="relative pt-20 pb-8 px-4 overflow-hidden">
      {/* Wave Background */}
      <div className="absolute inset-0 bg-[#0A0A12]">
        <svg
          className="absolute top-0 left-0 w-full h-20 text-[#0F0F1A]"
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
        
        {/* Animated signal waves */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: `${(i + 1) * 200}px`,
                height: `${(i + 1) * 60}px`,
                border: '2px solid rgba(255, 58, 122, 0.3)',
                borderRadius: '50% 50% 0 0',
                borderBottom: 'none',
                animation: `pulse ${3 + i}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3A7A] to-[#A42EFF] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                No WiFi <span className="text-[#FF3A7A]">Games</span>
              </span>
            </a>
            <p className="text-white/60 mb-6 max-w-sm">
              无需网络，随时随地畅玩精彩游戏。我们提供30+款精选游戏，全部免费，无需下载。
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Games */}
          <div>
            <h4 className="text-white font-semibold mb-4">游戏分类</h4>
            <ul className="space-y-2">
              {footerLinks.games.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="text-white/60 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-[#FF3A7A] mr-0 group-hover:w-2 group-hover:mr-2 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">支持</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-[#FF3A7A] mr-0 group-hover:w-2 group-hover:mr-2 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">法律信息</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-[#FF3A7A] mr-0 group-hover:w-2 group-hover:mr-2 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 No WiFi Games. 保留所有权利。
          </p>
          <p className="text-white/40 text-sm">
            网站更新日期：{updateTime}
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            用 <Heart className="w-4 h-4 text-[#FF3A7A]" /> 制作
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </footer>
  );
}
