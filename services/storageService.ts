import { User, AppConfig, Message, Project, AppMode, SystemLog, PromptFeedback } from "../types";

// Keys for LocalStorage - "Database" Tables
const KEYS = {
  USER: 'gemini_user', // Currently logged in user session
  USERS_DB: 'gemini_users_db', // All users
  CONFIG: 'gemini_config',
  PROJECTS: 'gemini_projects_db',
  LOGS: 'gemini_system_logs',
  FEEDBACK: 'gemini_prompt_feedback'
};

// Default System Prompts
const DEFAULT_PROMPTS = {
  book: `Sen ödüllü, usta bir roman yazarısın. Görevin, kullanıcıyla birlikte derinlemesine kurgulanmış, edebi değeri yüksek romanlar yazmaktır.
  - Odak noktan: Karmaşık olay örgüsü ve çok boyutlu karakter gelişimleri.
  - "Göster, anlatma" (Show, don't tell) prensibini uygula.
  - Bir hayalet yazar (ghostwriter) gibi davran.
  - Tonun profesyonel, sürükleyici ve edebi olsun. Türkçe cevap ver.`,
  
  script: `Sen Netflix, HBO standartlarında çalışan profesyonel bir senaristsin.
  - Çıktıların KESİNLİKLE endüstri standardı senaryo formatına (Screenplay Format) uymalıdır.
  - Sahne Başlıkları (INT./EXT.), Karakter İsimleri (BÜYÜK HARF), Diyaloglar ortalanmış olmalı.
  - Asla düz metin yazma. Türkçe cevap ver.`,
  
  chat: `Sen kullanıcının yaratıcı ortağısın (Co-author).
  - Görevin: Karakter isimleri bulmak, olay örgüsü fikirleri vermek ve tıkandığı yerlerde ilham vermek.
  - Samimi ve yardımcı bir ton kullan. Türkçe cevap ver.`
};

