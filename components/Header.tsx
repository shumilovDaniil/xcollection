import React from 'react';
import { Page } from '../types';
import { EddyIcon, LustGemIcon, DataChipIcon } from './IconComponents';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  eddies: number;
  lustGems: number;
  dataChips: number;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, eddies, lustGems, dataChips }) => {
  const navItems = Object.values(Page);

  return (
    <header className="bg-black/50 backdrop-blur-sm sticky top-0 z-50 border-b-2 border-[color:var(--brand-accent)]">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 mr-2 sm:mb-0">
          <h1 className="text-1xl font-heading text-[color:var(--brand-accent)]">XCollection</h1>
        </div>
        <nav className="flex-grow sm:flex sm:justify-center mb-2 mr-2 sm:mb-0">
          <ul className="flex items-center space-x-1 sm:space-x-2 bg-[color:var(--brand-panel)]/50 p-1.5 flex-wrap justify-center border border-[color:var(--brand-accent)]/50">
            {navItems.map((page) => (
              <li key={page}>
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base font-bold transition-all duration-300 relative transform hover:scale-105 active:scale-95 ${
                    currentPage === page
                      ? 'text-[color:var(--brand-accent)] border-b-2 border-[color:var(--brand-accent)]'
                      : 'text-gray-300 hover:bg-[color:var(--brand-accent)]/10'
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className="flex items-center bg-[color:var(--brand-panel)]/50 px-4 py-2 border border-[color:var(--brand-accent)]/50">
            <EddyIcon className="w-6 h-6 mr-2 text-[color:var(--brand-accent)]" />
            <span className="font-bold text-[color:var(--brand-accent)] text-lg">{eddies.toLocaleString()}</span>
          </div>
          <div className="flex items-center bg-[color:var(--brand-panel)]/50 px-4 py-2 border border-cyan-400/80">
            <DataChipIcon className="w-6 h-6 mr-2 text-cyan-400" />
            <span className="font-bold text-cyan-300 text-lg">{dataChips.toLocaleString()}</span>
          </div>
          <div className="flex items-center bg-[color:var(--brand-panel)]/50 px-4 py-2 border border-[color:var(--brand-warning)]/80">
            <LustGemIcon className="w-6 h-6 mr-2 text-purple-400" />
            <span className="font-bold text-purple-300 text-lg">{lustGems.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
