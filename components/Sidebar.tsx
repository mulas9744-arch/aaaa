import React, { useEffect, useState } from 'react';
import { AppMode, User, AdConfig, Project, AppConfig } from '../types';
import { storageService } from '../services/storageService';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  user: User | null;
  onLogout: () => void;
  onLoadProject: (project: Project) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, user, onLogout, onLoadProject, onNewChat }) => {
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const config = storageService.getConfig();
    setAdConfig(config.adConfig);
    setAppConfig(config);
    setLimit(config.freeDailyLimit);
    
    if (user) {
      setProjects(storageService.getProjects(user.id));
    }
  }, [user, currentMode]); // Reload projects when mode/user changes

  const navItems = [
    { mode: AppMode.BOOK, label: 'Roman', icon: '📚' },
    { mode: AppMode.SCRIPT, label: 'Senaryo', icon: '🎬' },
    { mode: AppMode.CHAT, label: 'Asistan', icon: '🧠' },
    { mode: AppMode.PROMPT, label: 'Prompt', icon: '🪄' },
  ];

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
      storageService.deleteProject(id);
      if (user) setProjects(storageService.getProjects(user.id));
    }
  }

  // Sidebar is hidden on mobile (md:flex) because we use a Bottom Nav for mobile
  return (
    <div className="hidden md:flex inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 flex-col h-full flex-shrink-0">
      
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Gemini Yazar
        </h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Yaratıcı Stüdyo</p>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 flex flex-col">
        {/* Main Nav */}
        <nav className="p-3 space-y-1">
          <button
             onClick={() => onNewChat()}
             className="w-full flex items-center justify-center space-x-2 px-4 py-3 mb-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 transition-all"
          >
            <span>+</span>
            <span>Yeni Proje Başlat</span>
          </button>

          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                currentMode === item.mode
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {user?.isAdmin && (
             <button
               onClick={() => setMode(AppMode.ADMIN)}
               className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm mt-4 text-gray-500 hover:text-white`}
             >
               <span className="text-lg">⚙️</span>
               <span className="font-medium">Admin</span>
             </button>
          )}
        </nav>

        {/* History / Projects Section */}
        <div className="px-4 py-2 mt-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Geçmiş Projeler</h3>
          <div className="space-y-1">
            {projects.length === 0 ? (
              <p className="text-xs text-gray-600 italic">Henüz kayıtlı proje yok.</p>
            ) : (
              projects.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onLoadProject(p)}
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-xs opacity-50">{p.mode === 'BOOK' ? '📚' : p.mode === 'SCRIPT' ? '🎬' : '💬'}</span>
                    <span className="text-xs truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LEFT AD SPACE (HTML) */}
        {adConfig?.isEnabled && user?.plan !== 'PREMIUM' && adConfig.leftAdSlots?.[0] && (
          <div className="px-4 py-4 mt-auto border-t border-gray-800">
             <div 
              className="text-xs text-center overflow-hidden"
              dangerouslySetInnerHTML={{ __html: adConfig.leftAdSlots[0] }}
             />
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        {user ? (
          <div className="flex flex-col space-y-3">
            {/* Limit Status Bar */}
            {user.plan !== 'PREMIUM' && (
              <div className="w-full">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Günlük Limit</span>
                  <span>{user.dailyUsage?.count || 0}/{limit}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${ (user.dailyUsage?.count || 0) >= limit ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${Math.min(((user.dailyUsage?.count || 0) / limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-700" alt="Avatar" />
                <div className="flex flex-col">
                   <span className="text-sm font-medium text-white truncate w-20">{user.name.split(' ')[0]}</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit ${user.plan === 'PREMIUM' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-700 text-gray-400'}`}>
                     {user.plan === 'PREMIUM' ? 'PRO' : 'FREE'}
                   </span>
                </div>
              </div>
              <div className="flex space-x-1">
                {user.plan !== 'PREMIUM' && (
                  <button 
                    onClick={() => setMode(AppMode.PRICING)}
                    className="p-1.5 hover:bg-gray-800 rounded-lg text-yellow-400" 
                    title="Yükselt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <button onClick={onLogout} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400" title="Çıkış">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setMode(AppMode.LOGIN)} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm">Giriş Yap</button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;