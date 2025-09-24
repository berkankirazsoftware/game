import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Copy, ExternalLink, Code, Settings, CheckCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

export default function IntegrationPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchGames()
    fetchCoupons()
  }, [user])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setGames(data)
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
    }
  }

  const generateIframeUrl = () => {
    const baseUrl = 'https://berkankirazsoftware-8isq.bolt.host'
    return `${baseUrl}/game-widget?userId=${user?.id}`
  }

  const generateIframeCode = () => {
    const iframeUrl = generateIframeUrl()
    return `<iframe 
  src="${iframeUrl}" 
  width="800" 
  height="600" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`
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
          E-ticaret sitenize oyun widget'ını entegre edin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Integration Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Entegrasyon Bilgileri</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Mevcut Oyunlar (2)</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-blue-800">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    🐍 Yılan Oyunu
                  </div>
                  <div className="flex items-center text-blue-800">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    🧠 Hafıza Oyunu
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Mevcut Kuponlar ({coupons.length})</h4>
                <div className="space-y-2">
                  {coupons.length > 0 ? coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between text-green-800">
                      <span className="font-medium">{coupon.code}</span>
                      <span className="text-sm">
                        {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-green-700 text-sm mb-3">Henüz kupon eklenmemiş</p>
                      <p className="text-green-600 text-xs">Kuponlar sayfasından kupon ekleyin</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nasıl Çalışır?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                <p>Müşteriler iframe'den mevcut oyunları görür</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                <p>Oyun seçip başarıyla tamamlar</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                <p>Rastgele kupon kazanır</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                <p>Kuponu e-ticaret sitenizde kullanır</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Code - Only show if coupons exist */}
        {coupons.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Entegrasyon Kodu</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget URL (Test için)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={generateIframeUrl()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generateIframeUrl())}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML iframe Kodu
                </label>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto">
                    <code>{generateIframeCode()}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(generateIframeCode())}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition-colors flex items-center"
                  >
                    {copied ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
              </div>


              <div className="flex space-x-3">
                <button
                  onClick={() => window.open(generateIframeUrl(), '_blank')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Widget'ı Önizle
                </button>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-2">WordPress için:</h4>
                  <ol className="text-indigo-700 space-y-1 text-sm">
                    <li>1. Sayfa/yazı düzenleyicisini açın</li>
                    <li>2. HTML bloğu ekleyin</li>
                    <li>3. iframe kodunu yapıştırın</li>
                    <li>4. Sayfayı kaydedin</li>
                  </ol>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-indigo-800 mb-2">Diğer Platformlar için:</h4>
                  <ol className="text-indigo-700 space-y-1 text-sm">
                    <li>1. HTML düzenleme moduna geçin</li>
                    <li>2. iframe kodunu istediğiniz yere yapıştırın</li>
                    <li>3. Değişiklikleri kaydedin ve yayınlayın</li>
                  </ol>
                </div>
                <div className="mt-4 bg-yellow-100 border border-yellow-300 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Sorun Giderme:</h4>
                  <p className="text-yellow-700 text-sm">
                    Eğer iframe "Widget Hazır Değil" gösteriyorsa, tarayıcı konsolunu açıp hata mesajlarını kontrol edin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Widget Hazır Değil
              </h3>
              <p className="text-gray-600 mb-6">
                Widget'ı kullanabilmek için önce kupon eklemelisiniz
              </p>
              <Link
                to="/coupons"
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                İlk Kuponunuzu Ekleyin
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}