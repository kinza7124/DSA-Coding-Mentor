
import React from 'react';
import { RoadmapStep } from '../types';

interface RoadmapRendererProps {
  roadmap: RoadmapStep[];
}

const RoadmapRenderer: React.FC<RoadmapRendererProps> = ({ roadmap }) => {
  return (
    <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-px before:bg-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {roadmap.map((step, idx) => (
        <div key={idx} className="relative pl-10 group">
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#121217] border border-white/10 flex items-center justify-center z-10 group-hover:border-[#ff3366] transition-colors">
            <span className="text-[10px] font-black text-[#ff3366]">{idx + 1}</span>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group-hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h4 className="text-sm font-bold text-white leading-tight">{step.title}</h4>
              <span className="shrink-0 px-2 py-0.5 bg-[#ff3366]/10 text-[#ff3366] text-[8px] font-black uppercase rounded-full border border-[#ff3366]/20">
                {step.estimatedTime}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoadmapRenderer;
