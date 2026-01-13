import { useState } from 'react';
import { Gamepad, Gift, Zap } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  demoUrl: string;
  icon: React.ElementType;
  color: string;
  features: string[];
}

const games: Game[] = [
  {
    id: 'wheel',
    title: 'Şans Çarkı',
    description: 'Klasik çarkıfelek deneyimi. Kullanıcılarınız çarkı çevirip indirim kuponları kazanır.',
    demoUrl: '/game/wheel-demo?testMode=true',
    icon: Zap,
    color: 'bg-indigo-500',
    features: ['Özelleştirilebilir Dilimler', 'Kazanma Olasılığı Ayarı', 'Mobil Uyumlu']
  },
  {
    id: 'snake',
    title: 'Snake (Yılan)',
    description: 'Nostaljik yılan oyunu. Yemleri toplayarak puan kazanın ve kupona ulaşın.',
    demoUrl: '/game/snake-demo?testMode=true',
    icon: Gamepad,
    color: 'bg-green-500',
    features: ['Skor Bazlı Kurgu', 'Hızlanan Oynanış', 'Retro Tasarım']
  },
  {
    id: 'memory',
    title: 'Hafıza Kartları',
    description: 'Eşleşen kartları bulma oyunu. Marka bilinirliğini artıran görsel hafıza testi.',
    demoUrl: '/memory/memory-demo?testMode=true',
    icon: Gift,
    color: 'bg-purple-500',
    features: ['Marka Logoları', 'Süre Kısıtlaması', 'Zorluk Seviyeleri']
  }
];

export default function GamesShowcase() {
  const [activeGameId, setActiveGameId] = useState<string>(games[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeGame = games.find(g => g.id === activeGameId) || games[0];

  const handleGameChange = (id: string) => {
    if (id === activeGameId) return;
    setActiveGameId(id);
    setIsLoading(true);
  };

  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Zengin Oyun Kütüphanesi
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Markanıza en uygun oyunu seçin ve hemen kullanmaya başlayın.
            İşte favori oyunlarımız:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Game List */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4 overflow-x-auto lg:overflow-visible p-4 lg:p-0 custom-scrollbar snap-x snap-mandatory">
            {games.map((game) => {
              const Icon = game.icon;
              const isActive = activeGameId === game.id;
              
              return (
                <button
                  key={game.id}
                  onClick={() => handleGameChange(game.id)}
                  className={`flex-none w-[280px] lg:w-full text-left p-6 rounded-2xl transition-all duration-300 border-2 group snap-center ${
                    isActive 
                      ? 'bg-white border-indigo-600 shadow-xl scale-[1.02]' 
                      : 'bg-white border-transparent hover:border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {game.description}
                      </p>
                      
                      {/* Features Tags */}
                      <div className="flex flex-wrap gap-2">
                        {game.features.slice(0, 2).map((feature, idx) => (
                           <span key={idx} className="text-[10px] uppercase font-semibold bg-gray-50 text-gray-400 px-2 py-1 rounded-md border border-gray-100">
                             {feature}
                           </span>
                        ))}
                      </div>
                    </div>
                    {isActive && (
                      <div className="self-center hidden lg:block">
                         <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            
            <div className="hidden lg:block bg-indigo-900/5 p-6 rounded-2xl border border-dashed border-indigo-200 text-center mt-4">
               <p className="text-sm text-indigo-800 font-medium">Yakında Gelecek Oyunlar</p>
               <p className="text-xs text-indigo-600 mt-1">Slot Machine, Flappy Bird ve daha fazlası...</p>
            </div>
          </div>

          {/* Right Column: Game Preview */}
          <div className="lg:col-span-8 relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-900 ring-1 ring-gray-900/5 h-[600px] lg:h-[850px]">
            {/* Browser Header */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 flex items-center px-4 space-x-2 z-20 border-b border-gray-700">
                <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 ml-4 bg-gray-900 rounded-md h-8 flex items-center px-3 text-xs text-gray-400 font-mono">
                    <span className="text-gray-500 mr-2">🔒</span>
                    your-store.com/preview/{activeGame.id}
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10 pt-12">
                   <div className="flex flex-col items-center">
                       <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                       <p className="text-white font-medium animate-pulse">Oyun Yükleniyor...</p>
                   </div>
                </div>
            )}

            {/* Iframe */}
            <iframe 
                key={activeGame.id}
                src={activeGame.demoUrl}
                className="w-full h-full pt-12 bg-white"
                title={`${activeGame.title} Demo`}
                onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
