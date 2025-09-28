import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, supabaseUrl } from '../lib/supabase'
import { Play, Gift, RotateCcw, Trophy, ArrowLeft, Clock, Brain, Zap, Target, XCircle, CreditCard, CheckCircle } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

// Sabit oyun listesi
const GAMES = [
  {
    id: 'timing-game', 
    name: 'Zamanlama Oyunu',
    description: 'Çubuğu tam ortada durdur',
    code: 'timing',
    icon: Clock,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    color: 'purple'
  },
  {
    id: 'memory-game',
    name: 'Hafıza Oyunu',
    description: 'Kartları eşleştir',
    code: 'memory',
    icon: Brain,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    color: 'blue'
  }
]

// Timing Game Component
function TimingGame({ onBack, coupons }: { onBack: () => void, coupons: Coupon[] }) {
  const [barPosition, setBarPosition] = useState(0)
  const [direction, setDirection] = useState(1)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [gameSpeed, setGameSpeed] = useState(25)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    if (gameRunning && !gameCompleted) {
      const gameInterval = setInterval(moveBar, gameSpeed)
      return () => clearInterval(gameInterval)
    }
  }, [barPosition, direction, gameRunning, gameCompleted, gameSpeed])

  const moveBar = () => {
    setBarPosition(prev => {
      let newPos = prev + direction * 4
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
    
    let level = 1
    if (barPosition >= 47 && barPosition <= 53) {
      level = 3 // Altın bölge
    } else if (barPosition >= 40 && barPosition <= 60) {
      level = 2 // Gümüş bölge
    } else {
      level = 1 // Bronz bölge
    }
    
    if (coupons.length > 0) {
      const levelCoupons = coupons.filter(c => c.level === level)
      const randomCoupon = levelCoupons.length > 0 
        ? levelCoupons[Math.floor(Math.random() * levelCoupons.length)]
        : coupons[Math.floor(Math.random() * coupons.length)]
      setWonCoupon(randomCoupon)
      setShowEmailModal(true)
    }
  }

  const startGame = () => {
    setGameRunning(true)
    setGameCompleted(false)
    setBarPosition(0)
    setDirection(1)
    setWonCoupon(null)
    setShowEmailModal(false)
    setEmail('')
    setEmailSent(false)
    setEmailLoading(false)
  }

  const resetGame = () => {
    setGameCompleted(false)
    setGameRunning(false)
    setBarPosition(0)
    setDirection(1)
    setWonCoupon(null)
    setShowEmailModal(false)
    setEmail('')
    setEmailSent(false)
    setEmailLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !wonCoupon) return

    setEmailLoading(true)
    
    try {
      // Supabase Edge Function ile email gönder
      console.log('📧 Sending email to:', email)
      console.log('🎁 Coupon:', wonCoupon.code)
      console.log('🔗 Function URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-coupon-email`)
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-coupon-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          couponCode: wonCoupon.code,
          couponDescription: wonCoupon.description,
          discountType: wonCoupon.discount_type,
          discountValue: wonCoupon.discount_value,
          gameType: 'timing'
        })
      })

      console.log('📤 Email API response status:', response.status)
      const result = await response.json()
      console.log('📧 Email API result:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Email gönderilemedi')
      }

      // Email log kaydet (opsiyonel)
      if (userId && !testMode) {
        try {
          await supabase.from('email_logs').insert([{
            user_id: userId,
            email: email,
            coupon_code: wonCoupon.code,
            game_type: 'timing',
            discount_type: wonCoupon.discount_type,
            discount_value: wonCoupon.discount_value,
            email_service_id: result.emailId,
            status: 'sent'
          }])
        } catch (logError) {
          console.error('Email log error:', logError)
          // Log hatası email gönderimini engellemez
        }
      }
      
      setEmailSent(true)
      setShowEmailModal(false)
      
      // 3 saniye sonra success mesajını kapat
      setTimeout(() => {
        setEmailSent(false)
        resetGame()
      }, 3000)
    } catch (error) {
      console.error('Email gönderme hatası:', error)
      alert('Email gönderilirken hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setEmailLoading(false)
    }
  }

  const getLevelInfo = (level: number) => {
    const levelData = {
      1: { name: 'Bronz', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '🥉' },
      2: { name: 'Gümüş', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🥈' },
      3: { name: 'Altın', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '🥇' }
    }
    return levelData[level as keyof typeof levelData]
  }

  return (
    <div className="h-[600px] bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-2 md:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
          <button
            onClick={onBack}
            className="flex items-center px-2 md:px-4 py-1 md:py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-purple-600 hover:text-purple-700 border border-purple-100 text-sm md:text-base"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
            Geri Dön
          </button>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <Clock className="h-4 w-4 md:h-6 md:w-6 mr-1 md:mr-2" />
              <span className="text-sm md:text-xl font-bold">Zamanlama Oyunu</span>
            </div>
          </div>
          <div className="w-12 md:w-24"></div>
        </div>

        {/* Game Won Modal */}
        {showEmailModal && wonCoupon && !emailSent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 text-center shadow-2xl border border-purple-100">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Tebrikler! 🎉
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Kupon kazandınız! E-posta adresinizi girin:
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl mb-6">
               
                <p className="text-green-700 font-semibold text-lg">
                  {wonCoupon.discount_type === 'percentage' ? '%' : '₺'}{wonCoupon.discount_value} İndirim
                </p>
                <p className="text-green-600 mt-2">
                  {wonCoupon.description}
                </p>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresinizi girin"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                    <p className="text-blue-800 text-sm">
                      📧 Kupon kodunuz <strong>{email || 'email adresinize'}</strong> gönderilecek
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Gönderiliyor...
                      </div>
                    ) : (
                      'Kuponu Gönder'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Sent Success Modal */}
        {emailSent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 text-center shadow-2xl border border-green-100">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Kupon Gönderildi! ✅
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                Kupon kodunuz <strong>{email}</strong> adresine gönderildi.
              </p>
              <p className="text-sm text-gray-500">
                E-posta kutunuzu kontrol edin...
              </p>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0 overflow-auto">
          {/* Game Area */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl border border-purple-100">
              {/* Timing Bar Container */}
              <div className="relative w-full h-16 md:h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-inner mb-4 md:mb-8">
                {/* Level Zones */}
                <div className="absolute inset-0 flex">
                  {/* Bronz Sol */}
                  <div className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-lg drop-shadow-lg">🥉</span>
                  </div>
                  {/* Gümüş Sol */}
                  <div className="w-[20%] bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-lg drop-shadow-lg">🥈</span>
                  </div>
                  {/* Altın Merkez */}
                  <div className="w-[12%] bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center relative">
                    <span className="text-white font-bold text-sm md:text-lg drop-shadow-lg">🥇</span>
                    <div className="absolute inset-0 bg-yellow-300/30 animate-pulse"></div>
                  </div>
                  {/* Gümüş Sağ */}
                  <div className="w-[20%] bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-lg drop-shadow-lg">🥈</span>
                  </div>
                  {/* Bronz Sağ */}
                  <div className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-lg drop-shadow-lg">🥉</span>
                  </div>
                </div>
                
                {/* Moving Bar */}
                <div 
                  className="absolute top-0 w-1 md:w-2 h-full bg-gradient-to-b from-white to-gray-200 shadow-2xl transition-all duration-75 rounded-full"
                  style={{ left: `${barPosition}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute inset-0 bg-white/50 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="text-center space-y-4 md:space-y-6">
                {!gameRunning && !gameCompleted && (
                  <div>
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 md:px-12 py-3 md:py-4 rounded-2xl text-lg md:text-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      <Play className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 inline" />
                      Oyunu Başlat
                    </button>
                    <p className="text-gray-600 mt-3 md:mt-4 text-sm md:text-lg">
                      Çubuğu tam ortada durdurmaya çalışın!
                    </p>
                  </div>
                )}
                
                {gameRunning && (
                  <div>
                    <button
                      onClick={stopBar}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 md:px-12 py-3 md:py-4 rounded-2xl text-lg md:text-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl animate-pulse"
                    >
                      <Target className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 inline" />
                      DURDUR!
                    </button>
                    <p className="text-gray-600 mt-3 md:mt-4 text-sm md:text-lg">
                      Çubuğu durdurmak için tıklayın!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Kupon Bilgileri */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-purple-100">
              <h3 className="font-bold text-purple-900 mb-3 md:mb-4 text-base md:text-lg flex items-center">
                <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Kupon Seviyeleri
              </h3>
              <div className="space-y-3">
                {[3, 2, 1].map(level => {
                  const info = getLevelInfo(level)
                  const levelCoupons = coupons.filter(c => c.level === level)
                  
                  return (
                    <div key={level} className={`${info.bgColor} p-4 rounded-xl border-2 ${level === 3 ? 'border-yellow-300' : level === 2 ? 'border-gray-300' : 'border-orange-300'} shadow-sm`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold flex items-center text-sm md:text-base">
                          <span className="text-lg md:text-xl mr-2">{info.icon}</span>
                          {info.name}
                        </span>
                      </div>
                      {levelCoupons.length > 0 ? (
                        <div className="text-xs md:text-sm">
                          <div className="font-bold text-green-800">{levelCoupons[0].code}</div>
                          <div className="text-green-700 font-semibold">
                            {levelCoupons[0].discount_type === 'percentage' ? '%' : '₺'}{levelCoupons[0].discount_value} İndirim
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs md:text-sm text-gray-500">Kupon yok</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 rounded-2xl shadow-xl border border-purple-100">
              <h3 className="font-bold text-purple-900 mb-3 text-base md:text-lg flex items-center">
                <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Nasıl Oynanır?
              </h3>
              <ul className="text-purple-800 text-xs md:text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">🥇</span>
                  <span><strong>Altın:</strong> Tam ortada durdur</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">🥈</span>
                  <span><strong>Gümüş:</strong> Orta bölgede durdur</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🥉</span>
                  <span><strong>Bronz:</strong> Kenar bölgelerde</span>
                </li>
              </ul>
            </div>
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
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸']

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const gameCards: Array<{id: number, symbol: string, isFlipped: boolean, isMatched: boolean}> = []
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5).slice(0, 6)
    
    shuffledSymbols.forEach((symbol, index) => {
      gameCards.push(
        { id: index * 2, symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
      )
    })
    
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
  }

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || flippedCards.length >= 2) return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)
      
      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)
      
      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ))
          setMatchedPairs(prev => prev + 1)
          setFlippedCards([])
          
          if (matchedPairs + 1 === 6) {
            handleGameWin()
          }
        }, 1000)
      } else {
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
    
    let level = 1
    if (moves <= 12) {
      level = 3
    } else if (moves <= 18) {
      level = 2
    } else {
      level = 1
    }
    
    if (coupons.length > 0) {
      const levelCoupons = coupons.filter(c => c.level === level)
      const randomCoupon = levelCoupons.length > 0 
        ? levelCoupons[Math.floor(Math.random() * levelCoupons.length)]
        : coupons[Math.floor(Math.random() * coupons.length)]
      setWonCoupon(randomCoupon)
      setShowEmailModal(true)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameCompleted(false)
    setMoves(0)
    setMatchedPairs(0)
    setFlippedCards([])
    setWonCoupon(null)
    setShowEmailModal(false)
    setEmail('')
    setEmailSent(false)
    setEmailLoading(false)
    initializeGame()
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setMoves(0)
    setMatchedPairs(0)
    setFlippedCards([])
    setWonCoupon(null)
    setShowEmailModal(false)
    setEmail('')
    setEmailSent(false)
    setEmailLoading(false)
    initializeGame()
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !wonCoupon) return

    setEmailLoading(true)
    
    try {
      // Supabase Edge Function ile email gönder
      console.log('📧 Sending email to:', email)
      console.log('🎁 Coupon:', wonCoupon.code)
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-coupon-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          couponCode: wonCoupon.code,
          couponDescription: wonCoupon.description,
          discountType: wonCoupon.discount_type,
          discountValue: wonCoupon.discount_value,
          gameType: 'memory'
        })
      })

      console.log('📤 Email API response status:', response.status)
      const result = await response.json()
      console.log('📧 Email API result:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Email gönderilemedi')
      }

      // Email log kaydet (opsiyonel)
      if (userId && !testMode) {
        try {
          await supabase.from('email_logs').insert([{
            user_id: userId,
            email: email,
            coupon_code: wonCoupon.code,
            game_type: 'memory',
            discount_type: wonCoupon.discount_type,
            discount_value: wonCoupon.discount_value,
            email_service_id: result.emailId,
            status: 'sent'
          }])
        } catch (logError) {
          console.error('Email log error:', logError)
          // Log hatası email gönderimini engellemez
        }
      }
      
      setEmailSent(true)
      setShowEmailModal(false)
      
      // 3 saniye sonra success mesajını kapat
      setTimeout(() => {
        setEmailSent(false)
        resetGame()
      }, 3000)
    } catch (error) {
      console.error('Email gönderme hatası:', error)
      alert('Email gönderilirken hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="h-[600px] bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 p-2 md:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
          <button
            onClick={onBack}
            className="flex items-center px-2 md:px-4 py-1 md:py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-blue-600 hover:text-blue-700 border border-blue-100 text-sm md:text-base"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
            Geri Dön
          </button>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <Brain className="h-4 w-4 md:h-6 md:w-6 mr-1 md:mr-2" />
              <span className="text-sm md:text-xl font-bold">Hafıza Oyunu</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-xl shadow-lg border border-blue-100">
              <span className="font-bold text-blue-800 text-xs md:text-base">Hamle: {moves}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-xl shadow-lg border border-green-100">
              <span className="font-bold text-green-800 text-xs md:text-base">Eşleşen: {matchedPairs}/6</span>
            </div>
          </div>
        </div>

        {/* Game Won Modal */}
        {showEmailModal && wonCoupon && !emailSent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 text-center shadow-2xl border border-blue-100">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Tebrikler! 🎉
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Kupon kazandınız! E-posta adresinizi girin:
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-2xl mb-6">
               
                <p className="text-green-700 font-semibold text-lg">
                  {wonCoupon.discount_type === 'percentage' ? '%' : '₺'}{wonCoupon.discount_value} İndirim
                </p>
                <p className="text-green-600 mt-2">
                  {wonCoupon.description}
                </p>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresinizi girin"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                    <p className="text-blue-800 text-sm">
                      📧 Kupon kodunuz <strong>{email || 'email adresinize'}</strong> gönderilecek
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Gönderiliyor...
                      </div>
                    ) : (
                      'Kuponu Gönder'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Sent Success Modal */}
        {emailSent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 text-center shadow-2xl border border-green-100">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Kupon Gönderildi! ✅
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                Kupon kodunuz <strong>{email}</strong> adresine gönderildi.
              </p>
              <p className="text-sm text-gray-500">
                E-posta kutunuzu kontrol edin...
              </p>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0 overflow-auto">
          {/* Game Area */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl border border-blue-100">
              <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-sm md:max-w-lg mx-auto mb-4 md:mb-8">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl font-bold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                      card.isFlipped || card.isMatched
                        ? card.isMatched
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-200'
                          : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-blue-200'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-200'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? card.symbol : '?'}
                  </div>
                ))}
              </div>

              <div className="text-center space-y-4 md:space-y-6">
                {!gameStarted && !gameCompleted && (
                  <div>
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 md:px-12 py-3 md:py-4 rounded-2xl text-lg md:text-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      <Play className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 inline" />
                      Oyunu Başlat
                    </button>
                    <p className="text-gray-600 mt-3 md:mt-4 text-sm md:text-lg">
                      Kartları çevirerek eşleşen çiftleri bulun
                    </p>
                  </div>
                )}
                
                {gameStarted && (
                  <div className="flex justify-center space-x-4">
                    <p className="text-gray-600 text-sm md:text-lg">
                      Kartları çevirerek eşleşen çiftleri bulun!
                    </p>
                    <button
                      onClick={resetGame}
                      className="text-blue-600 hover:text-blue-700 flex items-center font-semibold text-sm md:text-base"
                    >
                      <RotateCcw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Yeniden Başla
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Kupon Bilgileri */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-3 md:mb-4 text-base md:text-lg flex items-center">
                <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Kupon Seviyeleri
              </h3>
              <div className="space-y-3">
                {[
                  { level: 3, moves: '≤12 hamle', icon: '🥇', name: 'Altın', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
                  { level: 2, moves: '13-18 hamle', icon: '🥈', name: 'Gümüş', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
                  { level: 1, moves: '>18 hamle', icon: '🥉', name: 'Bronz', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' }
                ].map(({ level, moves, icon, name, bgColor, borderColor }) => {
                  const levelCoupons = coupons.filter(c => c.level === level)
                  
                  return (
                    <div key={level} className={`${bgColor} p-4 rounded-xl border-2 ${borderColor} shadow-sm`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold flex items-center text-sm md:text-base">
                          <span className="text-lg md:text-xl mr-2">{icon}</span>
                          {name}
                        </span>
                        <span className="text-xs md:text-sm text-gray-600 font-medium">{moves}</span>
                      </div>
                      {levelCoupons.length > 0 ? (
                        <div className="text-xs md:text-sm">
                          <div className="font-bold text-green-800">{levelCoupons[0].code}</div>
                          <div className="text-green-700 font-semibold">
                            {levelCoupons[0].discount_type === 'percentage' ? '%' : '₺'}{levelCoupons[0].discount_value} İndirim
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs md:text-sm text-gray-500">Kupon yok</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-6 rounded-2xl shadow-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-3 text-base md:text-lg flex items-center">
                <Brain className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Nasıl Oynanır?
              </h3>
              <ul className="text-blue-800 text-xs md:text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">🥇</span>
                  <span><strong>Altın:</strong> 12 hamle veya az</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">🥈</span>
                  <span><strong>Gümüş:</strong> 13-18 hamle</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">🥉</span>
                  <span><strong>Bronz:</strong> 18+ hamle</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GameSelectWidget() {
  const [searchParams] = useSearchParams()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [email, setEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailResult, setEmailResult] = useState<{
    success: boolean
    message: string
    show: boolean
  }>({ success: false, message: '', show: false })
  const userId = searchParams.get('userId')
  const testMode = searchParams.get('testMode') === 'true'
  const debugMode = searchParams.get('debug') === 'true'

  useEffect(() => {
    console.log('🔍 Widget initialized with:', { userId, testMode, debugMode })
    console.log('🔍 Environment variables:', {
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      HAS_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    })
    fetchCoupons()
    if (!testMode) {
      fetchSubscription()
    }
  }, [])

  const fetchCoupons = async () => {
    try {
      if (userId && !testMode) {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('user_id', userId)
          .order('level', { ascending: true })

        if (error) throw error
        setCoupons(data || [])
      } else if (testMode) {
        // Test modu için varsayılan kuponlar
        setCoupons([
          {
            id: 'test-1',
            user_id: userId || '',
            code: 'TEST20',
            description: 'Test kuponu - %20 indirim',
            discount_type: 'percentage',
            discount_value: 20,
            level: 1,
            quantity: 10,
            used_count: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'test-2',
            user_id: userId || '',
            code: 'TEST30',
            description: 'Test kuponu - %30 indirim',
            discount_type: 'percentage',
            discount_value: 30,
            level: 2,
            quantity: 10,
            used_count: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'test-3',
            user_id: userId || '',
            code: 'TEST50',
            description: 'Test kuponu - %50 indirim',
            discount_type: 'percentage',
            discount_value: 50,
            level: 3,
            quantity: 10,
            used_count: 0,
            created_at: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscription = async () => {
    if (!userId) return
    
    if (debugMode) {
      console.log('🔍 Fetching subscription for userId:', userId)
    }
    
    try {
      // Query single subscription for user
      let { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      // If error is "no rows found", that's expected - user has no subscription
      if (error && error.code === 'PGRST116') {
        // No subscription found - this is normal
        setSubscription(null)
        if (debugMode) {
          console.log('🔍 No subscription found for user (expected)')
        }
        return
      }
      
      if (debugMode) {
        console.log('🔍 Subscription query result:', { data, error })
        console.log('🔍 Query URL would be:', `${supabaseUrl}/rest/v1/subscriptions?select=*&user_id=eq.${userId}`)
      }
      
      if (error) {
        console.error('Subscription fetch error:', error)
        setSubscription(null)
      } else {
        setSubscription(data)
        if (debugMode) {
          console.log('🔍 Subscription set to state:', data)
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setSubscription(null)
    }
  }

  const handleGameSelect = (gameCode: string) => {
    setSelectedGame(gameCode)
  }

  const handleBackToSelection = () => {
    setSelectedGame(null)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !wonCoupon) return

    try {
      setEmailSending(true)
      setEmailResult({ success: false, message: '', show: false })
      
      // Log email attempt
      console.log('📧 Sending email to:', email)
      console.log('🎁 Coupon:', wonCoupon.code)
      
      const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-coupon-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          couponCode: wonCoupon.code,
          couponDescription: wonCoupon.description,
          discountType: wonCoupon.discount_type,
          discountValue: wonCoupon.discount_value,
          gameType: 'general'
        })
      })

      const result = await emailResponse.json()
      console.log('📧 Email API response:', result)
      
      if (result && result.success) {
        setEmailResult({
          type: 'success',
          message: 'Email başarıyla gönderildi! Spam klasörünüzü de kontrol etmeyi unutmayın.',
          show: true
        })
      } else {
        setEmailResult({
          type: 'error',
          message: (result && result.error) || 'Email gönderilemedi',
          show: true
        })
      }
    } catch (error) {
      console.error('Email error:', error)
      setEmailResult({
        success: false,
        message: 'Email gönderilirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
        show: true
      })
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6 shadow-lg"></div>
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-gray-700 font-semibold">Oyunlar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Abonelik kontrolü
  const hasActiveSubscription = subscription?.is_active === true
  console.log(subscription)
  console.log(subscription?.is_active)

  if (debugMode) {
    console.log('🔍 Final subscription check:', { 
      subscription, 
      hasActiveSubscription, 
      testMode,
      userId,
      subscriptionExists: !!subscription,
      isActive: subscription?.is_active
    })
  }
  
  if (!testMode && !hasActiveSubscription) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-red-100 text-center">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Abonelik Gerekli
            </h2>
            <p className="text-gray-600 mb-6">
              Bu widget'ı kullanabilmek için aktif bir aboneliğiniz olmalı. 
              Lütfen site sahibi ile iletişime geçin.
            </p>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl mb-6">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-semibold text-orange-800">Abonelik Durumu</span>
              </div>
              <p className="text-orange-700 text-sm">
                {!subscription ? 'Abonelik bulunamadı' : `Abonelik durumu: ${subscription.is_active ? 'Aktif' : 'Pasif'}`}
              </p>
              {subscription && (
                <div className="text-orange-600 text-xs mt-2">
                  <p>Plan: {subscription.plan_type}</p>
                  <p>Aktif: {subscription.is_active ? 'Evet' : 'Hayır'}</p>
                  <p>Bitiş: {subscription.expiration_date || 'Belirsiz'}</p>
                </div>
              )}
              <div className="text-orange-600 text-xs mt-2 bg-orange-100 p-2 rounded">
                <p><strong>Debug:</strong></p>
                <p>User ID: {userId || 'Yok'}</p>
                <p>Subscription: {subscription ? 'Var' : 'Yok'}</p>
                <p>Active: {subscription?.is_active ? 'True' : 'False'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <p className="text-blue-800 text-sm">
                  <strong>Site Sahibi:</strong> Aboneliğinizi aktif etmek için GameCoupon ile iletişime geçin
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                <p className="text-gray-700 text-xs">
                  Widget URL: booste.online/game-widget
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Kupon kontrolü
  if (selectedGame === 'timing') {
    return <TimingGame onBack={handleBackToSelection} coupons={coupons} />
  }

  if (selectedGame === 'memory') {
    return <MemoryGame onBack={handleBackToSelection} coupons={coupons} />
  }

  return (
    <div className="h-[600px] overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-200 rounded-full opacity-20 animate-blob animation-delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white px-8 py-4 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm">
            <h1 className="text-3xl font-bold flex items-center justify-center">
              <Play className="h-8 w-8 mr-3" />
              Oyna & Kazan
            </h1>
            <p className="text-purple-100 mt-2">Oyun oyna, kupon kazan!</p>
          </div>
        </div>

        {/* Email Result Modal */}
        {emailResult.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
              <div className={`text-6xl mb-4 ${emailResult.success ? '' : ''}`}>
                {emailResult.success ? '✅' : '❌'}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                emailResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {emailResult.success ? 'Email Gönderildi!' : 'Email Gönderilemedi'}
              </h3>
              <p className={`mb-6 ${
                emailResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {emailResult.message}
              </p>
              
              {emailResult.success && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 İpucu:</strong> Email gelmezse spam klasörünüzü kontrol edin.
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setEmailResult({ success: false, message: '', show: false })}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  emailResult.success 
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Tamam
              </button>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && wonCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tebrikler! Kupon Kazandınız!
              </h3>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                <p className="text-green-800 font-semibold text-lg">
                  {wonCoupon.code}
                </p>
                <p className="text-green-700">
                  {wonCoupon.discount_type === 'percentage' ? '%' : '₺'}{wonCoupon.discount_value} İndirim
                </p>
                <p className="text-green-600 text-sm mt-2">
                  {wonCoupon.description}
                </p>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresinizi girin"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-gray-600 text-sm mt-2">
                    Kupon kodunuz bu adrese gönderilecek
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {emailSending ? 'Gönderiliyor...' : 'Kuponu Gönder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Games Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl px-4 md:px-0">
            {GAMES.map((game) => {
              const IconComponent = game.icon
              return (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game.code)}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/50 hover:scale-105 h-48 md:h-64 flex flex-col justify-center items-center text-center overflow-hidden`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`mb-4 md:mb-6 p-4 md:p-6 rounded-full bg-gradient-to-br ${game.gradient} shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                      <IconComponent className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                    
                    <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 group-hover:text-gray-900 transition-colors duration-300">
                      {game.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-lg">
                      {game.description}
                    </p>

                    <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 group-hover:bg-white/70 transition-all duration-300">
                      <span className="text-gray-700 font-semibold text-sm">
                        Oynamak için tıkla
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
            <p className="text-gray-600 text-sm">
              🎯 Oyunları oynayarak kupon kazanın • 📧 Kuponlarınız email ile gönderilir
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}