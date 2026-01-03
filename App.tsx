import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import PromptBuilder from './components/PromptBuilder';
import AdminPanel from './components/AdminPanel';
import PricingPage from './components/PricingPage';
import LoginPage from './components/LoginPage';
import { AppMode, User, Project, AppConfig } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentMode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Restore session
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    setConfig(storageService.getConfig());
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setMode(AppMode.CHAT); 
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setMode(AppMode.LOGIN);
    setCurrentProject(null);
  };

  const handleLoadProject = (project: Project) => {
    setCurrentProject(project);
    setMode(project.mode);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    setCurrentProject(null);
    if (currentMode === AppMode.ADMIN || currentMode === AppMode.PRICING) {
        setMode(AppMode.CHAT);
    }
  };

  if (isLoading) return <div className="h-screen w-screen bg-gray-950 flex items-center justify-center text-gray-500">Yükleniyor...</div>;

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.PROMPT:
        return <PromptBuilder user={currentUser} />;
      case AppMode.ADMIN:
        return currentUser.isAdmin ? <AdminPanel /> : <div className="p-8 text-red-500">Yetkisiz Erişim</div>;
      case AppMode.PRICING:
        return <PricingPage onBack={() => setMode(AppMode.CHAT)} />;
      default:
        return (
          <ChatInterface 
            mode={currentMode} 
            user={currentUser} 
            initialProject={currentProject}
            onUpdateUser={() => setCurrentUser(storageService.getCurrentUser())} // To refresh usage stats
            adConfig={config?.adConfig}
          />
        );
    }
  };

  const showAds = config?.adConfig.isEnabled && currentUser.plan !== 'PREMIUM';

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* COLUMN 1: LEFT ADS (Visible on Mobile now per request) */}
      <div className={`flex flex-col w-[60px] lg:w-[280px] bg-gray-900 border-r border-gray-800 overflow-y-auto custom-scrollbar flex-shrink-0 transition-all duration-300 ${!showAds ? 'hidden' : ''}`}>
        <div className="p-1 lg:p-3 text-[10px] lg:text-xs text-center text-gray-500 font-mono border-b border-gray-800 bg-gray-950 truncate">
          <span className="hidden lg:inline">SOL PANEL</span>
          <span className="lg:hidden">REKLAM</span>
        </div>
        <div className="flex flex-col gap-4 p-1 lg:p-4 items-center">
          {showAds && config?.adConfig.leftAdSlots.map((slot, index) => (
             <div key={index} className="w-full lg:w-full overflow-hidden rounded-lg bg-gray-950 shadow-sm border border-gray-800/50 relative group">
               {/* Desktop View */}
               <div className="hidden lg:block" dangerouslySetInnerHTML={{ __html: slot }} />
               
               {/* Mobile View: Scaled Down Preview of the Ad Content */}
               <div className="lg:hidden w-[50px] h-[50px] relative overflow-hidden bg-gray-800 rounded mx-auto flex items-center justify-center">
                  <div 
                    className="absolute top-0 left-0 origin-top-left transform scale-[0.20] w-[250px] h-[250px] pointer-events-none opacity-80"
                    dangerouslySetInnerHTML={{ __html: slot }} 
                  />
                  {/* Overlay to indicate it's an ad but allow interaction if needed (though scaled) */}
                  <div className="absolute inset-0 z-10 bg-black/10"></div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* COLUMN 2: MAIN CONTENT */}
      <main className="flex-1 h-full overflow-hidden relative flex flex-col pb-16 min-w-0">
        
        {/* Mobile/Desktop Header */}
        <div className="flex items-center justify-between p-2 lg:p-3 border-b border-gray-800 bg-gray-900 z-10 shadow-md">
           <div className="flex items-center gap-2 lg:gap-3">
              {/* ADMIN ACCESS BUTTON (Mobile/Desktop) */}
              {currentUser.isAdmin && (
                <button 
                  onClick={() => setMode(AppMode.ADMIN)} 
                  className={`p-1.5 lg:p-2 rounded-lg transition-colors ${currentMode === AppMode.ADMIN ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  title="Admin Paneli"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}

              <h1 className="text-base lg:text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent truncate hidden sm:block">Gemini</h1>
              
              <button 
                onClick={handleNewChat} 
                className="p-1.5 bg-gray-800 hover:bg-indigo-600 rounded-full text-white border border-gray-700 hover:border-indigo-500 transition-all shadow-sm"
                title="Yeni Sohbet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
           </div>

           <div className="flex items-center space-x-2 lg:space-x-3">
             {/* PRO BUTTON */}
             {currentUser.plan !== 'PREMIUM' ? (
                <button 
                  onClick={() => setMode(AppMode.PRICING)} 
                  className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-bold shadow-lg shadow-orange-900/40 hover:scale-105 transition-transform animate-pulse"
                >
                  <span className="text-sm">👑</span>
                  <span className="hidden sm:inline">PRO OL</span>
                </button>
             ) : (
                <div className="hidden sm:flex items-center px-2 py-1 bg-gray-800 rounded-full border border-gray-700">
                   <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">PREMIUM</span>
                </div>
             )}
             
             {/* LOGOUT BUTTON (Added for Mobile) */}
             <button
               onClick={handleLogout}
               className="p-1.5 bg-red-900/20 text-red-400 rounded-full border border-red-900/30 hover:bg-red-900/50 transition-colors"
               title="Çıkış Yap"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>

             <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-gray-700" alt="Profile" />
           </div>
        </div>

        {/* Mobile: Top Ad Slot - Sticky */}
        <div className="lg:hidden sticky top-0 z-30">
          {showAds && config?.adConfig.mobileAdSlots[0] && (
            <div className="bg-gray-900 border-b border-gray-800 p-2 overflow-hidden flex justify-center shadow-lg">
               <div dangerouslySetInnerHTML={{ __html: config.adConfig.mobileAdSlots[0] }} />
            </div>
          )}
        </div>

        {/* Content Render */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
           {renderContent()}
        </div>

        {/* Mobile: Bottom Ad Slot - Sticky above nav */}
         <div className="lg:hidden relative">
          {showAds && config?.adConfig.mobileAdSlots[2] && (
            <div className="bg-gray-900 border-t border-gray-800 p-1 overflow-hidden flex justify-center z-40 absolute bottom-0 left-0 right-0">
               <div dangerouslySetInnerHTML={{ __html: config.adConfig.mobileAdSlots[2] }} />
            </div>
          )}
        </div>

        {/* GLOBAL BOTTOM NAVIGATION (Visible on Mobile AND Web) */}
        <div className="fixed bottom-0 left-[60px] right-[60px] lg:left-[280px] lg:right-[280px] w-auto bg-gray-900 border-t border-gray-800 grid grid-cols-4 h-16 z-50 shadow-2xl">
           <button 
             onClick={() => setMode(AppMode.BOOK)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-gray-800/50 transition-colors ${currentMode === AppMode.BOOK ? 'text-indigo-400' : 'text-gray-500'}`}
           >
             <span className="text-xl">📚</span>
             <span className="text-[10px] font-medium">Roman</span>
           </button>
           
           <button 
             onClick={() => setMode(AppMode.SCRIPT)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-gray-800/50 transition-colors ${currentMode === AppMode.SCRIPT ? 'text-indigo-400' : 'text-gray-500'}`}
           >
             <span className="text-xl">🎬</span>
             <span className="text-[10px] font-medium">Senaryo</span>
           </button>
           
           <button 
             onClick={() => setMode(AppMode.PROMPT)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-gray-800/50 transition-colors ${currentMode === AppMode.PROMPT ? 'text-indigo-400' : 'text-gray-500'}`}
           >
             <span className="text-xl">🪄</span>
             <span className="text-[10px] font-medium">Prompt</span>
           </button>
           
           <button 
             onClick={() => setShowHistory(true)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-gray-800/50 transition-colors text-gray-500`}
           >
             <span className="text-xl">🗂️</span>
             <span className="text-[10px] font-medium">Arşiv</span>
           </button>
        </div>

        {/* History Modal (Global) */}
        {showHistory && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-end md:items-center justify-center md:p-10">
            <div className="w-full md:max-w-md bg-gray-900 rounded-t-2xl md:rounded-2xl max-h-[70vh] flex flex-col border border-gray-800 animate-in slide-in-from-bottom duration-300 shadow-2xl">
               <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-white">Geçmiş Projeler</h3>
                 <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">Kapat</button>
               </div>
               <div className="p-2 overflow-y-auto custom-scrollbar">
                 {storageService.getProjects(currentUser.id).length === 0 ? (
                   <p className="p-4 text-center text-gray-500 text-sm">Kayıtlı proje yok.</p>
                 ) : (
                   storageService.getProjects(currentUser.id).map(p => (
                     <button
                       key={p.id}
                       onClick={() => handleLoadProject(p)}
                       className="w-full text-left p-3 rounded-lg hover:bg-gray-800 border-b border-gray-800 last:border-0 flex items-center space-x-3 transition-colors"
                     >
                       <span className="text-lg">{p.mode === 'BOOK' ? '📚' : p.mode === 'SCRIPT' ? '🎬' : '💬'}</span>
                       <div className="overflow-hidden">
                         <div className="text-sm font-medium text-gray-200 truncate">{p.name}</div>
                         <div className="text-xs text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</div>
                       </div>
                     </button>
                   ))
                 )}
                 
                 {currentUser.isAdmin && (
                   <button 
                      onClick={() => { setMode(AppMode.ADMIN); setShowHistory(false); }}
                      className="w-full mt-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center text-sm font-bold text-gray-300 transition-colors flex items-center justify-center gap-2"
                   >
                     <span>⚙️</span> Admin Paneline Git
                   </button>
                 )}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* COLUMN 3: RIGHT ADS (Visible on Mobile now per request) */}
      <div className={`flex flex-col w-[60px] lg:w-[280px] bg-gray-900 border-l border-gray-800 overflow-y-auto custom-scrollbar flex-shrink-0 transition-all duration-300 ${!showAds ? 'hidden' : ''}`}>
        <div className="p-1 lg:p-3 text-[10px] lg:text-xs text-center text-gray-500 font-mono border-b border-gray-800 bg-gray-950 truncate">
          <span className="hidden lg:inline">SAĞ PANEL</span>
          <span className="lg:hidden">REKLAM</span>
        </div>
        <div className="flex flex-col gap-4 p-1 lg:p-4 items-center">
          {showAds && config?.adConfig.rightAdSlots.map((slot, index) => (
             <div key={index} className="w-full lg:w-full overflow-hidden rounded-lg bg-gray-950 shadow-sm border border-gray-800/50 relative">
               {/* Desktop View */}
               <div className="hidden lg:block" dangerouslySetInnerHTML={{ __html: slot }} />
               
               {/* Mobile View: Scaled Down Preview */}
               <div className="lg:hidden w-[50px] h-[50px] relative overflow-hidden bg-gray-800 rounded mx-auto flex items-center justify-center">
                  <div 
                    className="absolute top-0 left-0 origin-top-left transform scale-[0.20] w-[250px] h-[250px] pointer-events-none opacity-80"
                    dangerouslySetInnerHTML={{ __html: slot }} 
                  />
                  <div className="absolute inset-0 z-10 bg-black/10"></div>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;