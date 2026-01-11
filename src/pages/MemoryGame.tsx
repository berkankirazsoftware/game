import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gift, Star, Trophy, RotateCcw } from 'lucide-react'
import GameWinModal from '../components/GameWinModal'

import type { Database } from '../lib/database.types'
import { selectWeightedCoupon } from '../lib/gameUtils'

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

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸']

  useEffect(() => {
    if (userId && !testMode) {
      fetchCoupons()
    }
    
    if (testMode) {
      // Test modu için varsayılan kuponlar
      setCoupons([
        {
          id: 'test-coupon-1',
          user_id: userId || '',
          code: 'TEST15',
          description: 'Test kuponu - %15 indirim',
          discount_type: 'percentage',
          discount_value: 15,
          level: 1,
          quantity: 100, // Mock fields to satisfy type
          used_count: 0,
          created_at: new Date().toISOString()
        }
      ])
    }
    
    initializeGame()
  }, [gameId, userId, testMode])

  // Sabit oyun bilgisi
  const game = {
    id: 'memory-game',
    name: 'Hafıza Oyunu',
    description: 'Kartları çevirerek eşleşen çiftleri bulun',
    code: 'memory'
  }

  const fetchCoupons = async () => {
    if (!userId) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
    
    if (data) {
      setCoupons(data)
    }
  }

  const initializeGame = () => {
    const gameCards: Card[] = []
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5).slice(0, 8)
    
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
          if (matchedPairs + 1 === 8) {
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
    
    let selectedPlugin: Coupon | null = null;
    if (coupons.length > 0) {
      selectedPlugin = selectWeightedCoupon(coupons)
      setWonCoupon(selectedPlugin)
    }
    onGameComplete?.(selectedPlugin)
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
    <div 
      className="min-h-screen p-4 overflow-auto"
      style={{
        background: theme?.background || 'linear-gradient(to bottom right, #a78bfa, #ec4899, #ef4444)'
      }}
    >
      <div className={`max-w-4xl mx-auto ${embedded ? 'h-full' : ''}`}>
        <div className={`bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col ${embedded ? 'h-full' : ''}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 sm:p-6 text-white shrink-0">
            <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">{game.name}</h1>
            <p className="text-indigo-100 text-xs sm:text-base hidden sm:block">{game.description}</p>
            <div className="mt-2 flex items-center space-x-2 sm:space-x-4">
              <div className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                <span className="font-semibold text-xs sm:text-base">Hamle: {moves}</span>
              </div>
              <div className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                <span className="font-semibold text-xs sm:text-base">Eşleşen: {matchedPairs}/8</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Game Won Modal */}
            {gameCompleted && wonCoupon && (
              <GameWinModal 
                score={moves}
                coupon={wonCoupon}
                onReset={resetGame}
                gameType="memory"
              />
            )}

            <div className={`grid ${embedded ? 'grid-cols-1 lg:grid-cols-6' : 'grid-cols-1 lg:grid-cols-3'} gap-4 sm:gap-6 h-full auto-rows-min`}>
              {/* Game Area */}
              <div className={`${embedded ? 'lg:col-span-4' : 'lg:col-span-2'} flex flex-col items-center justify-center min-h-0`}>
                <div className="bg-gray-100 rounded-lg p-2 sm:p-4 mb-2 sm:mb-4 w-full max-w-[85vmin] sm:max-w-md shrink-0">
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full aspect-square">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold cursor-pointer transition-all duration-300 ${
                          card.isFlipped || card.isMatched
                            ? card.isMatched
                              ? 'bg-green-200 text-green-800'
                              : 'bg-blue-200 text-blue-800'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {card.isFlipped || card.isMatched ? card.symbol : '?'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2 w-full shrink-0 h-10 sm:h-auto">
                  {!gameStarted && !gameCompleted && (
                    <div>
                      <button
                        onClick={startGame}
                        className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg w-full sm:w-auto"
                      >
                        Oyunu Başlat
                      </button>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 hidden sm:block">
                        Kartları çevirerek eşleşen çiftleri bulun
                      </p>
                    </div>
                  )}
                  
                  {gameStarted && (
                    <div className="flex justify-center space-x-4">
                      <p className="text-gray-600 hidden sm:block">
                        Kartları çevirerek eşleşen çiftleri bulun!
                      </p>
                      <button
                        onClick={resetGame}
                        className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm sm:text-base"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Yeniden Başla
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className={`space-y-4 sm:space-y-6 ${embedded ? 'lg:col-span-2 overflow-y-auto max-h-[30vh] lg:max-h-full pr-1' : ''}`}>
                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Nasıl Oynanır?
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Kartlara tıklayarak çevirin</li>
                    <li>• Aynı sembolleri eşleştirin</li>
                    <li>• Tüm çiftleri bulun</li>
                    <li>• Kupon kazanın!</li>
                  </ul>
                </div>

                {/* Available Coupons */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Kazanabileceğiniz Kuponlar
                  </h3>
                  <div className="space-y-2">
                    {coupons.length > 0 ? coupons.map((coupon) => (
                      <div key={coupon.id} className="bg-white p-3 rounded border border-green-200">
                        <div className="font-semibold text-green-800">{coupon.code}</div>
                        <div className="text-green-700 text-sm">
                          {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value} İndirim
                        </div>
                        <div className="text-green-600 text-xs">{coupon.description}</div>
                      </div>
                    )) : (
                      <p className="text-green-700 text-sm">
                        Bu oyun için kupon bulunmuyor
                      </p>
                    )}
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