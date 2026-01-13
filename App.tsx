
import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatSession, Attachment } from './types';
import { sendMessageToGemini, generateQuizzes, generateFlashcards, generateRoadmap } from './services/geminiService';
import ChatInput from './components/ChatInput';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizCard from './components/QuizCard';
import RoadmapRenderer from './components/RoadmapRenderer';
import FlashcardRenderer from './components/FlashcardRenderer';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingTools, setIsProcessingTools] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Persistence: Hydrate state from localStorage on mount.
  useEffect(() => {
    const saved = localStorage.getItem('dsa_tutor_free_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch (e) {
        console.error("Storage corruption:", e);
      }
    }
  }, []);

  // Sync: Keep storage updated as sessions change.
  useEffect(() => {
    localStorage.setItem('dsa_tutor_free_v3', JSON.stringify(sessions));
  }, [sessions]);

  // UX: Auto-scroll to latest message.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [sessions, currentSessionId, isLoading, isProcessingTools]);

  const handleSendMessage = async (content: string, attachment?: Attachment) => {
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      const id = Date.now().toString();
      const newSession: ChatSession = {
        id,
        title: content.substring(0, 30) || 'Problem Breakdown',
        messages: [],
        lastUpdated: Date.now()
      };
      setSessions([newSession, ...sessions]);
      activeSessionId = id;
      setCurrentSessionId(activeSessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      attachment
    };

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, userMsg], lastUpdated: Date.now() } 
        : s
    ));

    setIsLoading(true);

    try {
      const currentSession = sessions.find(s => s.id === activeSessionId);
      const updatedMessages = [...(currentSession?.messages || []), userMsg];
      const reply = await sendMessageToGemini(updatedMessages, attachment);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, assistantMsg], lastUpdated: Date.now() } 
          : s
      ));
    } catch (error: any) {
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAITools = async (msgId: string, type: 'quiz' | 'flashcard' | 'roadmap') => {
    const session = sessions.find(s => s.id === currentSessionId);
    const msg = session?.messages.find(m => m.id === msgId);
    if (!msg) return;

    setIsProcessingTools(true);
    try {
      if (type === 'quiz') {
        const quizzes = await generateQuizzes(msg.content);
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
          ...s,
          messages: s.messages.map(m => m.id === msgId ? { ...m, quizzes } : m)
        } : s));
      } else if (type === 'flashcard') {
        const flashcards = await generateFlashcards(msg.content);
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
          ...s,
          messages: s.messages.map(m => m.id === msgId ? { ...m, flashcards } : m)
        } : s));
      } else if (type === 'roadmap') {
        const roadmap = await generateRoadmap(msg.content.substring(0, 50));
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
          ...s,
          messages: s.messages.map(m => m.id === msgId ? { ...m, roadmap } : m)
        } : s));
      }
    } catch (error) {
      console.error("Tool Generation Error:", error);
    } finally {
      setIsProcessingTools(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen w-full bg-[#08080a] text-[#f0f0f5] overflow-hidden relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR: Knowledge Base Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 md:w-80 bg-[#0f0f14] border-r border-white/5 p-6 shrink-0 z-50 
        transform transition-transform duration-300 md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 font-extrabold text-xl tracking-tighter text-white">
            <div className="w-8 h-8 bg-[#ff3366] rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-terminal text-white text-xs"></i>
            </div>
            <span>DSA Master</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><i className="fas fa-times text-xl"></i></button>
        </div>

        <button 
          onClick={() => {
            const id = Date.now().toString();
            setSessions([{ id, title: 'New Analysis', messages: [], lastUpdated: Date.now() }, ...sessions]);
            setCurrentSessionId(id);
            setIsSidebarOpen(false);
          }}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ff3366] hover:bg-[#ff1a53] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all mb-8 shadow-lg shadow-[#ff3366]/20 active:scale-[0.98]"
        >
          <i className="fas fa-plus"></i> Start New Analysis
        </button>

        <div className="text-[9px] uppercase text-gray-600 font-black mb-4 tracking-[0.3em] px-2 opacity-50">Archive</div>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
              className={`w-full text-left p-3.5 rounded-xl text-[11px] truncate transition-all border ${
                currentSessionId === s.id 
                ? 'bg-[#ff3366]/10 border-[#ff3366]/30 text-[#ff3366] font-bold shadow-xl shadow-[#ff3366]/5' 
                : 'bg-transparent border-transparent text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'
              }`}
            >
              <i className={`fas fa-code-branch mr-2.5 text-[10px] ${currentSessionId === s.id ? 'text-[#ff3366]' : 'text-gray-800'}`}></i>
              {s.title}
            </button>
          ))}
        </div>

        <button 
          onClick={() => { if(confirm("Delete all history?")) { setSessions([]); setCurrentSessionId(null); localStorage.removeItem('dsa_tutor_free_v3'); }}}
          className="mt-4 p-3 text-[9px] text-gray-700 hover:text-red-500 transition-colors uppercase font-black tracking-widest flex items-center gap-2"
        >
          <i className="fas fa-trash-alt"></i> Wipe Database
        </button>
      </aside>

      {/* MAIN: Chat Interface */}
      <main className="flex-1 flex flex-col relative bg-[#08080a] min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0f0f14]/80 backdrop-blur-lg sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5"><i className="fas fa-bars"></i></button>
          <span className="font-bold text-sm tracking-tighter">DSA Master Mentor</span>
          <div className="w-9"></div>
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 md:px-12 pt-10 pb-10 custom-scrollbar w-full">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-12">
            {!currentSessionId || currentSession?.messages.length === 0 ? (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ff3366] to-[#ff1a53] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#ff3366]/20 rotate-3">
                    <i className="fas fa-brain text-white text-4xl"></i>
                </div>
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                      Master <span className="text-[#ff3366]">DSA</span> Mentor.
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">Solve complex problems from LeetCode, GFG, and Codeforces with full intuition, dry runs, and optimized solutions.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Sliding Window Pattern", "LRU Cache Design", "Graph Cycle Detection"].map(tag => (
                    <button key={tag} onClick={() => handleSendMessage(`Masterclass on ${tag}`)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-500 hover:border-[#ff3366]/50 hover:text-white hover:bg-[#ff3366]/5 transition-all uppercase tracking-widest">{tag}</button>
                  ))}
                </div>
              </div>
            ) : (
              currentSession.messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`
                    w-full sm:max-w-[90%] md:max-w-[85%] p-6 md:p-8 rounded-3xl text-sm md:text-[15px] leading-[1.8]
                    ${msg.role === 'user' ? 'bg-gradient-to-br from-[#ff3366] to-[#ff1a53] text-white shadow-2xl shadow-[#ff3366]/10 font-medium' : 'bg-[#121217] border border-white/5 text-gray-200'}
                  `}>
                    <MarkdownRenderer content={msg.content} />

                    {/* AI TOOLS: Conditional Rendering */}
                    {msg.role === 'assistant' && (
                      <div className="mt-10 flex flex-wrap gap-3 pt-6 border-t border-white/5">
                        <button disabled={isProcessingTools} onClick={() => generateAITools(msg.id, 'quiz')} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-[#ff3366]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff3366] transition-all border border-[#ff3366]/20 disabled:opacity-30"><i className="fas fa-terminal"></i> PRACTICE QUIZ</button>
                        <button disabled={isProcessingTools} onClick={() => generateAITools(msg.id, 'flashcard')} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-blue-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all border border-blue-400/20 disabled:opacity-30"><i className="fas fa-layer-group"></i> ACTIVE RECALL</button>
                        <button disabled={isProcessingTools} onClick={() => generateAITools(msg.id, 'roadmap')} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-green-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-green-400 transition-all border border-green-400/20 disabled:opacity-30"><i className="fas fa-route"></i> STUDY PATH</button>
                      </div>
                    )}

                    {msg.quizzes && (
                      <div className="space-y-5 mt-6">
                        {msg.quizzes.map((q, idx) => (
                          <QuizCard key={idx} quiz={q} />
                        ))}
                      </div>
                    )}

                    {msg.flashcards && <FlashcardRenderer flashcards={msg.flashcards} />}
                    
                    {msg.roadmap && <RoadmapRenderer roadmap={msg.roadmap} />}
                  </div>
                  <div className="mt-3 text-[8px] text-gray-800 uppercase tracking-[0.2em] font-black px-4">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))
            )}

            {/* STATUS INDICATORS */}
            {isLoading && (
              <div className="flex items-center gap-4 px-6 py-4 bg-[#121217] border border-white/10 rounded-2xl self-start shadow-2xl animate-in slide-in-from-left-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#ff3366] rounded-full animate-bounce [animation-duration:0.8s]"></div>
                  <div className="w-2 h-2 bg-[#ff3366] rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.8s]"></div>
                  <div className="w-2 h-2 bg-[#ff3366] rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.8s]"></div>
                </div>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Processing Logic...</span>
              </div>
            )}

            {isProcessingTools && (
              <div className="flex items-center gap-4 px-6 py-4 bg-[#0a0a0f] border border-white/5 rounded-2xl self-start shadow-2xl animate-pulse">
                 <i className="fas fa-magic text-[#ff3366] text-xs"></i>
                 <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Synthesizing Interactive Tools...</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-[#08080a] border-t border-white/5 pb-6">
          <div className="max-w-3xl mx-auto w-full px-4 md:px-0">
            <ChatInput onSend={handleSendMessage} disabled={isLoading || isProcessingTools} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