// Default Config
const DEFAULT_CONFIG: AppConfig = {
  freeDailyLimit: 10,
  maintenanceMode: false,
  systemPrompts: DEFAULT_PROMPTS,
  adConfig: {
    isEnabled: true,
    leftAdSlots: [
      '<div style="width:100%; height:200px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:12px; padding:15px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; color:white; box-shadow:0 4px 6px rgba(0,0,0,0.3);"><h3 style="margin:0 0 10px 0; font-weight:800; font-size:18px;">Yaratıcı Yazarlık Masterclass</h3><p style="font-size:11px; margin-bottom:15px; opacity:0.9;">Karakter yaratmanın sırlarını öğrenin.</p><button style="background:white; color:#764ba2; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; font-size:12px; cursor:pointer;">%50 İndirimli Kayıt</button></div>',
      '<div style="width:100%; height:200px; background:#3e2723; border-radius:12px; overflow:hidden; position:relative;"><div style="padding:15px; z-index:2; position:relative;"><span style="background:#d7ccc8; color:#3e2723; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold;">SPONSORLU</span><h4 style="color:#d7ccc8; margin:10px 0; font-size:16px;">Yazarlar İçin Özel Harman</h4><button style="border:1px solid #d7ccc8; background:transparent; color:#d7ccc8; padding:5px 10px; border-radius:4px; font-size:11px; cursor:pointer;">Tadına Bak</button></div><div style="position:absolute; bottom:-20px; right:-20px; width:100px; height:100px; background:#5d4037; border-radius:50%; opacity:0.5;"></div></div>',
      '<div style="width:100%; padding:15px; background:#1f2937; border:1px solid #374151; border-radius:8px; color:#9ca3af; font-size:12px; text-align:left;"><strong>Editörün Seçimi:</strong> Bu ayın en çok okunan bilim kurgu öykülerini keşfetmek için <a href="#" style="color:#60a5fa; text-decoration:underline;">tıklayın.</a></div>',
      '<div style="width:100%; height:300px; background:#ffffff; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:4px;"><span style="color:#ccc; font-size:10px;">Reklam</span><h2 style="color:#4285f4; font-family:sans-serif;">Google</h2><p style="color:#555; font-size:12px;">Reklamlarınız burada</p></div>',
      '<div style="width:100%; height:150px; background:linear-gradient(to right, #00b09b, #96c93d); border-radius:12px; padding:15px; color:white; display:flex; flex-direction:column; justify-content:center;"><h4 style="margin:0; font-weight:bold;">Scrivener Alternatifi</h4><p style="font-size:11px; margin:5px 0;">Yerli senaryo yazılımı.</p><div style="text-align:right;"><span style="background:rgba(0,0,0,0.2); padding:3px 8px; border-radius:4px; font-size:10px;">İncele &rarr;</span></div></div>',
      '<div style="width:100%; height:200px; background:#1a202c; border:1px dashed #718096; border-radius:12px; display:flex; align-items:center; justify-content:center; text-align:center; padding:10px;"><div style="color:#a0aec0; font-size:12px;">Buraya kendi reklam kodunuzu (HTML/JS) yapıştırın.<br><br>160x600 veya 250x250 uyumlu.</div></div>'
    ],
    rightAdSlots: [
      '<div style="width:100%; height:250px; background:#2c3e50; border-radius:12px; padding:20px; text-align:center; color:#ecf0f1; display:flex; flex-direction:column; justify-content:space-between;"><div style="font-size:30px;">📖</div><div><h3 style="margin:0; font-size:18px;">Kitabını Basalım!</h3><p style="font-size:12px; color:#bdc3c7; margin-top:5px;">Dosyanı gönder, editörlerimiz incelesin.</p></div><button style="width:100%; background:#e74c3c; border:none; color:white; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;">Başvuru Yap</button></div>',
      '<div style="width:100%; height:120px; background:#000; border:1px solid #333; border-radius:8px; display:flex; align-items:center; padding:10px; gap:10px;"><div style="width:40px; height:40px; background:#333; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px;">⌨️</div><div style="flex-1;"><div style="color:white; font-size:13px; font-weight:bold;">Mekanik Klavye</div><div style="color:#666; font-size:10px;">Yazarlar için sessiz switch.</div></div></div>',
      '<div style="width:100%; height:250px; background:#f1f3f4; border-radius:0; display:flex; align-items:center; justify-content:center; border:1px solid #dadce0;"><span style="color:#80868b; font-family:sans-serif; font-size:14px;">Reklam Alanı (250x250)</span></div>',
      '<div style="width:100%; height:180px; background:#fff8e1; color:#5d4037; padding:15px; border-radius:8px; font-family:serif; display:flex; flex-direction:column; justify-content:center;"><h3 style="margin:0; font-style:italic;">Tipografi Sanatı</h3><p style="font-size:12px; margin:10px 0;">Kelimeleriniz sayfa düzeninde nasıl görünmeli?</p><a href="#" style="color:#ff6f00; font-size:12px; font-weight:bold;">Dersi İzle</a></div>',
      '<div style="width:100%; height:100px; border:2px dotted #4b5563; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#4b5563; font-size:11px;">Reklam Alanı #5</div>',
      '<div style="width:100%; height:100px; border:2px dotted #4b5563; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#4b5563; font-size:11px;">Reklam Alanı #6</div>'
    ],
    mobileAdSlots: [
      '<div style="width:100%; height:50px; background:linear-gradient(90deg, #1CB5E0 0%, #000851 100%); display:flex; items-center; justify-content:space-between; padding:0 15px; align-items:center; color:white;"><div style="font-weight:bold; font-size:12px;">🚀 Romanını Hızlandır</div><div style="background:rgba(255,255,255,0.2); padding:2px 6px; border-radius:4px; font-size:9px;">REKLAM</div></div>',
      '<div style="width:100%; padding:10px; margin:10px 0; background:#2d3748; border-left:3px solid #ed8936; border-radius:4px;"><p style="margin:0; color:#e2e8f0; font-size:12px;">💡 <strong>İpucu:</strong> Karakter isimlerinde zorlanıyor musunuz? İsim üretici aracımızı deneyin.</p></div>',
      '<div style="width:100%; height:40px; background:#1a202c; border-top:1px solid #2d3748; display:flex; align-items:center; justify-content:center;"><a href="#" style="color:#a0aec0; text-decoration:none; font-size:11px; display:flex; align-items:center; gap:5px;"><span>Reklamları Kaldır</span> <span style="background:#4a5568; color:white; padding:1px 5px; border-radius:99px; font-size:9px;">Premium</span></a></div>'
    ]
  },
  shopierConfig: {
    apiKey: '',
    apiSecret: '',
    websiteIndex: '1',
    isEnabled: true
  },
  googleAuthConfig: {
    clientId: '',
    isEnabled: true
  },
  packages: [
    {
      id: 'basic',
      name: 'Başlangıç',
      price: 0,
      currency: 'TL',
      features: ['Temel Sohbet Modu', 'Sınırlı Karakter Analizi', 'Günlük Limitli Kullanım'],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Profesyonel Yazar',
      price: 149,
      currency: 'TL',
      features: ['Sınırsız Roman & Senaryo Modu', 'Gemini 3.0 Pro Sınırsız Erişim', 'Reklamsız Deneyim', 'PDF Çıktısı Alma', 'Sınırsız Prompt'],
      isPopular: true
    }
  ]
};

