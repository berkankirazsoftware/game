import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Play, Gift, RotateCcw, Trophy, ArrowLeft } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

// Sabit oyun listesi
const GAMES = [
  {
    id: 'memory-game', 
    name: 'Hafıza',
    description: 'Kart eşleştirme',
    code: 'memory',
    image: 'https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'timing-game',
    name: 'Zamanlama',
    description: 'Çubuğu tam ortada durdur',
    code: 'timing',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
]

// Timing Game Component
function TimingGame({ onBack, coupons }: { onBack: () => void, coupons: Coupon[] }) {
  const [barPosition, setBarPosition] = useState(0)
  const [direction, setDirection] = useState(1)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [gameSpeed, setGameSpeed] = useState(30) // Daha hızlı hareket

  useEffect(() => {
    if (gameRunning && !gameCompleted) {
      const gameInterval = setInterval(moveBar, gameSpeed)
      return () => clearInterval(gameInterval)
    }
  }, [barPosition, direction, gameRunning, gameCompleted, gameSpeed])

  const moveBar = () => {
    setBarPosition(prev => {
      let newPos = prev + direction * 3 // Daha hızlı hareket
      let newDir = direction

      if (newPos >= 100) {
        newPos = 100
        newDir = -1
      } else if (newPos <= 0) {
        newPos = 0
        newDir = 1
      }
      
      setDirection(newDir)
      return newPos
    })
  }

  const stopBar = () => {
    if (!gameRunning) return
    
    setGameRunning(false)
    setGameCompleted(true)
    
    // Pozisyona göre kupon seviyesi belirle
    let level = 1
    if (barPosition >= 45 && barPosition <= 55) { // Altın bölge daha dar
      level = 3 // Tam orta - en iyi kupon
    } else if (barPosition >= 35 && barPosition <= 65) { // Gümüş bölge daha dar
      level = 2 // Orta bölge - orta kupon
    } else {
      level = 1 // Kenar bölgeler - düşük kupon
    }
    
    // Seviyeye göre kupon seç
    if (coupons.length > 0) {
      const levelCoupons = coupons.filter(c => c.level === level)
      const randomCoupon = levelCoupons.length > 0 
        ? levelCoupons[Math.floor(Math.random() * levelCoupons.length)]
        : coupons[Math.floor(Math.random() * coupons.length)]
      setWonCoupon(randomCoupon)
    }
  }

  const startGame = () => {
    setGameRunning(true)
    setGameCompleted(false)
    setBarPosition(0)
    setDirection(1)
    setWonCoupon(null)
  }

  const resetGame = () => {
    setGameCompleted(false)
    setGameRunning(false)
    setBarPosition(0)
    setDirection(1)
    setWonCoupon(null)
  }

  const getLevelInfo = (level: number) => {
    const levelData = {
      1: { name: 'Bronz', color: 'text-yellow-600', icon: '🥉' },
      2: { name: 'Gümüş', color: 'text-gray-600', icon: '🥈' },
      3: { name: 'Altın', color: 'text-yellow-500', icon: '🥇' }
    }
    return levelData[level as keyof typeof levelData]
  }

  return (
    <div className="h-full flex flex-col">
      {/* Game Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
      {/* Header */}
        <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
            Oyun Seçimine Dön
        </button>
          <div className="text-center">
            <div className="bg-indigo-100 px-3 py-1 rounded-full">
              <span className="font-semibold text-indigo-800">Zamanlama Oyunu</span>
          </div>
          </div>
        </div>

      {/* Game Won Modal */}
      {gameCompleted && wonCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tebrikler! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              Çubuğu durdurdunuz ve kupon kazandınız!
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <Gift className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-lg font-bold text-green-800">{wonCoupon.code}</span>
              </div>
              <p className="text-green-700 font-medium">
                {wonCoupon.discount_type === 'percentage' ? '%' : '₺'}{wonCoupon.discount_value} İndirim
              </p>
              <p className="text-green-600 text-sm mt-1">
                {wonCoupon.description}
              </p>
            </div>
            
            <button
              onClick={resetGame}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tekrar Oyna
            </button>
          </div>
        </div>
      )}

      {/* Game Area */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 shadow-lg">
          {/* Timing Bar */}
          <div className="relative w-full h-16 bg-gray-800 rounded-xl overflow-hidden mb-6 shadow-inner">
            {/* Level Zones */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">🥉</span>
              </div>
              <div className="w-[30%] bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">🥈</span>
              </div>
              <div className="w-[20%] bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">🥇</span>
              </div>
              <div className="w-[30%] bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">🥈</span>
              </div>
              <div className="flex-1 bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">🥉</span>
              </div>
            </div>
            
            {/* Moving Bar */}
            <div 
              className="absolute top-0 w-1 h-full bg-white shadow-lg transition-all duration-75"
              style={{ left: `${barPosition}%` }}
            />
          </div>
          
          <div className="text-center space-y-4">
            {!gameRunning && !gameCompleted && (
              <div>
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Oyunu Başlat
                </button>
                <p className="text-gray-600 text-sm mt-2">
                  Çubuğu tam ortada durdurmaya çalışın
                </p>
              </div>
            )}
            
            {gameRunning && (
              <div>
                <button
                  onClick={stopBar}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
                >
                  DURDUR!
                </button>
                <p className="text-gray-600 text-sm mt-2">
                  Çubuğu durdurmak için tıklayın!
                </p>
              </div>
            )}
          </div>
        </div>
        </div>

      {/* Sidebar - Kupon Bilgileri */}
        <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">🎯 Kupon Seviyeleri</h3>
          <div className="space-y-2">
            {[1, 2, 3].map(level => {
              const info = getLevelInfo(level)
              const levelCoupons = coupons.filter(c => c.level === level)
              
              return (
                <div key={level} className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{info.icon} {info.name}</span>
                  </div>
                  {levelCoupons.length > 0 ? (
                    <div className="text-sm">
                      <div className="font-semibold text-green-800">{levelCoupons[0].code}</div>
                      <div className="text-green-700">
                        {levelCoupons[0].discount_type === 'percentage' ? '%' : '₺'}{levelCoupons[0].discount_value} İndirim
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Kupon yok</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-lg border border-green-100">
          <h3 className="font-semibold text-green-900 mb-2">📋 Nasıl Oynanır?</h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Çubuk sağa sola hareket eder</li>
            <li>• Tam ortada durdurmaya çalışın</li>
            <li>• 🥇 Yeşil bölge = Altın kupon</li>
            <li>• 🥈 Sarı bölge = Gümüş kupon</li>
            <li>• 🥉 Kırmızı bölge = Bronz kupon</li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  )
}

// Memory Game Component
function MemoryGame({ onBack, coupons }: { onBack: () => void, coupons: Coupon[] }) {
  const [cards, setCards] = useState<Array<{id: number, symbol: string, isFlipped: boolean, isMatched: boolean}>>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸']

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const gameCards: Array<{id: number, symbol: string, isFlipped: boolean, isMatched: boolean}> = []
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5).slice(0, 6) // 6 çift = 12 kart
    
    // Her sembolden 2 tane oluştur
    shuffledSymbols.forEach((symbol, index) => {
      gameCards.push(
        { id: index * 2, symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
      )
    })
    
    // Kartları karıştır
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
  }

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || flippedCards.length >= 2) return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)
    
    // Kartı çevir
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)
      
      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)
      
      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Eşleşme var
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ))
          setMatchedPairs(prev => prev + 1)
          setFlippedCards([])
          
          // Oyun tamamlandı mı kontrol et
          if (matchedPairs + 1 === 6) { // 6 çift için güncellendi
            handleGameWin()
          }
        }, 1000)
      } else {
        // Eşleşme yok
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const handleGameWin = () => {
    setGameCompleted(true)
    setGameStarted(false)
    
    // Hamle sayısına göre kupon seviyesi belirle
    let level = 1
    if (moves <= 12) {
      level = 3 // Altın kupon - 12 hamle veya az
    } else if (moves <= 20) {
      level = 2 // Gümüş kupon - 13-20 hamle
    } else {
      level = 1 // Bronz kupon - 20+ hamle
    }
    
    // Seviyeye göre kupon seç
    if (coupons.length > 0) {
      const levelCoupons = coupons.filter(c => c.level === level)
      const randomCoupon = levelCoupons.length > 0 
        ? levelCoupons[Math.floor(Math.random() * levelCoupons.length)]
        : coupons[Math.floor(Math.random() * coupons.length)]
      setWonCoupon(randomCoupon)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameCompleted(false)
    setMoves(0)
    setMatchedPairs(0)
    setFlippedCards([])
    setWonCoupon(null)
    initializeGame()
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setMoves(0)
    setMatchedPairs(0)
    setFlippedCards([])
    setWonCoupon(null)
    initializeGame()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Oyun Seçimine Dön
        </button>
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 px-3 py-1 rounded-full">
            <span className="font-semibold text-indigo-800">Hamle: {moves}</span>
          </div>
          <div className="bg-green-100 px-3 py-1 rounded-full">
            <span className="font-semibold text-green-800">Eşleşen: {matchedPairs}/6</span>
          </div>
        </div>
      </div>

      {/* Game Won Modal */}
      {gameCompleted && wonCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tebrikler! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              Hafıza oyununu {moves} hamlede tamamladınız ve kupon kazandınız!
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <Gift className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-lg font-bold text-green-800">{wonCoupon.code}</span>
              </div>
              <p className="text-green-700 font-medium">
                {wonCoupon.discount_type === 'percentage' ? '%' : '₺'}{wonCoupon.discount_value} İndirim
              </p>
              <p className="text-green-600 text-sm mt-1">
                {wonCoupon.description}
              </p>
            </div>
            
            <button
              onClick={resetGame}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tekrar Oyna
            </button>
          </div>
        </div>
      )}

      {/* Game Area with Sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 shadow-lg">
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${
                card.isFlipped || card.isMatched
                  ? card.isMatched
                    ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                    : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                  : 'bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white'
              }`}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </div>
          ))}
        </div>

          <div className="text-center space-y-4">
        {!gameStarted && !gameCompleted && (
          <div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Oyunu Başlat
            </button>
            <p className="text-gray-600 text-sm mt-2">
              Kartları çevirerek eşleşen çiftleri bulun
            </p>
          </div>
        )}
        
        {gameStarted && (
          <div className="flex justify-center space-x-4">
            <p className="text-gray-600">
              Kartları çevirerek eşleşen çiftleri bulun!
            </p>
            <button
              onClick={resetGame}
              className="text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Yeniden Başla
            </button>
          </div>
        )}
      </div>
          </div>
        </div>

        {/* Sidebar - Kupon Bilgileri */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-3">🎯 Kupon Seviyeleri</h3>
            <div className="space-y-2">
              {[
                { level: 3, moves: '≤12 hamle', icon: '🥇', name: 'Altın' },
                { level: 2, moves: '13-20 hamle', icon: '🥈', name: 'Gümüş' },
                { level: 1, moves: '>20 hamle', icon: '🥉', name: 'Bronz' }
              ].map(({ level, moves, icon, name }) => {
                const levelCoupons = coupons.filter(c => c.level === level)
                
                return (
                  <div key={level} className="bg-white p-3 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{icon} {name}</span>
                      <span className="text-xs text-gray-500">{moves}</span>
                    </div>
                    {levelCoupons.length > 0 ? (
                      <div className="text-sm">
                        <div className="font-semibold text-green-800">{levelCoupons[0].code}</div>
                        <div className="text-green-700">
                          {levelCoupons[0].discount_type === 'percentage' ? '%' : '₺'}{levelCoupons[0].discount_value} İndirim
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Kupon yok</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-lg border border-green-100">
            <h3 className="font-semibold text-green-900 mb-2">📋 Nasıl Oynanır?</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Kartlara tıklayarak çevirin</li>
              <li>• Aynı sembolleri eşleştirin</li>
              <li>• Az hamle = Daha iyi kupon</li>
              <li>• 🥇 12 hamle veya az = Altın</li>
              <li>• 🥈 13-20 hamle = Gümüş</li>
              <li>• 🥉 20+ hamle = Bronz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Puzzle Game Component
function PuzzleGame({ onBack, coupons }: { onBack: () => void, coupons: Coupon[] }) {
  const [pieces, setPieces] = useState<Array<{id: number, correctPos: number, currentPos: number}>>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    initializeGame()
  }, [])
}

export default function GameSelectWidget() {
  const [searchParams] = useSearchParams()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('level', { ascending: true })

      if (error) throw error
      setCoupons(data || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGameSelect = (gameCode: string) => {
    setSelectedGame(gameCode)
  }

  const handleBackToSelection = () => {
    setSelectedGame(null)
  }

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (selectedGame === 'timing') {
    return <TimingGame onBack={handleBackToSelection} coupons={coupons} />
  }

  if (selectedGame === 'memory') {
    return <MemoryGame onBack={handleBackToSelection} coupons={coupons} />
  }

  return (
    <div className="h-[600px] overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg">
            <h1 className="text-xl font-bold">🎮 Oyna Kazan</h1>
          </div>
        </div>

        {/* Games Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            {GAMES.map((game) => (
              <div
                key={game.id}
                onClick={() => handleGameSelect(game.code)}
                className="bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer group h-40 flex flex-col justify-center items-center text-center"
              >
                <div className="mb-3">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-16 h-16 rounded-lg object-cover mx-auto shadow-md"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{game.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-700">
                  <Play className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Oyna</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}