import React, { useState } from 'react';
import { optimizePrompt } from '../services/geminiService';
import { User, PromptFeedback } from '../types';
import { storageService } from '../services/storageService';

interface PromptBuilderProps {
  user: User;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState('Roman Kurgusu');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<'up' | 'down' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setFeedbackRating(null); // Reset feedback on new generate
    setFeedbackComment('');
    setFeedbackSubmitted(false);
    
    try {
      const result = await optimizePrompt(input, type);
      setOutput(result);
    } catch (error) {
      console.error(error);
      setOutput("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = () => {
    if (!feedbackRating) return;

    const feedback: PromptFeedback = {
      id: 'fb_' + Date.now(),
      userId: user.id,
      originalInput: input,
      generatedPrompt: output,
      rating: feedbackRating,
      comment: feedbackComment,
      timestamp: Date.now()
    };

    storageService.saveFeedback(feedback);
    setFeedbackSubmitted(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Prompt kopyalandı!');
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">🪄 Prompt Sihirbazı</h2>
          <p className="text-gray-400">Basit fikrinizi profesyonel bir yapay zeka talimatına dönüştürün.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Input Section */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col space-y-4 shadow-lg">
            <div>
              <label className="block text-sm font-medium text-purple-400 mb-2">İçerik Türü</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              >
                <option>Roman Kurgusu</option>
                <option>Senaryo Sahnesi</option>
                <option>Karakter Profili</option>
                <option>Dünya İnşası (World Building)</option>
                <option>Kısa Hikaye</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-300 mb-2">Ham Fikriniz</label>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Örn: Dedektif bir kedi hakkında komik bir polisiye hikaye yazmak istiyorum. Olay İstanbul'da geçsin."
                className="flex-1 w-full bg-gray-950 border border-gray-700 rounded-lg p-4 text-white focus:border-purple-500 focus:outline-none resize-none placeholder-gray-600"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3 rounded-lg font-bold transition-all shadow-md"
            >
              {isLoading ? 'Sihir Yapılıyor...' : 'Gelişmiş Prompt Oluştur ✨'}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col shadow-lg relative">
            <label className="block text-sm font-medium text-green-400 mb-2">Optimize Edilmiş Prompt</label>
            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap overflow-y-auto font-mono leading-relaxed max-h-[400px]">
              {output || <span className="text-gray-600 italic">Oluşturulan prompt burada görünecek...</span>}
            </div>
            
            {output && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-6 right-6 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white border border-gray-700 transition-colors"
                  title="Kopyala"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Feedback Section */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  {!feedbackSubmitted ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-gray-500">Bu sonuç faydalı oldu mu?</span>
                         <div className="flex space-x-2">
                           <button 
                             onClick={() => setFeedbackRating('up')}
                             className={`p-2 rounded-full transition-colors ${feedbackRating === 'up' ? 'bg-green-900/50 text-green-400 ring-1 ring-green-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                           >
                             👍
                           </button>
                           <button 
                             onClick={() => setFeedbackRating('down')}
                             className={`p-2 rounded-full transition-colors ${feedbackRating === 'down' ? 'bg-red-900/50 text-red-400 ring-1 ring-red-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                           >
                             👎
                           </button>
                         </div>
                      </div>

                      {feedbackRating && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                           <textarea 
                             value={feedbackComment}
                             onChange={(e) => setFeedbackComment(e.target.value)}
                             placeholder="Görüşlerinizi ekleyin (isteğe bağlı)..."
                             className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-white resize-none h-20 mb-2 focus:border-indigo-500 focus:outline-none"
                           />
                           <button 
                             onClick={submitFeedback}
                             className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg font-medium transition-colors"
                           >
                             Geri Bildirim Gönder
                           </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 animate-in zoom-in duration-300">
                      <span className="text-green-400 text-sm font-medium">Teşekkürler! Geri bildiriminiz alındı. 🎉</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptBuilder;