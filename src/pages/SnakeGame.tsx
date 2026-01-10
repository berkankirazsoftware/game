import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gift, Star, Trophy } from 'lucide-react'

import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

interface SnakeGameProps {
  embedded?: boolean;
  theme?: {
    background?: string; // CSS background value
    primaryColor?: string;
    textColor?: string;
  };
  userId?: string; // Optional direct prop override
  testMode?: boolean;
}

export default function SnakeGame({ embedded = false, theme, userId: propUserId, testMode: propTestMode }: SnakeGameProps) {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  // Use prop if available, otherwise fallback to URL params
  const userId = propUserId || searchParams.get('userId')
  const testMode = propTestMode ?? (searchParams.get('testMode') === 'true')
  
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [score, setScore] = useState(0)

  // Snake Game State
  const [snake, setSnake] = useState([[10, 10]])
  const [food, setFood] = useState([15, 15])
  const [direction, setDirection] = useState([0, 1])
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)

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
          code: 'TEST20',
          description: 'Test kuponu - %20 indirim',
          discount_type: 'percentage',
          discount_value: 20,
          created_at: new Date().toISOString(),
          level: 1,
          quantity: 100,
          used_count: 0
        }
      ])
    }
  }, [gameId, userId])

  // Sabit oyun bilgisi
  const game = {
    id: 'snake-game',
    name: 'Yılan Oyunu',
    description: 'Ok tuşları ile yılanı yönlendirin ve yemi toplayın',
    code: 'snake'
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

  useEffect(() => {
    if (gameRunning && !gameOver) {
      const gameInterval = setInterval(moveSnake, 150)
      return () => clearInterval(gameInterval)
    }
  }, [snake, direction, gameRunning, gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection([-1, 0])
          break
        case 'ArrowDown':
          setDirection([1, 0])
          break
        case 'ArrowLeft':
          setDirection([0, -1])
          break
        case 'ArrowRight':
          setDirection([0, 1])
          break
      }
    }

    if (gameRunning) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [gameRunning])

  const moveSnake = () => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = [
        newSnake[0][0] + direction[0],
        newSnake[0][1] + direction[1]
      ]

      // Check wall collision
      if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 20) {
        setGameOver(true)
        setGameRunning(false)
        return currentSnake
      }

      // Check self collision
      if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
        setGameOver(true)
        setGameRunning(false)
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(prev => prev + 10)
        setFood([
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20)
        ])
        
        // Check win condition
        if (score + 10 >= 50) {
          handleGameWin()
        }
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }

  const handleGameWin = () => {
    setGameCompleted(true)
    setGameRunning(false)
    
    // Rastgele kupon seç
    if (coupons.length > 0) {
      const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)]
      setWonCoupon(randomCoupon)
    }
  }

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
    setGameCompleted(false)
    setScore(0)
    setSnake([[10, 10]])
    setFood([15, 15])
    setDirection([0, 1])
    setWonCoupon(null)
  }

  const resetGame = () => {
    setGameOver(false)
    setGameCompleted(false)
    setScore(0)
    setSnake([[10, 10]])
    setFood([15, 15])
    setDirection([0, 1])
    setWonCoupon(null)
  }

  return (
    <div 
      className={`p-4 ${embedded ? 'h-full w-full' : 'min-h-screen'}`}
      style={{ 
        background: theme?.background || 'linear-gradient(to bottom right, #a78bfa, #ec4899, #ef4444)',
        color: theme?.textColor
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
            <p className="text-indigo-100">{game.description}</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold">Skor: {score}</span>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold">Hedef: 50 puan</span>
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
                    Oyunu başarıyla tamamladınız ve kupon kazandınız!
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg mb-6">
                  
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

            {/* Game Over Modal */}
            {gameOver && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
                  <div className="text-6xl mb-4">😵</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Oyun Bitti!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Skorunuz: {score} puan<br/>
                    Kupon kazanmak için 50 puana ulaşmanız gerekiyor.
                  </p>
                  <button
                    onClick={resetGame}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Game Area */}
              <div className="lg:col-span-2 flex flex-col items-center">
                <div className="w-full max-w-md bg-gray-900 rounded-lg p-2 sm:p-4 mb-4 shadow-xl border-4 border-gray-800">
                  <div className="aspect-square w-full relative">
                    <div className="grid grid-cols-20 gap-0 w-full h-full">
                      {Array.from({ length: 400 }, (_, index) => {
                        const row = Math.floor(index / 20)
                        const col = index % 20
                        
                        let cellClass = "w-full h-full border-[0.5px] border-gray-800/30"
                        
                        // Snake body
                        if (snake.some(segment => segment[0] === row && segment[1] === col)) {
                          cellClass += " bg-green-500 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        }
                        // Food
                        else if (food[0] === row && food[1] === col) {
                          cellClass += " bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                        }
                        // Empty cell
                        else {
                          cellClass += " bg-gray-900/50"
                        }
                        
                        return <div key={index} className={cellClass}></div>
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4 w-full">
                  {!gameRunning && !gameOver && !gameCompleted && (
                    <div>
                      <button
                        onClick={startGame}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 w-full sm:w-auto"
                      >
                        Oyunu Başlat
                      </button>
                      <p className="text-gray-600 text-sm mt-2 hidden sm:block">
                        Ok tuşları ile yönlendirin
                      </p>
                    </div>
                  )}
                  
                  {gameRunning && (
                    <div className="flex flex-col items-center w-full">
                        <p className="text-gray-600 mb-4 hidden sm:block">
                        Ok tuşları ile yılanı yönlendirin. Kırmızı noktaları yakalayın!
                        </p>
                        
                        {/* Mobile D-Pad */}
                        <div className="grid grid-cols-3 gap-2 sm:hidden w-48 mx-auto">
                            <div></div>
                            <button className="bg-gray-200 p-4 rounded-lg active:bg-gray-300 shadow-md text-2xl" onClick={() => setDirection([-1, 0])}>⬆️</button>
                            <div></div>
                            <button className="bg-gray-200 p-4 rounded-lg active:bg-gray-300 shadow-md text-2xl" onClick={() => setDirection([0, -1])}>⬅️</button>
                            <button className="bg-gray-200 p-4 rounded-lg active:bg-gray-300 shadow-md text-2xl" onClick={() => setDirection([1, 0])}>⬇️</button>
                            <button className="bg-gray-200 p-4 rounded-lg active:bg-gray-300 shadow-md text-2xl" onClick={() => setDirection([0, 1])}>➡️</button>
                        </div>
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
                    <li>• Ok tuşları ile yılanı yönlendirin</li>
                    <li>• Kırmızı yemi toplayın</li>
                    <li>• 50 puana ulaşın</li>
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