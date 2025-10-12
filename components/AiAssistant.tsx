import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AiAssistantIcon, SendIcon, CloseIcon } from './IconComponents';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AiAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const initializeChat = useCallback(() => {
        if (!chatRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: `You are a helpful AI assistant for the cyberpunk collectible card game 'XCollection'.
                        Your goal is to answer player questions about game mechanics, cards, strategies, and lore. Be friendly, concise, and stay in character as a futuristic AI.

                        Key Game Mechanics:
                        - **Collection**: Players collect cards of different rarities: Обычная (Common), Редкая (Rare), Эпическая (Epic), Легендарная (Legendary).
                        - **Chests (Сундуки)**: Players open chests using currency to get new cards.
                        - **Crafting (Крафт)**: Players can craft a random card of a higher rarity by using 5 duplicate cards of a lower rarity.
                        - **Battle Arena (Бой)**: A PvP mode where players build a deck of 5 cards to fight an opponent.
                        - **Fixer Contracts (Контракты)**: A PvE raid mode where players use a team of attack cards to defeat enemies in different districts (Watson, Pacifica, City Center) to earn rewards. Defeated cards go on cooldown.
                        - **Currencies**:
                            - **Eddies**: Main currency, earned from raids, battles, and selling cards. Used to buy cards on the marketplace.
                            - **Lust Gems**: Premium currency, used to buy premium chests and packs.
                            - **Data Chips**: Earned from raids. Can be used to buy boosts in raids.
                        - **Marketplace (Рынок)**: Players can buy and sell cards from each other using Eddies.`,
                    },
                });
                setMessages([{ sender: 'ai', text: 'Чем могу помочь, чумба?' }]);
            } catch (error) {
                console.error("Failed to initialize AI Assistant:", error);
                setMessages([{ sender: 'ai', text: 'Ошибка инициализации. Проверьте API ключ.' }]);
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            initializeChat();
        }
    }, [isOpen, initializeChat]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        // Add a placeholder for the AI's response
        setMessages(prev => [...prev, { sender: 'ai', text: '...' }]);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: userInput });

            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'ai', text: fullResponse + '...' };
                    return newMessages;
                });
            }
            // Final update to remove the ellipsis
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { sender: 'ai', text: fullResponse };
                return newMessages;
            });

        } catch (error) {
            console.error('Gemini API error:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { sender: 'ai', text: 'Произошла ошибка при обработке вашего запроса.' };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-8 right-8 z-[90] transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-[color:var(--brand-warning)] rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 active:scale-95 transition-all"
                    aria-label="Открыть AI Помощника"
                >
                    <AiAssistantIcon className="w-8 h-8" />
                </button>
            </div>
            <div className={`fixed bottom-8 right-8 z-[90] bg-[color:var(--brand-panel)] border-2 border-[color:var(--brand-accent)] w-[350px] h-[500px] flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <header className="flex items-center justify-between p-3 bg-black/30 border-b-2 border-[color:var(--brand-accent)]/50">
                    <h3 className="font-heading text-xl text-[color:var(--brand-accent)]">AI Помощник</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-[color:var(--brand-accent)] text-black' : 'bg-gray-700 text-white'}`}>
                                <p className="text-sm font-semibold whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t-2 border-[color:var(--brand-accent)]/50 flex items-center space-x-2 bg-black/30">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Спросите что-нибудь..."
                        disabled={isLoading}
                        className="flex-grow bg-gray-800 border border-[color:var(--brand-accent)]/50 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-accent)] transition disabled:opacity-50"
                    />
                    <button type="submit" disabled={isLoading} className="bg-[color:var(--brand-accent)] text-black p-2.5 flex items-center justify-center transform active:scale-95 transition hover:bg-[color:var(--brand-warning)] disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </>
    );
};

export default AiAssistant;
