import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gift, Star, Trophy, RotateCcw } from 'lucide-react'

import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryGame() {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  const testMode = searchParams.get('testMode') === 'true'
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸']

  useEffect(() => {
    if (!testMode) {
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
          created_at: new Date().toISOString()
        }
      ])
    }
    
    initializeGame()
  }, [gameId, userId])

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
    
    // Rastgele kupon seç
    if (coupons.length > 0) {
      const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)]
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
            <p className="text-indigo-100">{game.description}</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold">Hamle: {moves}</span>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold">Eşleşen: {matchedPairs}/8</span>
              </div>
            </div>
          </div>

          <div className="p-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-gray-900"
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                    <p className="text-blue-800 text-sm">
                      📧 Kupon kodunuz <strong>{email || 'email adresinize'}</strong> gönderilecek
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Game Area */}
              <div className="lg:col-span-2">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-300 ${
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

                <div className="text-center space-y-4">
                  {!gameStarted && !gameCompleted && (
                    <div>
                      <button
                        onClick={startGame}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
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

              {/* Sidebar */}
              <div className="space-y-6">
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