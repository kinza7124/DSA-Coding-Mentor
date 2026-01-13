
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardRendererProps {
  flashcards: Flashcard[];
}

const FlashcardRenderer: React.FC<FlashcardRendererProps> = ({ flashcards }) => {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const toggleFlip = (idx: number) => {
    setFlipped(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 opacity-50">Active Recall Cards</div>
      <div className="grid gap-3">
        {flashcards.map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => toggleFlip(idx)}
            className="cursor-pointer perspective-1000 group"
          >
            <div className={`relative transition-all duration-500 transform-style-3d ${flipped[idx] ? 'rotate-x-180' : ''}`}>
              <div className="p-5 bg-[#1a1a23] border border-white/5 rounded-2xl min-h-[100px] flex items-center justify-center text-center">
                <p className="text-sm font-medium text-gray-200">{card.front}</p>
              </div>
              <div className="absolute inset-0 p-5 bg-blue-500/10 border border-blue-400/30 rounded-2xl flex items-center justify-center text-center backface-hidden rotate-x-180">
                <p className="text-sm font-bold text-blue-400">{card.back}</p>
              </div>
            </div>
            <div className="mt-1 text-center">
               <span className="text-[8px] text-gray-700 uppercase font-black tracking-widest">{flipped[idx] ? 'Tap to hide' : 'Tap to reveal'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardRenderer;
