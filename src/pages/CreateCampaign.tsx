import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, MessageSquare, Monitor, Smartphone, Palette, Gamepad2, Check, ArrowRight, ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// Types
type CampaignType = 'popup' | 'embedded'
type ThemeId = 'light' | 'dark' | 'colorful'
type GameId = 'circle-dash' | 'wheel' | 'memory'

interface CampaignConfig {
  name: string
  type: CampaignType
  theme: ThemeId
  games: GameId[]
}

const THEMES = [
  { 
    id: 'light' as ThemeId, 
    name: 'Klasik Aydınlık', 
    description: 'Temiz ve ferah görünüm',
    bg: 'bg-white', 
    text: 'text-gray-900',
    primary: 'bg-indigo-600',
    previewBg: 'bg-gray-50'
  },
  { 
    id: 'dark' as ThemeId, 
    name: 'Modern Karanlık', 
    description: 'Şık ve profesyonel',
    bg: 'bg-gray-900', 
    text: 'text-white',
    primary: 'bg-indigo-500',
    previewBg: 'bg-gray-800'
  },
  { 
    id: 'colorful' as ThemeId, 
    name: 'Canlı Renkler', 
    description: 'Dikkat çekici gradyanlar',
    bg: 'bg-gradient-to-br from-violet-600 to-indigo-600', 
    text: 'text-white',
    primary: 'bg-white/20 backdrop-blur',
    previewBg: 'bg-gradient-to-br from-violet-100 to-indigo-100'
  }
]

const GAMES = [
  /*
  { 
    id: 'circle-dash' as GameId, 
    name: 'Circle Dash', 
    description: 'Reflekslerini test et ve kazan', 
    icon: '🎯' 
  },
  */
  { 
    id: 'wheel' as GameId, 
    name: 'Şans Çarkı', 
    description: 'Çevir ve anında kazan',
    icon: '🎡' 
  },
  { 
    id: 'memory' as GameId, 
    name: 'Hafıza Oyunu', 
    description: 'Kartları eşleştir ve kazan',
    icon: '🧩' 
  }
]

