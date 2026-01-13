
import React, { useState } from 'react';
import { QuizItem } from '../types';

interface QuizCardProps {
  quiz: QuizItem;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // Prevent changing answer
    setSelected(idx);
    setShowExplanation(true);
  };

  return (
    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner mt-4 animate-in zoom-in-95 duration-200">
      <p className="font-bold text-white mb-4 text-sm leading-relaxed">{quiz.question}</p>
      <div className="grid gap-2">
        {quiz.options.map((opt, idx) => {
          const isCorrect = idx === quiz.correctAnswer;
          const isSelected = idx === selected;
          
          let buttonClass = "w-full text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center ";
          if (selected === null) {
            buttonClass += "bg-white/5 border-white/5 hover:border-[#ff3366]/50 text-gray-300";
          } else if (isCorrect) {
            buttonClass += "bg-green-500/10 border-green-500/50 text-green-400 font-bold";
          } else if (isSelected && !isCorrect) {
            buttonClass += "bg-red-500/10 border-red-500/50 text-red-400 font-bold";
          } else {
            buttonClass += "bg-white/5 border-white/5 opacity-40 text-gray-500";
          }

          return (
            <button 
              key={idx} 
              onClick={() => handleSelect(idx)}
              className={buttonClass}
              disabled={selected !== null}
            >
              <span>{opt}</span>
              {selected !== null && isCorrect && <i className="fas fa-check-circle text-xs"></i>}
              {selected !== null && isSelected && !isCorrect && <i className="fas fa-times-circle text-xs"></i>}
            </button>
          );
        })}
      </div>
      
      {showExplanation && (
        <div className="mt-4 p-3 bg-[#ff3366]/5 rounded-lg border border-[#ff3366]/10 animate-in fade-in slide-in-from-top-1">
          <p className="text-[10px] font-black uppercase text-[#ff3366] tracking-widest mb-1">Mentor's Note</p>
          <p className="text-xs text-gray-400 leading-relaxed">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
