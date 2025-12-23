import React from 'react';
import { CardData } from '../types';

interface CardProps {
  card: CardData;
  onClick: (card: CardData) => void;
  disabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card);
    }
  };

  return (
    <div 
      className={`relative w-full aspect-square cursor-pointer group perspective-1000`}
      onClick={handleClick}
    >
      <div 
        className={`w-full h-full duration-500 transform-style-3d transition-all ${card.isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of card (Hidden initially) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 bg-white"
        >
          <img 
            src={card.imageUrl} 
            alt={card.label} 
            className="w-full h-full object-cover p-2"
          />
        </div>

        {/* Back of card (Visible initially) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-md flex items-center justify-center border-2 border-slate-600 group-hover:from-indigo-500 group-hover:to-purple-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Card;
