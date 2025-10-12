import React, { useContext, useRef, useState } from 'react';
import { Card, Rarity } from '../types';
import { RARITY_STYLES } from '../constants';
import { StrengthIcon, HealingIcon, HealthIcon, SpecialEffectIcon, AttackRoleIcon, SupportRoleIcon } from './IconComponents';
import { ImageContext } from '../context/ImageContext';
import Tooltip from './Tooltip';

interface CardComponentProps {
  card: Card;
  count?: number;
  onClick?: () => void;
  className?: string;
  size?: 'normal' | 'small';
}

const getSpecialEffectDescription = (card: Card): string => {
    switch (card.specialEffect) {
        case 'skip_turn':
            return "Пропуск хода: Противник пропускает следующий ход.";
        case 'steal_card':
            return "Кража карты: Ворует случайную карту из руки противника.";
        case 'enhance_next_attack':
            return `Усиление атаки: Следующая ваша атакующая карта получает +${card.effectValue || 0} к Силе.`;
        case 'second_heart':
            return "Второе сердце: Если следующая атака должна вас убить, вы выживаете с 1 HP. Срабатывает один раз за бой.";
        default:
            return "Уникальный эффект";
    }
}

const CardComponent: React.FC<CardComponentProps> = ({ card, count, onClick, className, size = 'normal' }) => {
  const styles = RARITY_STYLES[card.rarity];
  const customImages = useContext(ImageContext);
  const displayImageUrl = customImages.get(card.id) || card.imageUrl;
  const isSmall = size === 'small';
  const typeIconColor = (card.rarity === Rarity.Rare || card.rarity === Rarity.Legendary) ? 'text-black' : 'text-white';

  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = -((y / height - 0.5) * 20); // Max 10 degrees rotation
    const rotateY = ((x / width - 0.5) * 20);  // Max 10 degrees rotation

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-in-out'
    });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden transition-shadow duration-300 aspect-[2/3] w-full max-w-[250px] group ${onClick ? 'cursor-pointer' : ''} ${className} ${styles.shadow}`}
      style={{ transformStyle: 'preserve-3d', ...style }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image Layer */}
      <img src={displayImageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'translateZ(-20px)' }} />
      
      {/* Vignette/Gloss Layer */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0px 0px 50px 20px rgba(0,0,0,0.7)', transform: 'translateZ(0px)' }}></div>
      
      {/* Border based on rarity */}
      <div className={`absolute inset-0 border-4 ${styles.border} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} style={{ transform: 'translateZ(10px)' }}></div>

      {/* Content Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end" style={{ transform: 'translateZ(40px)' }}>
        <h3 className={`font-black font-heading leading-tight drop-shadow-lg ${styles.text} ${styles.textShadowClass} ${isSmall ? 'text-base' : 'text-2xl'}`}>{card.name}</h3>
        <p className={`font-bold ${styles.text} opacity-80 uppercase tracking-widest ${isSmall ? 'text-[9px]' : 'text-xs'}`}>
          {card.rarity}
        </p>
        
        <div className={`border-t ${styles.border} opacity-30 my-2`}></div>

        <div className={`flex text-white font-sans ${isSmall ? 'text-xs space-x-3' : 'text-sm space-x-4'}`}>
            {card.stats.strength > 0 && 
                <Tooltip content="Сила: Величина урона, наносимого этой картой.">
                    <div className="flex items-center"><StrengthIcon className={`text-red-400 flex-shrink-0 ${isSmall ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-1.5'}`}/> {card.stats.strength}</div>
                </Tooltip>
            }
            {card.stats.healing > 0 && 
                <Tooltip content="Исцеление: Величина здоровья, восстанавливаемого этой картой.">
                    <div className="flex items-center"><HealingIcon className={`text-emerald-400 flex-shrink-0 ${isSmall ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-1.5'}`}/> {card.stats.healing}</div>
                </Tooltip>
            }
             {card.stats.hp > 0 && 
                <Tooltip content="Здоровье: Количество урона, которое карта может выдержать.">
                    <div className="flex items-center"><HealthIcon className={`text-rose-400 flex-shrink-0 ${isSmall ? 'w-4 h-4 mr-1' : 'w-5 h-5 mr-1.5'}`}/> {card.stats.hp}</div>
                </Tooltip>
            }
        </div>
      </div>
      
      {/* Icons Layer */}
      <div className={`absolute flex items-center space-x-2 ${isSmall ? 'top-2 right-2' : 'top-3 right-3'}`} style={{ transform: 'translateZ(50px)' }}>
           { card.specialEffect && 
            <Tooltip content={getSpecialEffectDescription(card)}>
                <SpecialEffectIcon className={`text-yellow-300 drop-shadow-lg ${isSmall ? 'w-4 h-4' : 'w-5 h-5'}`}/>
            </Tooltip>
           }
           <Tooltip content={`Тип карты: ${card.role === 'attack' ? 'Атака' : 'Поддержка'}`}>
                <div className={`flex items-center justify-center rounded-full ${styles.typeIconBg} ${isSmall ? 'w-5 h-5' : 'w-6 h-6'}`}>
                  {card.role === 'attack' 
                      ? <AttackRoleIcon className={`${typeIconColor} ${isSmall ? 'w-3 h-3' : 'w-4 h-4'}`} /> 
                      : <SupportRoleIcon className={`${typeIconColor} ${isSmall ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  }
                </div>
            </Tooltip>
      </div>

      {count && count > 1 && (
        <div className="absolute top-2 left-2 bg-[color:var(--brand-warning)] text-white w-8 h-8 flex items-center justify-center font-bold text-lg border-2 border-white/50" style={{ transform: 'translateZ(50px)' }}>
          x{count}
        </div>
      )}
    </div>
  );
};

export default CardComponent;