export const storageService = {
  // --- Auth & User Management ---
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.USER);
    if (!stored) return null;
    
    // Check daily usage reset
    const user: User = JSON.parse(stored);
    const today = new Date().toISOString().split('T')[0];
    
    if (user.dailyUsage?.date !== today) {
      user.dailyUsage = { count: 0, date: today };
      storageService.setCurrentUser(user);
    }
    
    return user;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      if (!user.dailyUsage) {
        user.dailyUsage = { count: 0, date: new Date().toISOString().split('T')[0] };
      }
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      
      const db = storageService.getUsersDB();
      const existingIndex = db.findIndex(u => u.id === user.id);
      if (existingIndex >= 0) {
        // Preserve password if not provided in update
        const existing = db[existingIndex];
        db[existingIndex] = { ...existing, ...user, password: user.password || existing.password };
      } else {
        db.push(user);
      }
      localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  getUsersDB: (): User[] => {
    const stored = localStorage.getItem(KEYS.USERS_DB);
    return stored ? JSON.parse(stored) : [];
  },

  // NEW: Register User
  registerUser: (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const db = storageService.getUsersDB();
        if (db.find(u => u.email === email)) {
          reject(new Error("Bu e-posta adresi zaten kayıtlı."));
          return;
        }

        const newUser: User = {
          id: 'u_' + Date.now(),
          email,
          name,
          password: btoa(password), // Simple encoding for demo (NOT secure for prod)
          plan: 'FREE',
          isAdmin: false,
          registeredAt: Date.now(),
          dailyUsage: { count: 0, date: new Date().toISOString().split('T')[0] },
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        };

        db.push(newUser);
        localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
        storageService.logSystemEvent('SUCCESS', `Yeni üye kaydı: ${email}`, newUser.id);
        storageService.setCurrentUser(newUser);
        resolve(newUser);
      }, 800);
    });
  },

  // NEW: Login with Email/Pass
  loginWithEmail: (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const db = storageService.getUsersDB();
        const user = db.find(u => u.email === email && u.password === btoa(password));
        
        if (user) {
          storageService.logSystemEvent('INFO', `Kullanıcı girişi: ${email}`, user.id);
          storageService.setCurrentUser(user);
          resolve(user);
        } else {
          storageService.logSystemEvent('WARNING', `Başarısız giriş denemesi: ${email}`);
          reject(new Error("E-posta veya şifre hatalı."));
        }
      }, 800);
    });
  },

  loginWithGoogle: async (): Promise<User> => {
    const config = storageService.getConfig();
    console.log("Authenticating with Google Client ID:", config.googleAuthConfig.clientId || 'DEMO_MODE');

    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        // Check if demo user exists in DB, if not create
        const email = 'demo@google.com';
        const db = storageService.getUsersDB();
        let user = db.find(u => u.email === email);

        if (!user) {
            user = {
                id: 'google_' + Date.now(),
                email: email,
                name: 'Google Kullanıcısı',
                plan: 'FREE',
                isAdmin: false,
                registeredAt: Date.now(),
                dailyUsage: { count: 0, date: today },
                avatar: 'https://lh3.googleusercontent.com/a/default-user'
            };
        }
        
        storageService.logSystemEvent('SUCCESS', `Google ile giriş: ${email}`, user.id);
        storageService.setCurrentUser(user);
        resolve(user);
      }, 1000);
    });
  },

  loginAsAdmin: (): User => {
    const today = new Date().toISOString().split('T')[0];
    const email = 'admin@geminiyazar.com';
    const db = storageService.getUsersDB();
    let adminUser = db.find(u => u.isAdmin); // Find existing admin or create new

    if (!adminUser) {
        adminUser = {
            id: 'admin_1',
            email: email,
            name: 'Sistem Yöneticisi',
            plan: 'PREMIUM',
            isAdmin: true,
            registeredAt: Date.now(),
            dailyUsage: { count: 0, date: today },
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
        };
    }
    
    storageService.logSystemEvent('INFO', `Admin girişi yapıldı.`);
    storageService.setCurrentUser(adminUser);
    return adminUser;
  },

  upgradePlan: (plan: 'FREE' | 'PREMIUM') => {
    const user = storageService.getCurrentUser();
    if (user) {
      user.plan = plan;
      storageService.setCurrentUser(user);
      storageService.logSystemEvent('SUCCESS', `Paket yükseltildi: ${plan}`, user.id);
    }
  },

  // --- Configuration Management (Database) ---
  getConfig: (): AppConfig => {
    const stored = localStorage.getItem(KEYS.CONFIG);
    if (!stored) return DEFAULT_CONFIG;
    
    const parsed = JSON.parse(stored);
    
    // Schema Migration & Defaults
    const adConfig = { ...DEFAULT_CONFIG.adConfig, ...(parsed.adConfig || {}) };
    const systemPrompts = { ...DEFAULT_CONFIG.systemPrompts, ...(parsed.systemPrompts || {}) };
    
    // Ensure array integrity
    if (!adConfig.leftAdSlots) adConfig.leftAdSlots = DEFAULT_CONFIG.adConfig.leftAdSlots;
    if (!adConfig.rightAdSlots) adConfig.rightAdSlots = DEFAULT_CONFIG.adConfig.rightAdSlots;
    if (!adConfig.mobileAdSlots) adConfig.mobileAdSlots = DEFAULT_CONFIG.adConfig.mobileAdSlots;

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      adConfig,
      systemPrompts,
      shopierConfig: { ...DEFAULT_CONFIG.shopierConfig, ...parsed.shopierConfig },
      packages: parsed.packages || DEFAULT_CONFIG.packages
    };
  },

  saveConfig: (config: AppConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    storageService.logSystemEvent('WARNING', 'Sistem ayarları güncellendi.');
  },

  // --- Project / Database Management ---
  getProjects: (userId: string): Project[] => {
    const allProjects: Project[] = JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]');
    return allProjects.filter(p => p.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  saveProject: (project: Project) => {
    const allProjects: Project[] = JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]');
    const index = allProjects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      allProjects[index] = project;
    } else {
      allProjects.push(project);
    }
    
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(allProjects));
  },

  deleteProject: (projectId: string) => {
    const allProjects: Project[] = JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]');
    const filtered = allProjects.filter(p => p.id !== projectId);
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(filtered));
  },

  createProject: (userId: string, mode: AppMode, initialName: string = "Yeni Proje"): Project => {
    const newProject: Project = {
      id: 'proj_' + Date.now() + Math.random().toString(36).substr(2, 9),
      userId,
      name: initialName,
      mode,
      messages: [],
      updatedAt: Date.now()
    };
    storageService.saveProject(newProject);
    return newProject;
  },

  // --- System Logs ---
  logSystemEvent: (type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS', message: string, userId?: string) => {
    const logs: SystemLog[] = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
    const newLog: SystemLog = {
        id: 'log_' + Date.now() + Math.random().toString().substr(2,5),
        type,
        message,
        timestamp: Date.now(),
        userId
    };
    // Keep last 200 logs
    const updatedLogs = [newLog, ...logs].slice(0, 200);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(updatedLogs));
  },

  getSystemLogs: (): SystemLog[] => {
    return JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  },

  // --- Backup & Restore & Reset ---
  createBackup: (): string => {
    const backup = {
        users: JSON.parse(localStorage.getItem(KEYS.USERS_DB) || '[]'),
        projects: JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]'),
        config: JSON.parse(localStorage.getItem(KEYS.CONFIG) || '{}'),
        logs: JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]'),
        feedback: JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || '[]'),
        backupDate: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackup: (jsonString: string): boolean => {
      try {
          const backup = JSON.parse(jsonString);
          if(backup.users) localStorage.setItem(KEYS.USERS_DB, JSON.stringify(backup.users));
          if(backup.projects) localStorage.setItem(KEYS.PROJECTS, JSON.stringify(backup.projects));
          if(backup.config) localStorage.setItem(KEYS.CONFIG, JSON.stringify(backup.config));
          if(backup.logs) localStorage.setItem(KEYS.LOGS, JSON.stringify(backup.logs));
          if(backup.feedback) localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(backup.feedback));
          
          storageService.logSystemEvent('WARNING', 'Sistem yedeği geri yüklendi.');
          return true;
      } catch(e) {
          console.error("Backup restore failed", e);
          return false;
      }
  },

  factoryReset: () => {
    // Clear all keys managed by this service
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.USERS_DB);
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.PROJECTS);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.FEEDBACK);
    
    console.log("Database Factory Reset Completed.");
  },

  // --- Feedback Logic ---
  saveFeedback: (feedback: PromptFeedback) => {
    const feedbacks: PromptFeedback[] = JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || '[]');
    feedbacks.push(feedback);
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(feedbacks));
    storageService.logSystemEvent('INFO', `Prompt geri bildirimi alındı: ${feedback.rating}`, feedback.userId);
  },

  getFeedbacks: (): PromptFeedback[] => {
    return JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || '[]');
  },

  // --- Limit Logic ---
  checkAndIncrementUsage: (): boolean => {
    const user = storageService.getCurrentUser();
    const config = storageService.getConfig();

    if (!user) return false;
    if (user.plan === 'PREMIUM') return true;

    if (user.dailyUsage.count >= config.freeDailyLimit) {
      return false;
    }

    user.dailyUsage.count += 1;
    storageService.setCurrentUser(user);
    return true;
  }
};