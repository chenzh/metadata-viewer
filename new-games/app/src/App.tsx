import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/sections/Hero';
import { Categories } from '@/sections/Categories';
import { GameGrid } from '@/sections/GameGrid';
import { Features } from '@/sections/Features';
import { Footer } from '@/sections/Footer';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <Navbar />
      <main>
        <Hero onSearch={setSearchQuery} />
        <Categories 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        <GameGrid 
          searchQuery={searchQuery} 
          selectedCategory={selectedCategory} 
        />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default App;
