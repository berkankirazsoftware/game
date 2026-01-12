import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gift, RotateCcw, Trophy, Star, Sparkles, Timer } from 'lucide-react'
import GameWinModal from '../components/GameWinModal'
import type { Database } from '../lib/database.types'
import confetti from 'canvas-confetti'

type Coupon = Database['public']['Tables']['coupons']['Row']

interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryGameProps {
  embedded?: boolean
  userId?: string
  testMode?: boolean
  theme?: {
    background?: string;
    primaryColor?: string;
    textColor?: string;
  }
  onGameComplete?: (coupon: Coupon | null) => void
}

export default function MemoryGame({ embedded, userId: propUserId, testMode: propTestMode, theme, onGameComplete }: MemoryGameProps = {}) {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  const userId = propUserId || searchParams.get('userId')
  const testMode = propTestMode || searchParams.get('testMode') === 'true'
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  
  // States
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  
  // Timer State
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸']

  // Thresholds for rewards
  // Level 3 (Gold): <= 14 moves
  // Level 2 (Silver): <= 20 moves
  // Level 1 (Bronze): > 20 moves
  const THRESHOLDS = {
    GOLD: 14,
    SILVER: 20
  }

  useEffect(() => {
    if (userId && !testMode) {
      fetchCoupons()
    }
    
    if (testMode) {
      setCoupons([
        { id: '1', user_id: userId || '', code: 'GOLD50', description: '%50 İndirim', discount_type: 'percentage', discount_value: 50, level: 3, quantity: 10, used_count: 0, created_at: '' },
        { id: '2', user_id: userId || '', code: 'SILVER20', description: '%20 İndirim', discount_type: 'percentage', discount_value: 20, level: 2, quantity: 10, used_count: 0, created_at: '' },
        { id: '3', user_id: userId || '', code: 'BRONZE10', description: '%10 İndirim', discount_type: 'percentage', discount_value: 10, level: 1, quantity: 10, used_count: 0, created_at: '' }
      ] as any)
    }
    
    initializeGame()
  }, [gameId, userId, testMode])

  useEffect(() => {
    let interval: any = null
    if (isActive && !gameCompleted) {
      interval = setInterval(() => {
        setTimer(seconds => seconds + 1)
      }, 1000)
    } else if (!isActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, gameCompleted, timer])

  const fetchCoupons = async () => {
    if (!userId) return
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .gt('quantity', 0)
    
    if (data) {
      setCoupons(data)
    }
  }

  const initializeGame = () => {
    const gameCards: Card[] = []
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5).slice(0, 8)
    
    shuffledSymbols.forEach((symbol, index) => {
      gameCards.push(
        { id: index * 2, symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
      )
    })
    
    setCards(gameCards.sort(() => Math.random() - 0.5))
  }

  const getCurrentTier = (currentMoves: number) => {
    if (currentMoves <= THRESHOLDS.GOLD) return 3
    if (currentMoves <= THRESHOLDS.SILVER) return 2
    return 1
  }

  const getBestCouponForTier = (tier: number) => {
    const tierCoupons = coupons.filter(c => c.level === tier)
    if (tierCoupons.length === 0) return null
    // Return best value
    return tierCoupons.sort((a, b) => b.discount_value - a.discount_value)[0]
  }

  // Calculate potential rewards to display
  const rewardInfo = useMemo(() => {
    const gold = getBestCouponForTier(3) || getBestCouponForTier(2) || getBestCouponForTier(1)
    const silver = getBestCouponForTier(2) || getBestCouponForTier(1)
    const bronze = getBestCouponForTier(1)

    return { gold, silver, bronze }
  }, [coupons])

  const currentTier = getCurrentTier(moves)

  const handleCardClick = (cardId: number) => {
    if (!gameStarted || flippedCards.length >= 2) return
    if (!isActive) setIsActive(true)
    
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
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ))
          setMatchedPairs(prev => prev + 1)
          setFlippedCards([])
          
          if (matchedPairs + 1 === 8) {
            handleGameWin(moves + 1)
          }
        }, 600)
      } else {
        // No match
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

  const handleGameWin = (finalMoves: number) => {
    setGameCompleted(true)
    setIsActive(false)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Determine coupon based on tier
    const earnedTier = getCurrentTier(finalMoves)
    
    // Try to find a coupon for the earned tier, if not, fallback to lower tiers
    let winningCoupon = coupons.find(c => c.level === earnedTier && c.quantity > 0)
    
    if (!winningCoupon) {
       // Fallback logic: check typical other tiers
       if (earnedTier === 3) winningCoupon = coupons.find(c => c.level === 2 && c.quantity > 0)
       if (!winningCoupon) winningCoupon = coupons.find(c => c.quantity > 0) // Any coupon
    }

    setWonCoupon(winningCoupon || null)
    onGameComplete?.(winningCoupon || null)
  }

  const startGame = () => {
    setGameStarted(true)
    setGameCompleted(false)
    setMoves(0)
    setMatchedPairs(0)
    setFlippedCards([])
    setTimer(0)
    setWonCoupon(null)
    setIsActive(true)
    initializeGame()
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setMoves(0)
    setMatchedPairs(0)
    setFlippedCards([])
    setTimer(0)
    setWonCoupon(null)
    setIsActive(false)
    initializeGame()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="min-h-screen p-4 flex flex-col items-center justify-center font-sans overflow-hidden"
      style={{
        background: theme?.background || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        color: theme?.textColor || '#4a5568'
      }}
    >
      <div className={`w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${embedded ? 'h-full' : 'min-h-[600px]'}`}>
        
        {/* Sidebar / Info Panel */}
        <div className="md:w-1/3 bg-white/50 p-6 flex flex-col border-r border-white/20">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              Hafıza Oyunu
            </h1>
            <p className="text-gray-600 text-sm">
              En az hamleyle tüm eşleri bul, büyük ödülü kap!
            </p>
          </div>

          {!gameCompleted && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <RotateCcw size={20} />
                  <span className="font-semibold">Hamle</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{moves}</span>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                 <div className="flex items-center space-x-2 text-purple-600">
                  <Timer size={20} />
                  <span className="font-semibold">Süre</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{formatTime(timer)}</span>
              </div>
            </div>
          )}

          {/* Progress / Tiers */}
          <div className="flex-1 space-y-3">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Ödül Hedefleri
            </h3>
            
            <div className={`p-3 rounded-lg border transition-all ${
              currentTier === 3 ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200' : 'bg-gray-50 border-gray-100 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-yellow-700 flex items-center">
                   <Star size={14} className="mr-1 fill-yellow-500 text-yellow-500" /> Efsanevi
                </span>
                <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  ≤ {THRESHOLDS.GOLD} Hamle
                </span>
              </div>
              <div className="text-sm text-yellow-800">
                {rewardInfo.gold ? 
                  `${rewardInfo.gold.discount_type === 'percentage' ? '%' : '₺'}${rewardInfo.gold.discount_value} İndirim` : 
                  'Sürpriz Ödül'}
              </div>
            </div>

            <div className={`p-3 rounded-lg border transition-all ${
              currentTier === 2 ? 'bg-slate-50 border-slate-300 ring-2 ring-slate-200' : 'bg-gray-50 border-gray-100 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-1">
                 <span className="font-bold text-slate-600 flex items-center">
                   <Sparkles size={14} className="mr-1 text-slate-500" /> Nadir
                </span>
                 <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  ≤ {THRESHOLDS.SILVER} Hamle
                </span>
              </div>
              <div className="text-sm text-slate-700">
                {rewardInfo.silver ? 
                  `${rewardInfo.silver.discount_type === 'percentage' ? '%' : '₺'}${rewardInfo.silver.discount_value} İndirim` : 
                  'Sürpriz Ödül'}
              </div>
            </div>

            <div className={`p-3 rounded-lg border transition-all ${
              currentTier === 1 ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200' : 'bg-gray-50 border-gray-100 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-orange-700">Normal</span>
                 <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  20+ Hamle
                </span>
              </div>
               <div className="text-sm text-orange-800">
                {rewardInfo.bronze ? 
                  `${rewardInfo.bronze.discount_type === 'percentage' ? '%' : '₺'}${rewardInfo.bronze.discount_value} İndirim` : 
                  'Standart Ödül'}
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="md:w-2/3 p-4 md:p-8 bg-white/40 flex flex-col items-center justify-center relative">
          
          {/* Game Win Overlay */}
          {gameCompleted && wonCoupon && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
               <GameWinModal 
                score={moves}
                coupon={wonCoupon}
                onReset={resetGame}
                gameType="memory"
              />
            </div>
          )}

          {!gameStarted ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Gift className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hazır mısın?</h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Kartları eşleştir, hafızanı test et. Ne kadar az hamle yaparsan, o kadar büyük ödül kazanırsın!
              </p>
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Oyunu Başlat
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md aspect-square">
              <div className="grid grid-cols-4 gap-2 w-full h-full">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className="relative w-full h-full cursor-pointer perspective-1000 group"
                  >
                    <div 
                      className={`w-full h-full duration-500 preserve-3d absolute transition-all ${
                        card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                      }`}
                      style={{ transformStyle: 'preserve-3d', transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : '' }}
                    >
                      {/* Front (Hidden) */}
                      <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md border-2 border-indigo-400/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                         <Star className="text-white/20 w-8 h-8" />
                      </div>
                      
                      {/* Back (Revealed) */}
                      <div 
                        className={`absolute inset-0 backface-hidden rounded-xl shadow-md flex items-center justify-center text-4xl bg-white border-2 ${
                            card.isMatched ? 'border-green-400 bg-green-50' : 'border-indigo-200'
                        }`}
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                      >
                         {card.symbol}
                         {card.isMatched && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="absolute inset-0 bg-green-400/20 animate-ping rounded-xl"></div>
                             </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {gameStarted && (
             <div className="mt-6 flex space-x-4">
                <button 
                    onClick={resetGame}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors"
                >
                    Yeniden Başla
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  )
}