import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { GamepadIcon, Play, Gift } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

export default function GameSelectWidget() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGamesAndCoupons()
  }, [userId])

  const fetchGamesAndCoupons = async () => {
    try {
      console.log('Fetching all games and user coupons for userId:', userId)
      
      // Tüm mevcut oyunları getir
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Games query result:', { gamesData, gamesError })

      if (gamesData && !gamesError) {
        setGames(gamesData)
        if (gamesData.length > 0) {
          setSelectedGame(gamesData[0])
        }
      } else {
        console.error('Error fetching games:', gamesError)
      }

      // Kuponları getir (sadece userId varsa)
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

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
  }

  const handlePlayGame = () => {
    if (selectedGame) {
      let gameUrl = ''
      if (selectedGame.code === 'memory') {
        gameUrl = `/memory/${selectedGame.id}?userId=${userId}`
      } else {
        gameUrl = `/game/${selectedGame.id}?userId=${userId}`
      }
      window.open(gameUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Oyunlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <GamepadIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Henüz oyun bulunmuyor</h2>
          <p className="text-gray-600">
            Sistem yöneticisi tarafından oyun eklenmesi bekleniyor.
          </p>
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
            {games.length === 1 ? (
              // Single game - direct play
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <GamepadIcon className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedGame?.name}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedGame?.description}
                  </p>
                  
                  {coupons.length > 0 && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-green-800 mb-2 flex items-center justify-center">
                        <Gift className="h-5 w-5 mr-2" />
                        Kazanabileceğiniz Kuponlar
                      </h3>
                      <div className="space-y-2">
                        {coupons.map((coupon) => (
                          <div key={coupon.id} className="bg-white p-2 rounded border border-green-200">
                            <span className="font-bold text-green-800">{coupon.code}</span>
                            <span className="text-green-700 ml-2">
                              ({coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value} İndirim)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handlePlayGame}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center mx-auto"
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Oyunu Başlat
                  </button>
                </div>
              </div>
            ) : (
              // Multiple games - selection
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Oynamak İstediğiniz Oyunu Seçin
                  </h2>
                  <p className="text-gray-600">
                    Her oyunu başarıyla tamamladığınızda özel kuponlar kazanacaksınız
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedGame?.id === game.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleGameSelect(game)}
                    >
                      <div className="text-center">
                        <GamepadIcon className={`h-12 w-12 mx-auto mb-3 ${
                          selectedGame?.id === game.id ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {game.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {game.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedGame && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {selectedGame.name} - Hazır mısınız?
                      </h3>
                      
                      {coupons.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center justify-center">
                            <Gift className="h-5 w-5 mr-2" />
                            Kazanabileceğiniz Kuponlar
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {coupons.map((coupon) => (
                              <div key={coupon.id} className="bg-white p-3 rounded border border-green-200">
                                <div className="font-bold text-green-800">{coupon.code}</div>
                                <div className="text-green-700 text-sm">
                                  {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value} İndirim
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={handlePlayGame}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center mx-auto"
                      >
                        <Play className="h-6 w-6 mr-2" />
                        Oyunu Başlat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}