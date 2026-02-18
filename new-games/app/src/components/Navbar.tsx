import { useState, useEffect } from 'react';
import { Gamepad2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '首页', href: '#hero' },
    { name: '游戏', href: '#games' },
    { name: '分类', href: '#categories' },
    { name: '关于', href: '#features' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-2 px-4'
          : 'py-4 px-6'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ${
          isScrolled
            ? 'max-w-4xl bg-[#0F0F1A]/80 backdrop-blur-xl rounded-full px-6 py-2 shadow-lg shadow-[#FF3A7A]/10 border border-white/10'
            : 'max-w-7xl'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3A7A] to-[#A42EFF] flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>
              No WiFi <span className="text-[#FF3A7A]">Games</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="relative text-white/80 hover:text-white transition-colors group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => scrollToSection('#games')}
              className="bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] hover:from-[#FF5A9A] hover:to-[#C44EFF] text-white border-0 rounded-full px-6 relative overflow-hidden group"
            >
              <span className="relative z-10">开始游戏</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-[#0F0F1A]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-white/80 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Button
              onClick={() => scrollToSection('#games')}
              className="mt-2 bg-gradient-to-r from-[#FF3A7A] to-[#A42EFF] text-white border-0 rounded-xl"
            >
              开始游戏
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
