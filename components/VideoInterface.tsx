import React, { useState } from 'react';
import { generateVideo, openKeySelection } from '../services/geminiService';
import { VideoGenerationState } from '../types';

const VideoInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<VideoGenerationState>({ status: 'idle' });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState({ status: 'generating' });

    try {
      const videoUri = await generateVideo(prompt);
      
      const fetchResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
      const blob = await fetchResponse.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      setState({ status: 'completed', videoUri: objectUrl });
    } catch (error: any) {
      console.error(error);
      if (error.message === 'API_KEY_MISSING' || error.message?.includes('Requested entity was not found')) {
        setState({ status: 'checking_key', error: "Devam etmek için bir faturalı proje API anahtarı seçmelisiniz." });
      } else {
        setState({ status: 'error', error: "Video oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." });
      }
    }
  };

  const handleKeySelection = async () => {
    await openKeySelection();
    setState({ status: 'idle', error: undefined });
  };

  const suggestions = [
    "Cyberpunk şehrinde yağmurlu gece, neon tabelalar, 4k",
    "Uzayda süzülen astronot, sinematik ışıklandırma",
    "Ormanda koşan bir kurt, drone çekimi",
    "Su altında antik şehir kalıntıları, detaylı",
    "Fütüristik bir laboratuvarda çalışan robot"
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950 p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">🎥 Video Oluşturucu</h2>
          <p className="text-gray-400">Veo modeli ile hayalinizdeki sahneyi kısa videoya dönüştürün.</p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <label className="block text-sm font-medium text-gray-300 mb-2">Video İstemi (Prompt)</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örnek: Neon ışıkları altında hızla giden fütüristik bir araba, sinematik, 4k..."
            className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-32 resize-none placeholder-gray-600"
          />
          
          <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
               <div className="text-xs text-gray-500 mb-2">Örnekleri Dene:</div>
               <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded-full border border-gray-700 transition-colors"
                  >
                    {s.substring(0, 30)}...
                  </button>
                ))}
               </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.status === 'generating' || state.status === 'polling' || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center space-x-2 shadow-lg shadow-blue-900/20 whitespace-nowrap"
            >
              {(state.status === 'generating' || state.status === 'polling') ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>Oluşturuluyor...</span>
                 </>
              ) : (
                <>
                  <span>Oluştur</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error / Key Selection State */}
        {state.status === 'checking_key' && (
           <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6 text-center animate-pulse">
             <h3 className="text-yellow-500 font-semibold mb-2">API Anahtarı Gerekli</h3>
             <p className="text-yellow-200/70 text-sm mb-4">
               Veo modellerini kullanmak için faturalandırılabilir bir Google Cloud projesine bağlı bir API anahtarı seçmeniz gerekmektedir.
             </p>
             <button 
               onClick={handleKeySelection}
               className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md"
             >
               Anahtar Seç / Değiştir
             </button>
             <div className="mt-4">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-yellow-500/50 underline hover:text-yellow-500">
                  Faturalandırma hakkında bilgi
                </a>
             </div>
           </div>
        )}

        {/* Error Display */}
        {state.status === 'error' && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400 text-center">
            {state.error}
          </div>
        )}

        {/* Result Display */}
        {state.status === 'completed' && state.videoUri && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-xl font-semibold text-white pl-1">Sonuç</h3>
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-800">
              <video controls autoPlay loop className="w-full h-full object-contain">
                <source src={state.videoUri} type="video/mp4" />
                Tarayıcınız video etiketini desteklemiyor.
              </video>
            </div>
            <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
              <span className="text-sm text-gray-500">Video başarıyla oluşturuldu.</span>
              <a 
                href={state.videoUri} 
                download="gemini-veo-video.mp4"
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors border border-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>MP4 İndir</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoInterface;