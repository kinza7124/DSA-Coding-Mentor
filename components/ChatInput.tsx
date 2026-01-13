
import React, { useState, useRef, useEffect } from 'react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSend: (message: string, attachment?: Attachment) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || attachment) && !disabled) {
      onSend(input.trim() || "Analyze this code.", attachment || undefined);
      setInput('');
      setAttachment(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setAttachment({
        mimeType: file.type,
        data: base64,
        type: file.type.startsWith('video') ? 'video' : (file.type === 'application/pdf' ? 'pdf' : 'image')
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full pt-4">
      {attachment && (
        <div className="mb-2 p-2 bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-xl flex items-center justify-between text-[10px] text-[#ff3366] font-bold uppercase animate-in slide-in-from-bottom-2">
          <span className="flex items-center gap-2"><i className="fas fa-file-code"></i> ATTACHED {attachment.type}</span>
          <button onClick={() => setAttachment(null)} className="hover:text-white transition-colors"><i className="fas fa-times"></i></button>
        </div>
      )}
      <div className={`
        flex items-end gap-2 p-2 bg-[#121217] border rounded-2xl transition-all shadow-xl
        ${disabled ? 'opacity-50 border-white/5' : 'border-white/10 focus-within:border-[#ff3366] focus-within:ring-1 focus-within:ring-[#ff3366]/10'}
      `}>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          disabled={disabled}
        >
          <i className="fas fa-paperclip text-sm"></i>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*,video/*,application/pdf" />
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask anything about DSA..."
          rows={1}
          className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none max-h-32 py-2.5 text-sm outline-none placeholder-gray-400 font-medium"
          disabled={disabled}
        />
        
        <button
          onClick={handleSend}
          disabled={(!input.trim() && !attachment) || disabled}
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0
            ${(!input.trim() && !attachment) || disabled 
              ? 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5' 
              : 'bg-[#ff3366] text-white shadow-lg active:scale-95 border border-[#ff3366]/20'}
          `}
        >
          {disabled ? <i className="fas fa-circle-notch animate-spin text-sm"></i> : <i className="fas fa-arrow-up text-sm"></i>}
        </button>
      </div>
      <p className="mt-3 text-[7px] text-gray-800 text-center uppercase tracking-[0.3em] font-black">AI MENTOR • PRODUCTION READY V1.0</p>
    </div>
  );
};

export default ChatInput;
