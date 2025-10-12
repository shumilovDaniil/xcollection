import React, { useState } from 'react';
import { PlayerCurrencies, CheatMenuProps } from '../types';

const CheatMenu: React.FC<CheatMenuProps> = ({ onAddCurrency }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [eddiesInput, setEddiesInput] = useState('10000');
    const [gemsInput, setGemsInput] = useState('1000');
    const [chipsInput, setChipsInput] = useState('500');
    
    const handleAddEddies = () => {
        const amount = parseInt(eddiesInput, 10);
        if (!isNaN(amount)) {
            onAddCurrency('eddies', amount);
        }
    };

    const handleAddGems = () => {
        const amount = parseInt(gemsInput, 10);
        if (!isNaN(amount)) {
            onAddCurrency('lustGems', amount);
        }
    };

    const handleAddChips = () => {
        const amount = parseInt(chipsInput, 10);
        if (!isNaN(amount)) {
            onAddCurrency('dataChips', amount);
        }
    };
    
    const buttonClass = "w-full bg-[color:var(--brand-accent)] hover:bg-[color:var(--brand-warning)] text-black font-bold px-3 py-1 transition text-xs";
    const inputClass = "w-full bg-gray-800 border border-[color:var(--brand-accent)]/50 px-2 py-1 text-white text-xs";


    return (
        <div className={`fixed top-1/2 -translate-y-1/2 left-0 z-[100] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="relative pl-12">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute top-1/2 -translate-y-1/2 -right-8 bg-[color:var(--brand-panel)] text-white p-2 border border-l-0 border-[color:var(--brand-accent)]/50"
                    aria-label={isOpen ? "Скрыть чит-меню" : "Показать чит-меню"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                <div className="bg-gray-900/80 backdrop-blur-md p-4 border border-l-0 border-t-2 border-b-2 border-r-2 border-[color:var(--brand-accent)]/50 w-64 space-y-4">
                    <h3 className="text-lg font-bold text-center text-[color:var(--brand-accent)] font-heading">Чит-Меню</h3>
                    
                    {/* Currency */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Добавить Валюту</label>
                        <div className="flex items-center space-x-2">
                            <input type="number" value={eddiesInput} onChange={e => setEddiesInput(e.target.value)} className={inputClass} aria-label="Сумма Эдди" />
                            <button onClick={handleAddEddies} className={buttonClass}>+ Эдди</button>
                        </div>
                         <div className="flex items-center space-x-2">
                            <input type="number" value={chipsInput} onChange={e => setChipsInput(e.target.value)} className={inputClass} aria-label="Сумма Чипов" />
                            <button onClick={handleAddChips} className={buttonClass}>+ Чипы</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="number" value={gemsInput} onChange={e => setGemsInput(e.target.value)} className={inputClass} aria-label="Сумма Камней" />
                            <button onClick={handleAddGems} className={buttonClass}>+ Камни</button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default CheatMenu;