export default function CreateCampaign() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  
  const [config, setConfig] = useState<CampaignConfig>({
    name: '',
    type: 'popup',
    theme: 'light',
    games: ['wheel']
  })

  const [campaignName, setCampaignName] = useState('')

  const selectedTheme = THEMES.find(t => t.id === config.theme)!
  const selectedGames = GAMES.filter(g => config.games.includes(g.id))

  const toggleGame = (gameId: GameId) => {
    setConfig(prev => {
      const isSelected = prev.games.includes(gameId)
      if (isSelected) {
        // Prevent deselecting the last game
        if (prev.games.length === 1) return prev
        return { ...prev, games: prev.games.filter(id => id !== gameId) }
      } else {
        return { ...prev, games: [...prev.games, gameId] }
      }
    })
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSave = async () => {
    if (!user) return

    if (config.games.length === 0) {
      alert('Lütfen en az bir oyun seçin.')
      return
    }

    try {
      // Create new Booste object in Database
      const { error } = await supabase.from('campaigns').insert({
        user_id: user.id,
        name: campaignName,
        status: 'active',
        type: config.type,
        game_type: config.games[0], // Primary game type for legacy/display
        games: config.games,
        theme: config.theme
      })

      if (error) throw error

      console.log('Campaign saved successfully')
      alert('Booste başarıyla oluşturuldu!')
      navigate('/my-boostes')
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Booste Oluştur</h1>
            <p className="text-gray-600">3 adımda oyun widget'ınızı hazırlayın</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>1. Yerleşim</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>2. Tema</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>3. Oyunlar</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 min-h-[500px]">
              
              {/* Step 1: Placement Type */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Monitor className="text-indigo-600" />
                    Görünüm Seçin
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setConfig({ ...config, type: 'popup' })}
                      className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                        config.type === 'popup' 
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <MessageSquare className="h-6 w-6 text-indigo-600" />
                        </div>
                        {config.type === 'popup' && <Check className="h-6 w-6 text-indigo-600" />}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">Popup Booste</h3>
                      <p className="text-gray-500 text-sm">
                        Sitenizin sağ alt köşesinde buton olarak görünür. Tıklandığında oyunlar açılır.
                      </p>
                    </button>

                  <button
  disabled // Butonu fonksiyonel olarak devre dışı bırakır
  onClick={() => setConfig({ ...config, type: 'embedded' })}
  className={`p-6 rounded-xl border-2 text-left transition-all 
    ${
      config.type === 'embedded' 
        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
        : 'border-gray-200'
    } 
    /* Disabled Durumu İçin Eklenen Sınıflar */
    disabled:opacity-50 
    disabled:cursor-not-allowed 
    disabled:hover:scale-100 
    disabled:grayscale-[0.5]`
  }
>
  <div className="flex justify-between items-start mb-4">
    <div className="p-3 bg-white rounded-lg shadow-sm">
      <Layout className="h-6 w-6 text-indigo-600" />
    </div>
    {config.type === 'embedded' && <Check className="h-6 w-6 text-indigo-600" />}
  </div>
  <h3 className="font-bold text-lg text-gray-900 mb-1">
    Gömülü (Embedded) <span className="text-xs font-normal text-gray-400">(Yakında)</span>
  </h3>
  <p className="text-gray-500 text-sm">
    Sayfanızın istediğiniz bir bölümüne (blok olarak) yerleşir.
  </p>
</button>
                  </div>
                </div>
              )}

              {/* Step 2: Theme Selection */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Palette className="text-indigo-600" />
                    Tema Seçin
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setConfig({ ...config, theme: theme.id })}
                        className={`p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
                          config.theme === theme.id 
                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-lg shadow-sm flex items-center justify-center text-xl ${theme.bg} ${theme.text} border border-gray-100`}>
                          Aa
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{theme.name}</h3>
                          <p className="text-gray-500 text-sm">{theme.description}</p>
                        </div>
                        {config.theme === theme.id && <Check className="h-6 w-6 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Game Selection */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-indigo-600" />
                    Oyunları Seçin
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Birden fazla oyun seçebilirsiniz. Kullanıcılar bu oyunlardan dilediğini seçip oynayabilir.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {GAMES.map(game => {
                      const isSelected = config.games.includes(game.id)
                      return (
                        <button
                          key={game.id}
                          onClick={() => toggleGame(game.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="absolute top-2 right-2">
                             {isSelected && <Check className="h-5 w-5 text-indigo-600 bg-white rounded-full p-0.5" />}
                          </div>
                          <div className="text-4xl mb-3">{game.icon}</div>
                          <h3 className="font-bold text-gray-900 mb-1">{game.name}</h3>
                          <p className="text-gray-500 text-xs">{game.description}</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 pt-8 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booste Adı
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Örn: Yaz İndirimleri Booste"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30"
                >
                  Sonraki
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!campaignName}
                  className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Booste'u Oluştur
                </button>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Canlı Önizleme</h2>
              <div className="bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-gray-800 aspect-[9/19] relative overflow-hidden">
                {/* Mobile Screen Mockup */}
                <div className={`absolute inset-0 bg-white overflow-hidden flex flex-col`}>
                  
                  {/* Mock Navbar */}
                  <div className="h-14 border-b flex items-center justify-between px-4 bg-white/90 backdrop-blur z-10">
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    <div className="flex space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="p-4 space-y-4 bg-gray-50 flex-1 overflow-y-auto">
                    <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="space-y-2">
                       <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                       <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                       <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* The Booste Widget */}
                  {config.type === 'embedded' ? (
                     // Embedded Preview
                     <div className="p-4">
                       <div className={`p-4 rounded-xl shadow-lg transform transition-all duration-300 ${selectedTheme.bg} ${selectedTheme.text} flex flex-col items-center text-center space-y-2`}>
                          <div className="flex -space-x-2">
                            {selectedGames.map(game => (
                               <span key={game.id} className="text-2xl bg-white/20 rounded-full p-1">{game.icon}</span>
                            ))}
                          </div>
                          <h3 className="font-bold">
                            {selectedGames.length > 1 ? 'Şans Oyunları' : selectedGames[0].name}
                          </h3>
                          <button className={`px-4 py-2 rounded-lg text-sm font-bold ${selectedTheme.primary} text-white`}>
                            Oyna & Kazan
                          </button>
                       </div>
                     </div>
                  ) : (
                    // Popup Preview
                     <div className="absolute bottom-4 right-4 z-20">
                        <div className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer ${selectedTheme.bg} ${selectedTheme.text}`}>
                           {/* Show icon of first selected game or a generic one */}
                           <span className="text-2xl">{selectedGames[0]?.icon || '🎁'}</span>
                        </div>
                     </div>
                  )}

                  {/* Popup Modal Mock (Active if Step 3) */}
                  {step === 3 && config.type === 'popup' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 animate-in fade-in zoom-in duration-300">
                      <div className={`w-full max-w-xs p-6 rounded-2xl shadow-2xl ${selectedTheme.bg} ${selectedTheme.text} text-center space-y-3`}>
                        <div className="flex justify-center -space-x-2 mb-2">
                            {selectedGames.map(game => (
                               <span key={game.id} className="text-3xl bg-white/20 rounded-full p-1">{game.icon}</span>
                            ))}
                        </div>
                        <h3 className="font-bold text-xl">
                            {selectedGames.length > 1 ? 'Bir Oyun Seç!' : selectedGames[0].name}
                        </h3>
                        <p className="opacity-80 text-sm">Şansını dene, indirim kazan!</p>
                        
                        {selectedGames.length > 1 ? (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {selectedGames.map(game => (
                                    <button key={game.id} className={`py-2 rounded-lg font-bold text-xs ${selectedTheme.primary} text-white shadow`}>
                                        {game.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <button className={`w-full py-2 rounded-lg font-bold mt-2 ${selectedTheme.primary} text-white shadow-lg`}>
                              Başla
                            </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
                
                {/* Phone Notch/Home Bar */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-xl z-20"></div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gray-400 rounded-full z-20"></div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">Temsili mobil görünüm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
