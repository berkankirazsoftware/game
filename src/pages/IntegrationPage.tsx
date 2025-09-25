import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Copy, ExternalLink, CheckCircle, Plus, Gamepad as GamepadIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

export default function IntegrationPage() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [user])


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

      {/* Nasıl Çalışır Açıklaması */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">🎯 Sistem Nasıl Çalışır?</h3>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
          <h4 className="font-bold text-red-900 mb-3 flex items-center">
            ⚠️ ÖNEMLİ: İlk Adım - Kuponları Tanımlayın
          </h4>
          <p className="text-red-800 mb-3">
            Widget'ı kullanmadan önce <strong>mutlaka 3 seviyenin tamamında kupon tanımlamalısınız</strong>. 
            Bu kuponlar sizin e-ticaret sisteminizde geçerli olan kuponlar olmalıdır.
          </p>
          <div className="bg-white p-4 rounded border border-red-200">
            <p className="text-red-700 text-sm">
              <strong>Dikkat:</strong> Burada tanımladığınız kupon kodları, kendi e-ticaret sisteminizde 
              (İkas, WooCommerce, Shopify, Kendi siteniz vb.) önceden oluşturulmuş ve aktif olmalıdır. 
              Aksi takdirde müşteriler kuponu kullanamaz!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Adım Adım Süreç</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Kuponları Tanımlayın</h5>
                  <p className="text-gray-600 text-sm">3 seviyede kupon oluşturun (Level 1, 2, 3). Bu kuponlar kendi sisteminizde mevcut olmalı.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Widget'ı Sitenize Ekleyin</h5>
                  <p className="text-gray-600 text-sm">Aşağıdaki iframe kodunu kopyalayıp sitenizin istediğiniz yerine yapıştırın.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Müşteriler Oyun Oynar</h5>
                  <p className="text-gray-600 text-sm">Müşterileriniz widget'tan oyun seçer ve oynar.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Başarıya Göre Kupon Verilir</h5>
                  <p className="text-gray-600 text-sm">Oyun başarısına göre Level 1, 2 veya 3 kuponlarından biri verilir.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">5</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Kupon Kullanılır</h5>
                  <p className="text-gray-600 text-sm">Müşteri kuponu alışveriş sırasında kullanır ve indirim kazanır.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🎮 Oyun ve Kupon Sistemi</h4>
            
           

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-semibold text-yellow-900 mb-2">Kupon Seviyeleri</h5>
              <div className="space-y-2 text-yellow-800 text-sm">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🥉</span>
                  <span><strong>Level 1:</strong> Az başarılı oyunculara (düşük skor)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-2">🥈</span>
                  <span><strong>Level 2:</strong> Orta başarılı oyunculara (orta skor)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-2">🥇</span>
                  <span><strong>Level 3:</strong> Çok başarılı oyunculara (yüksek skor)</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h5 className="font-semibold text-green-900 mb-2">💡 Önemli Notlar</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Kuponlar otomatik olarak oyun başarısına göre verilir</li>
                <li>• Her kuponun stok miktarı vardır</li>
                <li>• Stok bitince o kupon verilemez</li>
                <li>• Kupon kodları kendi sisteminizde geçerli olmalı</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Integration Code - Only show if coupons exist */}
        {coupons.length > 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">🔧 Widget Entegrasyon Kodu</h3>
            
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
                <button
                  onClick={() => window.open(generateIframeUrl(), '_blank')}
                  className="flex ml-3 items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Widget'ı Önizle
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


             

              <div className="bg-indigo-50 p-6 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-4">📝 Entegrasyon Rehberi</h4>
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-2">WordPress için:</h4>
                  <ol className="text-indigo-700 space-y-2 text-sm">
                    <li>1. Sayfa/yazı düzenleyicisini açın</li>
                    <li>2. HTML bloğu ekleyin</li>
                    <li>3. iframe kodunu yapıştırın</li>
                    <li>4. Sayfayı kaydedin</li>
                  </ol>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-indigo-800 mb-2">Diğer Platformlar için:</h4>
                  <ol className="text-indigo-700 space-y-2 text-sm">
                    <li>1. HTML düzenleme moduna geçin</li>
                    <li>2. iframe kodunu istediğiniz yere yapıştırın</li>
                    <li>3. Değişiklikleri kaydedin ve yayınlayın</li>
                  </ol>
                </div>
                <div className="mt-6 bg-yellow-100 border border-yellow-300 p-4 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Sorun Giderme:</h4>
                  <p className="text-yellow-700 text-sm">
                    Eğer iframe "Widget Hazır Değil" gösteriyorsa, 3 seviyenin tamamında kupon tanımladığınızdan emin olun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Widget Hazır Değil
              </h3>
              <p className="text-gray-600 mb-4">
                Widget'ı kullanabilmek için önce <strong>3 seviyenin tamamında kupon</strong> eklemelisiniz
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Level 1, Level 2 ve Level 3 kuponlarının hepsini tanımlamalısınız
              </p>
              <Link
                to="/coupons"
                className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Kuponları Tanımlamaya Başlayın
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}