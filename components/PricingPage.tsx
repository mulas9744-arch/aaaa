import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { AppConfig } from '../types';

interface PricingPageProps {
  onBack: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const user = storageService.getCurrentUser();

  useEffect(() => {
    setConfig(storageService.getConfig());
  }, []);

  const handleShopierPayment = () => {
    if (!config?.shopierConfig.isEnabled) {
      alert("Ödeme sistemi şu an bakımda.");
      return;
    }

    setLoading(true);
    // Simulation of Shopier redirect using Admin keys
    console.log(`Connecting to Shopier with Key: ${config.shopierConfig.apiKey}`);
    
    setTimeout(() => {
      // Mock successful payment
      if (confirm("Simülasyon: Shopier ödeme sayfasına yönlendiriliyorsunuz. Ödemeyi onayla?")) {
        storageService.upgradePlan('PREMIUM');
        alert("Ödeme Başarılı! Premium üyeliğiniz aktif edildi.");
        window.location.reload(); // Refresh to update UI
      } else {
        setLoading(false);
      }
    }, 1500);
  };

  if (!config) return null;

  const basicPlan = config.packages.find(p => p.id === 'basic');
  const proPlan = config.packages.find(p => p.id === 'pro');

  return (
    <div className="flex flex-col h-full bg-gray-950 p-8 overflow-y-auto custom-scrollbar items-center justify-center">
      <div className="max-w-4xl w-full">
        <button onClick={onBack} className="mb-8 text-gray-400 hover:text-white flex items-center space-x-2">
          <span>← Geri Dön</span>
        </button>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Yaratıcılığınızın Sınırlarını Kaldırın
          </h2>
          <p className="text-gray-400 text-lg">Profesyonel yazarlar için geliştirilmiş planlar.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          {basicPlan && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">{basicPlan.name}</h3>
              <div className="text-3xl font-bold text-gray-200 mb-6">{basicPlan.price === 0 ? 'Ücretsiz' : `${basicPlan.price} ${basicPlan.currency}`}</div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-400 text-sm">
                {basicPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">✓ {feature}</li>
                ))}
              </ul>
              <button disabled className="w-full bg-gray-800 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed">
                Mevcut Plan
              </button>
            </div>
          )}

          {/* Premium Plan */}
          {proPlan && (
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-purple-500/30 rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-purple-900/20">
              {proPlan.isPopular && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  EN POPÜLER
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{proPlan.name}</h3>
              <div className="text-3xl font-bold text-white mb-6">
                {proPlan.price} {proPlan.currency} <span className="text-base font-normal text-gray-400">/ay</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-300 text-sm">
                {proPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-white"><span className="text-purple-400 mr-2">★</span> {feature}</li>
                ))}
              </ul>
              
              {user?.plan === 'PREMIUM' ? (
                <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold cursor-default">
                  Premium Aktif ✓
                </button>
              ) : (
                <button 
                  onClick={handleShopierPayment}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-600/30 flex items-center justify-center space-x-2"
                >
                  {loading ? 'Yönlendiriliyor...' : 'Shopier ile Güvenli Öde'}
                </button>
              )}
              <div className="mt-4 flex justify-center space-x-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                {/* Fake card logos */}
                <div className="h-6 w-10 bg-white rounded"></div>
                <div className="h-6 w-10 bg-white rounded"></div>
                <div className="h-6 w-10 bg-white rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;