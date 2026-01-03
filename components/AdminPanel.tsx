import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { AppConfig, User, PaymentPackage, SystemLog } from '../types';

const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(storageService.getConfig());
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'general' | 'ai_settings' | 'packages' | 'ads' | 'users' | 'database'>('dashboard');
  const [adSubTab, setAdSubTab] = useState<'left' | 'right' | 'mobile'>('left');
  const [isSaved, setIsSaved] = useState(false);
  const [backupData, setBackupData] = useState('');

  useEffect(() => {
    refreshData();
    // Auto refresh logs every 5 seconds if on dashboard or logs
    const interval = setInterval(() => {
        if (activeTab === 'dashboard') refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const refreshData = () => {
    setUsers(storageService.getUsersDB());
    setLogs(storageService.getSystemLogs());
  };

  const handleSave = () => {
    storageService.saveConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAdArrayChange = (type: 'left' | 'right' | 'mobile', index: number, value: string) => {
    const newConfig = { ...config };
    if (type === 'left') {
      const newSlots = [...newConfig.adConfig.leftAdSlots];
      newSlots[index] = value;
      newConfig.adConfig.leftAdSlots = newSlots;
    } else if (type === 'right') {
      const newSlots = [...newConfig.adConfig.rightAdSlots];
      newSlots[index] = value;
      newConfig.adConfig.rightAdSlots = newSlots;
    } else {
      const newSlots = [...newConfig.adConfig.mobileAdSlots];
      newSlots[index] = value;
      newConfig.adConfig.mobileAdSlots = newSlots;
    }
    setConfig(newConfig);
  };

  const handlePromptChange = (key: 'book' | 'script' | 'chat', value: string) => {
    setConfig(prev => ({
        ...prev,
        systemPrompts: {
            ...prev.systemPrompts,
            [key]: value
        }
    }));
  };

  const handleGoogleChange = (key: keyof typeof config.googleAuthConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      googleAuthConfig: { ...prev.googleAuthConfig, [key]: value }
    }));
  };

  const handlePackageChange = (index: number, key: keyof PaymentPackage, value: any) => {
    const newPackages = [...config.packages];
    newPackages[index] = { ...newPackages[index], [key]: value };
    setConfig(prev => ({ ...prev, packages: newPackages }));
  };

  const handleDownloadBackup = () => {
      const json = storageService.createBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gemini_yazar_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
              if (confirm("DİKKAT: Mevcut tüm veritabanı silinecek ve yedeğe dönülecek. Onaylıyor musunuz?")) {
                  const success = storageService.restoreBackup(content);
                  if (success) {
                      alert("Yedek başarıyla yüklendi. Sayfa yenileniyor...");
                      window.location.reload();
                  } else {
                      alert("Yedek dosyası hatalı.");
                  }
              }
          }
      };
      reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    const confirm1 = confirm("⚠️ TEHLİKE: Tüm kullanıcıları, projeleri ve ayarları silmek üzeresiniz. Bu işlem geri alınamaz!");
    if (confirm1) {
      const confirm2 = confirm("Gerçekten emin misiniz? Sistem tamamen sıfırlanacak ve çıkış yapılacaktır.");
      if (confirm2) {
        storageService.factoryReset();
        alert("Sistem sıfırlandı. Çıkış yapılıyor...");
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Yönetici Paneli</h2>
            <p className="text-gray-400">Sistem veritabanı ve genel ayarlar.</p>
          </div>
          <button 
            onClick={handleSave}
            className={`w-full md:w-auto px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${isSaved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
            {isSaved ? 'Veritabanı Güncellendi ✓' : 'Kaydet & Yayınla'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-gray-900 p-1 rounded-xl mb-6 w-full custom-scrollbar pb-2 md:pb-1">
          <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-indigo-900 text-white shadow' : 'text-gray-400 hover:text-white'}`}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('general')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'general' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}>⚙️ Genel</button>
          <button onClick={() => setActiveTab('ai_settings')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'ai_settings' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}>✨ Yapay Zeka</button>
          <button onClick={() => setActiveTab('ads')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'ads' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}>📺 Reklam</button>
          <button onClick={() => setActiveTab('packages')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'packages' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}>📦 Paketler</button>
          <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'users' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}>👥 Kullanıcılar</button>
          <button onClick={() => setActiveTab('database')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'database' ? 'bg-red-900/50 text-red-200 shadow' : 'text-gray-400 hover:text-white'}`}>💾 Veritabanı</button>
        </div>

        {/* Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl min-h-[500px]">
          
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                          <h4 className="text-xs text-gray-400 uppercase">Toplam Kullanıcı</h4>
                          <div className="text-2xl font-bold text-white mt-1">{users.length}</div>
                      </div>
                      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                          <h4 className="text-xs text-gray-400 uppercase">Premium Üye</h4>
                          <div className="text-2xl font-bold text-purple-400 mt-1">{users.filter(u => u.plan === 'PREMIUM').length}</div>
                      </div>
                      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                          <h4 className="text-xs text-gray-400 uppercase">Sistem Logları</h4>
                          <div className="text-2xl font-bold text-blue-400 mt-1">{logs.length}</div>
                      </div>
                      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                          <h4 className="text-xs text-gray-400 uppercase">Tahmini Gelir</h4>
                          <div className="text-2xl font-bold text-green-400 mt-1">₺{users.filter(u => u.plan === 'PREMIUM').length * 149}</div>
                      </div>
                  </div>

                  {/* Live Logs */}
                  <div className="bg-black/50 border border-gray-800 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs">
                      <h3 className="text-gray-400 mb-2 sticky top-0 bg-black/90 p-1">Sistem Canlı Kayıtları (Live Logs)</h3>
                      <div className="space-y-1">
                          {logs.map(log => (
                              <div key={log.id} className="flex gap-2 border-b border-gray-800/50 py-1 hover:bg-white/5">
                                  <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                  <span className={`font-bold w-16 ${log.type === 'ERROR' ? 'text-red-500' : log.type === 'WARNING' ? 'text-yellow-500' : log.type === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'}`}>{log.type}</span>
                                  <span className="text-gray-300">{log.message}</span>
                                  {log.userId && <span className="text-gray-600 text-[10px] ml-auto">User: {log.userId}</span>}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <h4 className="text-blue-400 font-bold mb-2">ℹ️ Sistem Bilgisi</h4>
                <p className="text-sm text-gray-300">
                   API Anahtarı güvenliği için <code>.env</code> sistemi kullanılmaktadır. 
                   API Anahtarı sunucu tarafında (Environment Variables) saklanır ve bu panelden görüntülenemez.
                </p>
              </div>

               <div className="p-4 bg-red-900/10 border border-red-900/50 rounded-lg flex items-center justify-between">
                <div>
                    <h4 className="text-red-400 font-bold">Bakım Modu</h4>
                    <p className="text-sm text-gray-400">Aktif edildiğinde sadece Admin giriş yapabilir.</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <label className="block text-sm font-medium text-yellow-400 mb-2">Ücretsiz Günlük Prompt Limiti</label>
                <div className="flex items-center gap-4">
                    <input 
                    type="number"
                    value={config.freeDailyLimit}
                    onChange={(e) => setConfig({ ...config, freeDailyLimit: Number(e.target.value) })}
                    className="w-24 bg-gray-950 border border-gray-700 rounded-lg p-3 text-white text-center font-bold"
                    />
                    <span className="text-xs text-gray-500">Kullanıcılar bu sayıyı aşınca Premium uyarısı görür.</span>
                </div>
              </div>

               <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                 <h4 className="text-sm font-medium text-white mb-4">Google Giriş Entegrasyonu</h4>
                 <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Google Login Aktif</span>
                  <button onClick={() => handleGoogleChange('isEnabled', !config.googleAuthConfig.isEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.googleAuthConfig.isEnabled ? 'bg-green-500' : 'bg-gray-700'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${config.googleAuthConfig.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                </div>
                <input type="text" value={config.googleAuthConfig.clientId} onChange={(e) => handleGoogleChange('clientId', e.target.value)} placeholder="Google Client ID" className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white text-sm" />
              </div>
            </div>
          )}

          {activeTab === 'ai_settings' && (
            <div className="space-y-6">
                <div className="p-4 bg-purple-900/20 border border-purple-800 rounded-lg mb-6">
                    <h4 className="text-purple-400 font-bold mb-1">🧠 Yapay Zeka Beyni</h4>
                    <p className="text-sm text-gray-300">
                        Burada yaptığınız değişiklikler sitenin davranışını anında değiştirir. 
                        Örneğin Roman moduna "Komik ol" derseniz, tüm kullanıcılar için komik yazar.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-indigo-400 mb-2">📚 Roman Modu - Sistem Talimatı</label>
                        <textarea 
                            value={config.systemPrompts.book}
                            onChange={(e) => handlePromptChange('book', e.target.value)}
                            className="w-full h-40 bg-gray-950 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm leading-relaxed focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Sen bir roman yazarısın..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-pink-400 mb-2">🎬 Senaryo Modu - Sistem Talimatı</label>
                        <textarea 
                            value={config.systemPrompts.script}
                            onChange={(e) => handlePromptChange('script', e.target.value)}
                            className="w-full h-40 bg-gray-950 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm leading-relaxed focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                            placeholder="Sen bir senaristsin..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-green-400 mb-2">💬 Sohbet/Asistan Modu - Sistem Talimatı</label>
                        <textarea 
                            value={config.systemPrompts.chat}
                            onChange={(e) => handlePromptChange('chat', e.target.value)}
                            className="w-full h-32 bg-gray-950 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm leading-relaxed focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="Sen bir asistansın..."
                        />
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-gray-950 rounded-lg border border-gray-800">
                <span className="text-white font-medium">Reklam Sistemini Aç/Kapat</span>
                <button 
                  onClick={() => setConfig({...config, adConfig: {...config.adConfig, isEnabled: !config.adConfig.isEnabled}})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.adConfig.isEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${config.adConfig.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Ad Sub-Tabs */}
              <div className="flex space-x-2 border-b border-gray-800 pb-2">
                 <button onClick={() => setAdSubTab('left')} className={`px-4 py-2 text-sm font-bold ${adSubTab === 'left' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>Sol Panel (6)</button>
                 <button onClick={() => setAdSubTab('right')} className={`px-4 py-2 text-sm font-bold ${adSubTab === 'right' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>Sağ Panel (6)</button>
                 <button onClick={() => setAdSubTab('mobile')} className={`px-4 py-2 text-sm font-bold ${adSubTab === 'mobile' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>Mobil (3)</button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {adSubTab === 'left' && (
                  <>
                    <p className="text-xs text-gray-500">Masaüstü görünümde sol tarafta, menü altında yer alan 6 adet reklam alanı.</p>
                    {config.adConfig.leftAdSlots.map((slot, i) => (
                      <div key={i}>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Sol Reklam #{i + 1}</label>
                        <textarea 
                          value={slot}
                          onChange={(e) => handleAdArrayChange('left', i, e.target.value)}
                          className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white font-mono text-xs h-20"
                          placeholder="HTML/Script Kodu..."
                        />
                      </div>
                    ))}
                  </>
                )}

                {adSubTab === 'right' && (
                  <>
                    <p className="text-xs text-gray-500">Masaüstü görünümde sağ tarafta yer alan 6 adet reklam alanı.</p>
                    {config.adConfig.rightAdSlots.map((slot, i) => (
                      <div key={i}>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Sağ Reklam #{i + 1}</label>
                        <textarea 
                          value={slot}
                          onChange={(e) => handleAdArrayChange('right', i, e.target.value)}
                          className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white font-mono text-xs h-20"
                          placeholder="HTML/Script Kodu..."
                        />
                      </div>
                    ))}
                  </>
                )}

                {adSubTab === 'mobile' && (
                  <>
                    <p className="text-xs text-gray-500">Mobil görünüm için özel reklam alanları.</p>
                    {['Üst Banner', 'Sohbet İçi/Ara Banner', 'Alt Menü Üstü Banner'].map((label, i) => (
                      <div key={i}>
                         <label className="block text-xs font-medium text-gray-400 mb-1">Mobil: {label}</label>
                         <textarea 
                           value={config.adConfig.mobileAdSlots[i]}
                           onChange={(e) => handleAdArrayChange('mobile', i, e.target.value)}
                           className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white font-mono text-xs h-20"
                           placeholder="HTML/Script Kodu..."
                         />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

           {activeTab === 'packages' && (
            <div className="space-y-8">
              {config.packages.map((pkg, index) => (
                <div key={pkg.id} className="p-6 border border-gray-700 rounded-xl bg-gray-950/50">
                   <div className="flex justify-between items-start mb-4">
                     <h3 className="text-lg font-bold text-white">{pkg.id === 'basic' ? 'Ücretsiz Paket' : 'Premium Paket'}</h3>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Paket Adı</label>
                        <input 
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Fiyat</label>
                          <input 
                            type="number"
                            value={pkg.price}
                            onChange={(e) => handlePackageChange(index, 'price', Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                          />
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <div className="p-4 mb-4 bg-gray-800 rounded-lg flex justify-between items-center">
                  <p className="text-sm text-gray-400">Toplam Kayıtlı Kullanıcı: <span className="text-white font-bold">{users.length}</span></p>
                  <button onClick={refreshData} className="text-xs bg-gray-700 px-2 py-1 rounded">Yenile</button>
              </div>
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-950 uppercase font-medium border-b border-gray-800">
                  <tr>
                      <th className="px-4 py-3">Kullanıcı</th>
                      <th className="px-4 py-3">E-posta</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Kayıt</th>
                      <th className="px-4 py-3">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-950/50">
                      <td className="px-4 py-3 flex items-center space-x-3">
                          <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                          <span>{user.name}</span>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${user.plan === 'PREMIUM' ? 'bg-purple-900 text-purple-200' : 'bg-gray-800'}`}>{user.plan}</span></td>
                      <td className="px-4 py-3 text-xs">{user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">{user.isAdmin ? <span className="text-red-400 font-bold">Admin</span> : 'Üye'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'database' && (
              <div className="space-y-6">
                  <div className="bg-red-900/10 border border-red-900 p-6 rounded-xl">
                      <h3 className="text-xl font-bold text-red-400 mb-2">Veritabanı Yönetimi</h3>
                      <p className="text-gray-400 mb-6">
                          Tüm kullanıcıları, ayarları, sohbet geçmişlerini ve logları JSON formatında indirip saklayabilir veya geri yükleyebilirsiniz.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-gray-950 p-6 rounded-lg border border-gray-800 text-center">
                              <h4 className="font-bold text-white mb-2">Yedekle (Backup)</h4>
                              <p className="text-xs text-gray-500 mb-4">Veritabanını indir.</p>
                              <button 
                                onClick={handleDownloadBackup}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold w-full"
                              >
                                  JSON İndir
                              </button>
                          </div>

                          <div className="bg-gray-950 p-6 rounded-lg border border-gray-800 text-center">
                              <h4 className="font-bold text-white mb-2">Geri Yükle (Restore)</h4>
                              <p className="text-xs text-gray-500 mb-4">Yedeği yükle (Mevcut veriler silinir!)</p>
                              <div className="relative">
                                  <input 
                                    type="file" 
                                    accept=".json"
                                    onChange={handleRestoreBackup}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold w-full border border-gray-700">
                                      Dosya Seç ve Yükle
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Factory Reset Zone */}
                      <div className="border-t border-red-900/30 pt-6">
                         <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl flex items-center justify-between">
                            <div>
                               <h4 className="text-red-500 font-bold flex items-center gap-2">
                                 <span>⚠️</span> Fabrika Ayarlarına Sıfırla
                               </h4>
                               <p className="text-xs text-red-300 mt-1">Tüm veriler (kullanıcılar, projeler, ayarlar) kalıcı olarak silinir.</p>
                            </div>
                            <button 
                              onClick={handleFactoryReset}
                              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-red-900/50"
                            >
                              Sistemi Sıfırla
                            </button>
                         </div>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;