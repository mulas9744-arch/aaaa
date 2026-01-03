import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Message, User, Project, AdConfig } from '../types';
import { createChatSession } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { GenerateContentResponse } from '@google/genai';
import { jsPDF } from "jspdf";

interface ChatInterfaceProps {
  mode: AppMode;
  user: User;
  initialProject: Project | null;
  onUpdateUser: () => void;
  adConfig?: AdConfig; // Added prop
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode, user, initialProject, onUpdateUser, adConfig }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or Switch Project
  useEffect(() => {
    if (initialProject) {
      setMessages(initialProject.messages);
      setCurrentProjectId(initialProject.id);
    } else {
      setMessages([]);
      setCurrentProjectId(null); // Will create new on first send
    }
  }, [initialProject, mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const saveToProject = (msgs: Message[]) => {
    if (!currentProjectId) {
      // First message, create new project
      const firstUserMsg = msgs.find(m => m.role === 'user');
      const title = firstUserMsg ? (firstUserMsg.text.substring(0, 30) + '...') : 'Yeni Proje';
      const newProject = storageService.createProject(user.id, mode, title);
      
      newProject.messages = msgs;
      storageService.saveProject(newProject);
      setCurrentProjectId(newProject.id);
    } else {
      // Update existing
      const project = storageService.getProjects(user.id).find(p => p.id === currentProjectId);
      if (project) {
        project.messages = msgs;
        project.updatedAt = Date.now();
        storageService.saveProject(project);
      }
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    // Check Limits
    if (!storageService.checkAndIncrementUsage()) {
      setLimitReached(true);
      return;
    }
    onUpdateUser(); // Update UI for limits

    const userMsg: Message = { role: 'user', text: textToSend, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chat = createChatSession(mode, updatedMessages); 
      const streamResult = await chat.sendMessageStream({ message: userMsg.text });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: Date.now() }]);

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { ...newArr[newArr.length - 1], text: fullResponse };
            return newArr;
          });
        }
      }

      // Final save after generation
      saveToProject([...updatedMessages, { role: 'model', text: fullResponse, timestamp: Date.now() }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Üzgünüm, bir hata oluştu.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (messages.length === 0) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFontSize(16);
    doc.text("Gemini Yazar - Proje Çıktısı", margin, y);
    y += 15;

    messages.forEach((msg) => {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      if (msg.role === 'user') {
        doc.setTextColor(0, 0, 150);
        doc.text("Kullanıcı:", margin, y);
      } else {
        doc.setTextColor(150, 0, 0);
        doc.text("Gemini:", margin, y);
      }
      y += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0);
      
      const textLines = doc.splitTextToSize(msg.text, maxLineWidth);
      if (y + (textLines.length * 5) > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(textLines, margin, y);
      y += (textLines.length * 5) + 8;
    });

    doc.save(`project_${currentProjectId || 'draft'}.pdf`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showMobileInlineAd = user.plan !== 'PREMIUM' && adConfig?.isEnabled && adConfig.mobileAdSlots[1];

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Limit Modal */}
      {limitReached && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-4">🛑</div>
            <h3 className="text-xl font-bold text-white mb-2">Günlük Limit Doldu</h3>
            <p className="text-gray-400 mb-6">Ücretsiz plan limitinize ulaştınız. Devam etmek için yarına kadar bekleyin veya Premium'a geçin.</p>
            <button 
              onClick={() => setLimitReached(false)} // Usually this would redirect to pricing
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold"
            >
              Premium'a Yükselt
            </button>
            <button onClick={() => setLimitReached(false)} className="mt-4 text-sm text-gray-500 hover:text-white">Kapat</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex justify-between items-center">
        <div>
          <h2 className="text-sm md:text-lg font-semibold text-gray-200 truncate max-w-[200px] md:max-w-none">
            {currentProjectId ? '📝 Kayıtlı Proje' : (
               mode === AppMode.BOOK ? '📚 Roman Yazarı' : 
               mode === AppMode.SCRIPT ? '🎬 Senaryo Yazarı' : '🧠 Asistan'
            )}
          </h2>
          <p className="hidden md:block text-xs text-gray-400">
             {currentProjectId ? 'Otomatik kaydediliyor' : 'Yeni bir şaheser yaratmaya başla'}
          </p>
        </div>
        {messages.length > 0 && user.plan === 'PREMIUM' && (
          <button 
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm border border-gray-700 transition-colors flex items-center space-x-2"
          >
            <span>PDF İndir</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
             <div className="text-5xl mb-4 opacity-30">✍️</div>
             <p className="text-lg text-gray-400">Yazmaya Başla</p>
             <p className="text-sm text-gray-600 max-w-sm mt-2">
               Bu bir {mode === AppMode.BOOK ? 'Roman' : mode === AppMode.SCRIPT ? 'Senaryo' : 'Sohbet'} projesidir.
               İlk mesajınızla birlikte proje otomatik olarak kaydedilecektir.
             </p>
           </div>
        )}

        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-5 shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-purple-700 text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-serif text-sm md:text-[15px]">
                  {msg.text || (isLoading && idx === messages.length - 1 ? <span className="animate-pulse">...</span> : '')}
                </div>
              </div>
            </div>
            
            {/* Inline Mobile Ad Injection after 3rd message */}
            {idx === 2 && showMobileInlineAd && (
              <div className="lg:hidden w-full my-4 flex justify-center">
                 <div className="max-w-xs w-full bg-gray-900/80 border border-gray-800 rounded-lg p-2 overflow-hidden shadow-sm">
                   <div dangerouslySetInnerHTML={{ __html: adConfig!.mobileAdSlots[1] }} />
                 </div>
              </div>
            )}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-end gap-2 max-w-4xl mx-auto bg-gray-800 p-2 rounded-xl border border-gray-700 focus-within:border-purple-500/50 transition-colors shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hikayenizi yazın..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 p-2 focus:outline-none resize-none max-h-32 min-h-[44px] font-sans text-sm md:text-base"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors mb-0.5 shadow-md flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;