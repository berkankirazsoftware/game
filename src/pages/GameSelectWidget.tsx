import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Play, Gift, RotateCcw, Trophy, ArrowLeft } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

// Sabit oyun listesi
const GAMES = [
  {
    id: 'snake-game',
    name: 'Yılan Oyunu',
    description: 'Klasik yılan oyunu',
    code: 'snake',
    image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'puzzle-game',
    name: 'Puzzle', 
    description: 'Zeka oyunu',
    code: 'puzzle',
    image: 'https://images.pexels.com/photos/3740390/pexels-photo-3740390.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'memory-game', 
    name: 'Hafıza',
    description: 'Kart eşleştirme',
    code: 'memory',
    image: 'https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
]

// Snake Game Component
function SnakeGame({ onBack, coupons }: { onBack: () => void, coupons: Coupon[] }) {
  const [snake, setSnake] = useState([[10, 10]])
  const [food, setFood] = useState([15, 15])
  const [direction, setDirection] = useState([0, 1])
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)

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
    <div className="space-y-6">
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
            <span className="font-semibold text-indigo-800">Skor: {score}</span>
          </div>
          <div className="bg-green-100 px-3 py-1 rounded-full">
            <span className="font-semibold text-green-800">Hedef: 50 puan</span>
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
              Oyunu başarıyla tamamladınız ve kupon kazandınız!
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

      {/* Game Area */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="grid grid-cols-20 gap-0 w-full max-w-md mx-auto">
          {Array.from({ length: 400 }, (_, index) => {
            const row = Math.floor(index / 20)
            const col = index % 20
            
            let cellClass = "w-4 h-4 border border-gray-700"
            
            // Snake body
            if (snake.some(segment => segment[0] === row && segment[1] === col)) {
              cellClass += " bg-green-500"
            }
            // Food
            else if (food[0] === row && food[1] === col) {
              cellClass += " bg-red-500"
            }
            // Empty cell
            else {
              cellClass += " bg-gray-800"
            }
            
            return <div key={index} className={cellClass}></div>
          })}
        </div>
      </div>

      <div className="text-center space-y-4">
        {!gameRunning && !gameOver && !gameCompleted && (
          <div>
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Oyunu Başlat
            </button>
            <p className="text-gray-600 text-sm mt-2">
              Ok tuşları ile yönlendirin
            </p>
          </div>
        )}
        
        {gameRunning && (
          <p className="text-gray-600">
            Ok tuşları ile yılanı yönlendirin. Kırmızı noktaları yakalayın!
          </p>
        )}
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
    <div className="space-y-6">
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
            <span className="font-semibold text-green-800">Eşleşen: {matchedPairs}/8</span>
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

      {/* Game Area */}
      <div className="bg-gray-100 rounded-lg p-4">
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

  const initializeGame = () => {
    // 3x3 puzzle (9 parça)
    const puzzlePieces = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      correctPos: i,
      currentPos: i
    }))
    
    // Karıştır
    const shuffled = [...puzzlePieces]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i].currentPos
      shuffled[i].currentPos = shuffled[j].currentPos
      shuffled[j].currentPos = temp
    }
    
    setPieces(shuffled)
  }

  const handlePieceClick = (pieceId: number) => {
    if (!gameStarted || gameCompleted) return
    
    const piece = pieces.find(p => p.id === pieceId)
    if (!piece) return

    // Basit swap mantığı - tıklanan parça ile rastgele başka bir parça yer değiştir
    const otherPiece = pieces[Math.floor(Math.random() * pieces.length)]
    if (otherPiece.id === pieceId) return

    setPieces(prev => prev.map(p => {
      if (p.id === pieceId) {
        return { ...p, currentPos: otherPiece.currentPos }
      } else if (p.id === otherPiece.id) {
        return { ...p, currentPos: piece.currentPos }
      }
      return p
    }))

    setMoves(prev => prev + 1)

    // Kazanma kontrolü
    setTimeout(() => {
      const allCorrect = pieces.every(p => p.correctPos === p.currentPos)
      if (allCorrect) {
        handleGameWin()
      }
    }, 100)
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
    setWonCoupon(null)
    initializeGame()
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setMoves(0)
    setWonCoupon(null)
    initializeGame()
  }

  const getPieceColor = (pieceId: number) => {
    const colors = [
      'bg-red-200', 'bg-blue-200', 'bg-green-200',
      'bg-yellow-200', 'bg-purple-200', 'bg-pink-200',
      'bg-indigo-200', 'bg-orange-200', 'bg-teal-200'
    ]
    return colors[pieceId] || 'bg-gray-200'
  }

  return (
    <div className="space-y-6">
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
              Puzzle'ı {moves} hamlede tamamladınız ve kupon kazandınız!
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
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
          {pieces.sort((a, b) => a.currentPos - b.currentPos).map((piece) => (
            <div
              key={piece.id}
              onClick={() => handlePieceClick(piece.id)}
              className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-300 ${
                getPieceColor(piece.id)
              } hover:scale-105 border-2 ${
                piece.correctPos === piece.currentPos ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              {piece.id + 1}
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
              Parçalara tıklayarak doğru sıraya dizin
            </p>
          </div>
        )}
        
        {gameStarted && (
          <div className="flex justify-center space-x-4">
            <p className="text-gray-600">
              Parçaları tıklayarak doğru sıraya dizin!
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
  )
}

export default function GameSelectWidget() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [userId])

  const fetchCoupons = async () => {
    try {
      if (userId) {
        console.log('Fetching coupons for userId:', userId)
        const { data: couponsData, error: couponsError } = await supabase
          .from('coupons')
          .select('*')
          .eq('user_id', userId)

        console.log('Coupons response:', { data: couponsData, error: couponsError })
        
        if (couponsData && !couponsError) {
          setCoupons(couponsData)
        } else if (couponsError) {
          console.error('Coupon fetch error:', couponsError)
          setError(`Kupon yükleme hatası: ${couponsError.message}`)
        }
      } else {
        console.log('No userId provided')
        setError('User ID bulunamadı')
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      setError('Kuponlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center overflow-hidden">
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Widget yükleniyor...</p>
          <p className="text-center mt-2 text-sm text-gray-500">User ID: {userId}</p>
        </div>
      </div>
    )
  }

  // Hata durumu
  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center overflow-hidden">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Yükleme Hatası
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">User ID: {userId}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Kupon yoksa hiçbir şey gösterme
  if (coupons.length === 0) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center overflow-hidden">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Widget Hazır Değil
          </h2>
          <p className="text-gray-600 mb-4">
            Bu widget henüz aktif değil. Site sahibi kupon eklemesi gerekiyor.
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
            <p>Debug Bilgisi:</p>
            <p>User ID: {userId}</p>
            <p>Kupon Sayısı: {coupons.length}</p>
          </div>
        </div>
      </div>
    )
  }

  // Oyun seçildiyse oyunu göster
  if (selectedGame === 'snake') {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-2 overflow-hidden">
        <div className="w-full h-full">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">🐍 Yılan Oyunu</h1>
              <p className="text-indigo-100">Ok tuşları ile yılanı yönlendirin ve yemi toplayın</p>
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              <SnakeGame onBack={() => setSelectedGame(null)} coupons={coupons} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame === 'memory') {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-2 overflow-hidden">
        <div className="w-full h-full">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">🧠 Hafıza Oyunu</h1>
              <p className="text-indigo-100">Kartları çevirerek eşleşen çiftleri bulun</p>
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              <MemoryGame onBack={() => setSelectedGame(null)} coupons={coupons} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame === 'puzzle') {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-2 overflow-hidden">
        <div className="w-full h-full">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">🧩 Puzzle Oyunu</h1>
              <p className="text-indigo-100">Parçaları doğru yere yerleştirerek resmi tamamlayın</p>
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              <PuzzleGame onBack={() => setSelectedGame(null)} coupons={coupons} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Oyun seçim ekranı
  return (
    <div className="w-full h-[600px] relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-white rounded-full opacity-40 animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white rounded-full opacity-30 animate-float animation-delay-3000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white rounded-full opacity-50 animate-float animation-delay-2000"></div>
      </div>
      
      <div className="w-full h-full">
        <div className="relative z-10 h-full flex flex-col">
          {/* Minimal Header */}
          <div className="p-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 inline-block">
              <h1 className="text-xl font-bold text-white">Oyna Kazan</h1>
            </div>
          </div>

          <div className="flex-1 px-4 pb-4 overflow-hidden">
            {/* Kuponlar Section */}
            {coupons.length > 0 && (
              <div className="mb-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 inline-block mb-3">
                  <h2 className="text-lg font-semibold text-white">Kuponlar</h2>
                </div>
                <div className="flex flex-wrap gap-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 text-white min-w-[120px]">
                      <div className="text-center">
                        <div className="text-sm font-bold mb-1">{coupon.code}</div>
                        <div className="text-sm text-yellow-300">
                          {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                        </div>
                        <div className="text-xs text-white/70 mt-1">{coupon.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Oyunlar Section */}
            <div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 inline-block mb-3">
                <h2 className="text-lg font-semibold text-white">Oyunlar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game.code)}
                    className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden cursor-pointer hover:bg-white/20 transition-all duration-500 hover:scale-105"
                  >
                    <div className="h-24 relative overflow-hidden">
                      <img 
                        src={game.image} 
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white mb-1">{game.name}</h3>
                      <p className="text-white/70 text-xs">{game.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}