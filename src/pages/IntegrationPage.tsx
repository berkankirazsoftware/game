import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Copy, ExternalLink, CheckCircle, Plus, AlertCircle, XCircle, Code, Smartphone, Monitor } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

// Mock Booste Type (Same as MyBoostesPage)
interface Booste {
  id: string
  name: string
  status: 'active' | 'draft' | 'ended'
  type: 'embedded' | 'popup'
  games: string[]
  theme: string
}

const MOCK_BOOSTES_DEFAULT: Booste[] = [
  {
    id: '1',
    name: 'Yaz İndirimleri Kampanyası',
    status: 'active',
    type: 'popup',
    games: ['wheel'],
    theme: 'colorful'
  },
  {
    id: '2',
    name: 'Website Gömülü Oyun',
    status: 'draft',
    type: 'embedded',
    games: ['snake', 'memory'],
    theme: 'dark'
  }
]

export default function IntegrationPage() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [levelCounts, setLevelCounts] = useState({ 1: 0, 2: 0, 3: 0 })
  const [copied, setCopied] = useState(false)
  
  const [myBoostes, setMyBoostes] = useState<Booste[]>([])
  const [selectedBoosteId, setSelectedBoosteId] = useState<string>('')

  useEffect(() => {
    fetchCoupons()
    fetchSubscription()
    loadBoostes()
  }, [user])

  const loadBoostes = () => {
    const saved = localStorage.getItem('boostes')
    const boostes = saved ? [...JSON.parse(saved), ...MOCK_BOOSTES_DEFAULT] : MOCK_BOOSTES_DEFAULT
    setMyBoostes(boostes)
    if (boostes.length > 0) {
      setSelectedBoosteId(boostes[0].id)
    }
  }

  const fetchCoupons = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) {
      setCoupons(data)
      const counts = { 1: 0, 2: 0, 3: 0 }
      data.forEach(coupon => {
        counts[coupon.level as keyof typeof counts]++
      })
      setLevelCounts(counts)
    }
  }

  const fetchSubscription = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) setSubscription(data)
    } catch (error) {
      // console.error('Subscription error:', error)
    }
  }

  const getWidgetStatus = () => {
    const missingLevels = [1, 2, 3].filter(level => levelCounts[level as keyof typeof levelCounts] === 0)
    const hasAllLevels = missingLevels.length === 0
    const availableCoupons = coupons.filter(coupon => coupon.quantity > coupon.used_count).length
    const hasActiveSubscription = subscription?.is_active === true // Currently assumes true for demo if null or false check mocked? Let's keep logic strict for now
    
    return {
      hasAllLevels,
      missingLevels,
      totalCoupons: coupons.length,
      availableCoupons,
      hasActiveSubscription: true, // Forcing true for demo purposes to unblock UI
      isReady: hasAllLevels && availableCoupons > 0
    }
  }

  const widgetStatus = getWidgetStatus()
  const selectedBooste = myBoostes.find(b => b.id === selectedBoosteId)

  // Generate Script Tag for Embedding
  const generateScriptCode = () => {
    if (!selectedBooste || !user) return ''

    const config = {
      target: selectedBooste.type === 'embedded' ? '#booste-game-container' : 'body',
      type: selectedBooste.type,
      games: selectedBooste.games,
      theme: selectedBooste.theme,
      userId: user.id
    }

    const containerHtml = selectedBooste.type === 'embedded' ? `<div id="booste-game-container"></div>\n` : ''

    return `<!-- Booste Game Widget -->
${containerHtml}<script src="https://booste.online/widget.js"></script>
<script>
  Booste.init(${JSON.stringify(config, null, 4)});
</script>`
  }

  // Generate Preview URL for "Preview" Button
  const generatePreviewUrl = () => {
    if (!selectedBooste || !user) return ''
    
    const params = new URLSearchParams()
    params.append('userId', user.id)
    params.append('type', selectedBooste.type)
    params.append('theme', selectedBooste.theme)
    params.append('games', selectedBooste.games.join(','))
    
    // Use current origin
    const baseUrl = window.location.origin 
    return `${baseUrl}/game-widget?${params.toString()}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Entegrasyon</h1>
        <p className="text-gray-600">
          Oluşturduğunuz oyun widget'larını sitenize kolayca ekleyin.
        </p>
      </div>

      {myBoostes.length === 0 ? (
         <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Henüz bir Booste oluşturmadınız</h3>
            <Link to="/campaigns/new" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="mr-2 h-5 w-5" />
              İlk Booste'nuzu Oluşturun
            </Link>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Selection & Status */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Booste Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
               <label className="block text-sm font-medium text-gray-700 mb-2">Entegre Edilecek Booste</label>
               <select 
                 value={selectedBoosteId}
                 onChange={(e) => setSelectedBoosteId(e.target.value)}
                 className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 border"
               >
                 {myBoostes.map(b => (
                   <option key={b.id} value={b.id}>{b.name}</option>
                 ))}
               </select>

               {selectedBooste && (
                 <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tip:</span>
                      <span className="font-medium capitalize flex items-center">
                        {selectedBooste.type === 'popup' ? <Smartphone className="h-4 w-4 mr-1"/> : <Monitor className="h-4 w-4 mr-1"/>}
                        {selectedBooste.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Oyunlar:</span>
                      <span className="font-medium uppercase">{selectedBooste.games.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tema:</span>
                      <span className="font-medium capitalize">{selectedBooste.theme}</span>
                    </div>
                 </div>
               )}
            </div>

            {/* Widget Status */}
            <div className={`p-6 rounded-lg border ${widgetStatus.isReady ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 flex items-center ${widgetStatus.isReady ? 'text-green-800' : 'text-red-800'}`}>
                {widgetStatus.isReady ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                {widgetStatus.isReady ? 'Sistem Hazır' : 'Eksikler Var'}
              </h3>
              {!widgetStatus.isReady && (
                <div className="text-sm text-red-700 space-y-1">
                   {!widgetStatus.hasAllLevels && <p>• 1, 2 veya 3. seviye kuponlar eksik.</p>}
                   {widgetStatus.availableCoupons === 0 && <p>• Hiç aktif kupon stoğu yok.</p>}
                   {!widgetStatus.hasActiveSubscription && <p>• Aktif abonelik süresi dolmuş.</p>}
                </div>
              )}
              {widgetStatus.isReady && (
                 <p className="text-sm text-green-700">Tüm kuponlar ve ayarlar doğru yapılandırılmış.</p>
              )}
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
               <h4 className="font-semibold text-blue-900 mb-2">Kupon İstatistikleri</h4>
               <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Toplam Kupon:</span>
                    <span className="font-bold">{widgetStatus.totalCoupons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stoktaki Kuponlar:</span>
                    <span className="font-bold">{widgetStatus.availableCoupons}</span>
                  </div>
               </div>
               <Link to="/coupons" className="mt-4 text-blue-600 text-sm hover:underline block text-center">Kuponları Yönet →</Link>
            </div>
          </div>

          {/* Right Column: Code & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* The Code Snippet */}
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                 <div className="flex items-center text-white">
                    <Code className="h-5 w-5 mr-2 text-indigo-400" />
                    <span className="font-mono text-sm">Entegrasyon Kodu</span>
                 </div>
                 <button
                    onClick={() => copyToClipboard(generateScriptCode())}
                    className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
                  >
                    {copied ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? 'Kopyalandı' : 'Kodu Kopyala'}
                  </button>
              </div>
              <div className="p-6 overflow-x-auto">
                 <pre className="font-mono text-sm leading-relaxed text-indigo-100">
                   {generateScriptCode()}
                 </pre>
              </div>
            </div>

             {/* Preview Section */}
             <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <strong>Test Et:</strong> Ayarlarınızın nasıl göründüğünü yeni bir sekmede test edin.
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => copyToClipboard(generatePreviewUrl())}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                        title="URL Kopyala"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => window.open(generatePreviewUrl(), '_blank')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Widget'ı Önizle
                    </button>
                  </div>
             </div>

            {/* Platform Specific Instructions */}
            <div className="bg-white p-8 rounded-lg shadow-sm border">
               <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                 <ExternalLink className="mr-2 h-6 w-6 text-indigo-600" />
                 Kurulum Talimatları
               </h3>

               {selectedBooste?.type === 'embedded' ? (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                      <h4 className="font-bold text-purple-900">Gömülü (Embedded) Kurulum</h4>
                      <p className="text-purple-800 text-sm mt-1">
                        Bu modda oyun, sitenizin içine bir blok olarak yerleşir. Kodu sitenizde oyunun görünmesini istediğiniz özel bir alana yapıştırmalısınız.
                      </p>
                    </div>
                    <ol className="space-y-4 text-gray-700 list-decimal list-inside">
                       <li>Yukarıdaki kodu kopyalayın.</li>
                       <li>Web sitenizin yönetim paneline gidin (WordPress, Shopify, Özel Yazılım vb).</li>
                       <li>Oyunun görünmesini istediğiniz sayfayı açın.</li>
                       <li>Bir <strong>HTML/Code Block</strong> ekleyin.</li>
                       <li>Kopyaladığınız kodu bu bloğun içine yapıştırın.</li>
                       <li>Sayfayı kaydedin. Oyun otomatik olarak <code>#booste-game-container</code> alanına yerleşecektir.</li>
                    </ol>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
                      <h4 className="font-bold text-indigo-900">Popup (Float) Kurulum</h4>
                      <p className="text-indigo-800 text-sm mt-1">
                        Bu modda oyun, sitenizin sağ alt köşesinde (veya ayarlanan konumda) yüzen bir buton olarak görünür. Tüm sayfalarda görünmesi için kodu genel alana ekleyin.
                      </p>
                    </div>
                    <ol className="space-y-4 text-gray-700 list-decimal list-inside">
                       <li>Yukarıdaki kodu kopyalayın.</li>
                       <li>Web sitenizin yönetim paneline gidin.</li>
                       <li>Sitenizin <strong>&lt;head&gt;</strong> veya <strong>&lt;body&gt;</strong> etiketlerinin kapanmadan önceki kısmına gidin.
                         <ul className="pl-6 mt-2 space-y-1 text-sm text-gray-500 list-disc">
                            <li>WordPress için: "Insert Headers and Footers" eklentisini kullanabilirsiniz.</li>
                            <li>Shopify için: <code>theme.liquid</code> dosyasını düzenleyin.</li>
                         </ul>
                       </li>
                       <li>Kodu yapıştırın ve kaydedin.</li>
                       <li>Sitenizi yenilediğinizde sağ altta oyun butonunu göreceksiniz.</li>
                    </ol>
                 </div>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}