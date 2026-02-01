// app/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  categories: string[];
  activeCategory?: string;
}

export default function Header({ categories, activeCategory }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pastikan Bokep Korea ada di list
  const filteredCategories = categories.filter(category => 
    category === 'Bokep Indo' || 
    category === 'Bokep Jilbab' ||
    category === 'Bokep Korea' 
  );

  // --- LOGIKA URL UPDATE ---
  const getCategoryUrl = (catName: string) => {
    // Jika Bokep Korea, arahkan ke HALAMAN KHUSUS (/korea)
    if (catName === 'Bokep Korea') {
        return '/korea';
    }
    
    // Jika lainnya (Indo/Jilbab), arahkan ke kategori Avtub biasa
    const slug = catName.toLowerCase().replace(/\s+/g, '-');
    return `/category?data=${encodeURIComponent(btoa(`https://www.avtub.net/category/${slug}/?filter=latest`))}`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      // Pencarian global
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-gray-950/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 cursor-pointer">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              UNtube <span className="text-white">Exploration</span>
            </h1>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-white/10 rounded-full py-2 px-5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar">
            {filteredCategories.map((category) => (
              <button
                key={category}
                onClick={() => router.push(getCategoryUrl(category))}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category 
                    ? 'text-blue-400 font-bold' 
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mb-4 pt-2">
            <div className="relative">
                <input
                  type="text"
                  placeholder="Search video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
          </form>

          <div className="flex flex-col space-y-2 pb-4 border-t border-white/5 pt-4">
            {filteredCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(getCategoryUrl(category));
                }}
                className={`text-left py-2 px-4 rounded-lg hover:bg-white/5 transition-all ${
                    activeCategory === category ? 'text-blue-400 bg-white/5' : 'text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}