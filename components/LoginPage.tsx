import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, AppConfig } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    setConfig(storageService.getConfig());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
        setError('Lütfen tüm alanları doldurun.');
        return;
    }

    if (!isLogin && !name) {
        setError('Lütfen isminizi girin.');
        return;
    }

    setLoading(true);

    try {
        let user;
        if (isLogin) {
            user = await storageService.loginWithEmail(email, password);
        } else {
            user = await storageService.registerUser(name, email, password);
        }
        onLogin(user);
    } catch (err: any) {
        setError(err.message || 'Bir hata oluştu.');
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!config?.googleAuthConfig.isEnabled) {
      setError("Google girişi şu an bakımda.");
      return;
    }
    
    setLoading(true);
    try {
      const user = await storageService.loginWithGoogle();
      onLogin(user);
    } catch (e) {
      setError('Google girişi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemo = () => {
    const user = storageService.loginAsAdmin();
    onLogin(user);
  };

  if (config?.maintenanceMode) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
             <div className="text-center">
                 <h1 className="text-4xl mb-4">🚧</h1>
                 <h2 className="text-2xl font-bold text-white">Sistem Bakımda</h2>
                 <p className="text-gray-400 mt-2">Daha iyi hizmet verebilmek için kısa bir aradayız.</p>
                 {/* Secret backdoor for admin to login during maintenance */}
                 <button onClick={handleAdminDemo} className="mt-8 opacity-10 text-xs">Yönetici Girişi</button>
             </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1519681393798-3828fb4090bb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-indigo-900/30 mb-4">
             <span className="text-3xl">✍️</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Gemini Yazar
          </h1>
          <p className="text-gray-400 text-sm">Hayal gücünüzü kelimelere dökün.</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
            <button 
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Giriş Yap
            </button>
            <button 
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Kayıt Ol
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {error && (
               <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs text-center">
                   {error}
               </div>
           )}

           {!isLogin && (
               <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Ad Soyad</label>
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="Yazar Adı"
                   />
               </div>
           )}

           <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">E-posta Adresi</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="ornek@email.com"
                />
           </div>

           <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Şifre</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                />
           </div>

           <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/50 mt-2"
           >
                {loading ? 'İşlem Yapılıyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
           </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500 text-xs uppercase tracking-wide">veya</span>
          </div>
        </div>

        {config?.googleAuthConfig.isEnabled && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-3 mb-4"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google ile Devam Et</span>
          </button>
        )}

        <div className="mt-4 text-center">
             <button
                onClick={handleAdminDemo}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
            >
                Yönetici Hesabı ile Dene (Demo)
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;