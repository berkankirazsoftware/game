import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { GamepadIcon, Play, Gift } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

// Sabit oyun listesi - veritabanına istek atmaya gerek yok
const GAMES = [
  {
    id: 'snake-game',
    name: 'Yılan Oyunu',
    description: 'Ok tuşları ile yılanı yönlendirin ve yemi toplayın. 50 puana ulaşınca kupon kazanın!',
    code: 'snake',
    emoji: '🐍'
  },
  {
    id: 'memory-game', 
    name: 'Hafıza Oyunu',
    description: 'Kartları çevirerek eşleşen çiftleri bulun. Tüm çiftleri eşleştirince kupon kazanın!',
    code: 'memory',
    emoji: '🧠'
  }
]

export default function GameSelectWidget() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [userId])

  const fetchCoupons = async () => {
    try {
      if (userId) {
        console.log('Fetching coupons for user:', userId)
        const { data: couponsData, error: couponsError } = await supabase
          .from('coupons')
          .select('*')
          .eq('user_id', userId)

        console.log('Coupons query result:', { couponsData, couponsError })

        if (couponsData && !couponsError) {
          setCoupons(couponsData)
        } else {
          console.error('Error fetching coupons:', couponsError)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayGame = (game: typeof GAMES[0]) => {
    let gameUrl = ''
    if (game.code === 'memory') {
      gameUrl = `/memory/${game.id}?userId=${userId}`
    } else {
      gameUrl = `/game/${game.id}?userId=${userId}`
    }
    window.open(gameUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Kuponlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">🎮 Oyun Oyna, Kupon Kazan!</h1>
            <p className="text-indigo-100">
              Oyun oynayarak özel indirim kuponları kazanın
            </p>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oynamak İstediğiniz Oyunu Seçin
              </h2>
              <p className="text-gray-600">
                Her oyunu başarıyla tamamladığınızda özel kuponlar kazanacaksınız
              </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {GAMES.map((game) => (
                <div
                  key={game.id}
                  className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{game.emoji}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {game.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {game.description}
                    </p>
                    <button
                      onClick={() => handlePlayGame(game)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Oyunu Başlat
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Available Coupons */}
            {coupons.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center justify-center">
                  <Gift className="h-6 w-6 mr-2" />
                  Kazanabileceğiniz Kuponlar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white p-4 rounded-lg border border-green-200 text-center shadow-sm">
                      <div className="font-bold text-green-800 text-lg">{coupon.code}</div>
                      <div className="text-green-700 font-semibold">
                        {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value} İndirim
                      </div>
                      <div className="text-green-600 text-sm mt-1">{coupon.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🎯 Nasıl Çalışır?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                    <span>Yukarıdaki oyunlardan birini seçin</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                    <span>Oyunu başarıyla tamamlayın</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                    <span>Rastgele kupon kazanın</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
                    <span>Kuponu alışverişte kullanın</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}