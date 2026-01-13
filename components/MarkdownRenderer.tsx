
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const cleanText = (text: string) => text.replace(/\$/g, '');

  const highlightCode = (line: string) => {
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Enhanced C++ Token Regex
    const tokenRegex = /(?:\/\/.*)|(?:"[^"]*")|\b(int|float|double|char|bool|void|string|long|vector|map|set|stack|queue|priority_queue|unordered_map|unordered_set|auto|size_t|pair|std|ListNode|Node|TreeNode|ListNode\*|Node\*|struct|class|public|private|protected|virtual|override|friend|template|typename|using|namespace|static|const|constexpr|inline|explicit|noexcept)\b|\b(if|else|for|while|do|return|switch|case|break|continue|new|delete|try|catch|throw)\b|\b(true|false|NULL|nullptr|\d+)\b|(#include|#define|#ifndef|#endif|#pragma|#include\s+&lt;[^&]*&gt;)/g;

    const highlighted = escaped.replace(tokenRegex, (match, type, keyword, literal, preproc) => {
      if (match.startsWith('//')) return `<span class="hl-comment">${match}</span>`;
      if (match.startsWith('"')) return `<span class="hl-string">${match}</span>`;
      if (preproc) return `<span class="hl-preproc">${match}</span>`;
      if (type) return `<span class="hl-type">${match}</span>`;
      if (keyword) return `<span class="hl-keyword">${match}</span>`;
      if (literal) return `<span class="hl-literal">${match}</span>`;
      return match;
    });

    return <span dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />;
  };

  const renderTable = (tableLines: string[]) => {
    const dataRows = tableLines.filter(row => !row.match(/^\|?\s*:?-+:?\s*\|/));
    if (dataRows.length < 1) return null;

    const headers = dataRows[0].split('|').filter(s => s.trim().length > 0).map(s => cleanText(s.trim()));
    const body = dataRows.slice(1).map(row => {
      const cells = row.split('|');
      const startIndex = row.trim().startsWith('|') ? 1 : 0;
      return cells.slice(startIndex, startIndex + headers.length).map(s => cleanText(s.trim()));
    });

    return (
      <div className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-black/30 shadow-2xl">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {headers.map((h, i) => (
                <th key={i} className="p-4 text-[10px] font-black uppercase tracking-widest text-[#ff3366]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                {row.map((cell, j) => (
                  <td key={j} className="p-4 text-xs md:text-sm text-gray-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        const lang = match?.[1] || 'code';
        const code = (match?.[2] || '').trim();
        
        return (
          <div key={index} className="my-8 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0f] shadow-2xl group">
            <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{lang}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)} 
                className="text-[10px] font-bold text-gray-600 hover:text-white transition-all flex items-center gap-1.5"
              >
                <i className="far fa-copy"></i> COPY
              </button>
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed bg-black/20 custom-scrollbar">
              <pre><code>{code.split('\n').map((line, i) => (<div key={i} className="whitespace-pre">{highlightCode(line)}</div>))}</code></pre>
            </div>
          </div>
        );
      } else {
        const lines = part.split('\n');
        const elements: React.ReactNode[] = [];
        let tableBuffer: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim().startsWith('|')) {
            tableBuffer.push(line);
          } else {
            if (tableBuffer.length > 0) {
              elements.push(renderTable(tableBuffer));
              tableBuffer = [];
            }
            if (line.trim() === '') continue;

            let processed = cleanText(line)
              .replace(/^(#{1,6})\s+(.*)/, '**$2**') 
              .replace(/\*\*(.*?)\*\*/g, (m, g1) => {
                if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                    return `<span class="block mt-8 mb-4 text-[#ff3366] text-xs font-black uppercase tracking-[0.2em] border-l-2 border-[#ff3366] pl-3">${g1}</span>`;
                }
                return `<strong class="text-white font-black">${g1}</strong>`;
              })
              .replace(/`(.*?)`/g, '<code class="bg-[#ff3366]/10 text-[#ff3366] px-1.5 py-0.5 rounded text-[0.8em] font-mono border border-[#ff3366]/20">$1</code>')
              .replace(/^\*\s(.*)/, '<li class="list-none flex gap-3 mb-2"><span class="text-[#ff3366] mt-1.5">•</span><span>$1</span></li>');

            elements.push(<div key={i} className="mb-4 text-gray-300 leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{ __html: processed }} />);
          }
        }
        if (tableBuffer.length > 0) elements.push(renderTable(tableBuffer));
        return <div key={index} className="flex flex-col">{elements}</div>;
      }
    });
  };

  return <div className="w-full max-w-full overflow-hidden">{parseContent(content)}</div>;
};

export default MarkdownRenderer;
