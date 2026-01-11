import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Target, Zap, RotateCcw } from 'lucide-react'
import GameWinModal from '../components/GameWinModal'
import type { Database } from '../lib/database.types'
import { selectWeightedCoupon } from '../lib/gameUtils'

type Coupon = Database['public']['Tables']['coupons']['Row']

interface CircleDashGameProps {
  embedded?: boolean
  userId?: string
  testMode?: boolean
  theme?: {
    background?: string
    primaryColor?: string
    textColor?: string
  }
}

export default function CircleDashGame({ embedded = false, userId: propUserId, testMode: propTestMode, theme }: CircleDashGameProps = {}) {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { gameId } = useParams()
  console.log("Game IDw:", gameId) // Log to avoid lint error or remove if strictly not needed
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [searchParams] = useSearchParams()
  const userId = propUserId || searchParams.get('userId')
  const testMode = propTestMode || searchParams.get('testMode') === 'true'

  // Standard states
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)

  // Game specific states
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [power, setPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [projectile, setProjectile] = useState<{ x: number, y: number, active: boolean, speed: number } | null>(null)
  
  // Game Configuration
  const TARGET_Y = 50 // Top position %
  const PLAYER_Y = 90 // Bottom position %
  const OBSTACLE_Y = 70 // Obstacle Y position %
  
  // Refs for loop
  const requestRef = useRef<number>()
  const obstacleRef = useRef<number>(0) // Rotation angle

  useEffect(() => {
    if (userId && !testMode) fetchCoupons()
    if (testMode) {
      setCoupons([{
        id: 'test', user_id: userId || '', code: 'TEST20', description: '%20 İndirim',
        discount_type: 'percentage', discount_value: 20, level: 1, quantity: 100, used_count: 0, created_at: ''
      }])
    }
  }, [userId])

  const fetchCoupons = async () => {
    if (!userId) return
    const { data } = await supabase.from('coupons').select('*').eq('user_id', userId).gt('quantity', 0)
    if (data) setCoupons(data)
  }

  // Game Loop
  const animate = () => {
    if (!gameRunning) return

    // Update Obstacles
    obstacleRef.current = (obstacleRef.current + 2) % 360

    // Update Projectile
    setProjectile(prev => {
      if (!prev || !prev.active) return prev

      const newY = prev.y - prev.speed
      
      // Collision Checks
      
      // 1. Obstacle Collision (Simple horizontal check at specific Y)
      // Obstacle creates a gap or a block. Let's make it a rotating blocker.
      // E.g. A bar rotating around center. If projectile Y passes close to obstacle Y, check X collision.
      // For simplicity in React state (not canvas), let's use a moving horizontal block.
      // Obstacle moves left-right using Sin wave based on obstacleRef.
      const obstacleX = 50 + Math.sin(obstacleRef.current * Math.PI / 180) * 40 // Moves between 10% and 90%
      const obstacleWidth = 20
      
      // Check collision with obstacle
      if (newY < OBSTACLE_Y + 2 && newY > OBSTACLE_Y - 2) {
        // Projectile is vertically at obstacle level
        // Assume projectile is at center X (50%)
        if (Math.abs(50 - obstacleX) < obstacleWidth / 2) {
            handleGameOver()
            return { ...prev, active: false }
        }
      }

      // 2. Target Collision
      if (newY <= TARGET_Y) {
         // Hit!
         handleHit()
         return { ...prev, active: false }
      }

      // 3. Out of bounds (e.g. too slow?)
      if (newY < 0) {
        handleGameOver()
        return { ...prev, active: false }
      }

      return { ...prev, y: newY }
    })

    // Charge Power
    if (isCharging) {
      setPower(p => (p >= 100 ? 0 : p + 2))
    }

    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [gameRunning, isCharging, projectile])


  const startCharging = () => {
    if (!gameRunning || projectile?.active) return
    setIsCharging(true)
    setPower(0)
  }

  const releaseArrow = () => {
    if (!isCharging) return
    setIsCharging(false)
    // Fire!
    // Speed depends on power. Sweet spot is 80-100? Or just faster = better?
    // Let's say needs to be fast enough to pass? 
    // Or maybe power determines if it penetrates?
    // Let's keep simpler: Power = Speed. Too slow = fail.
    
    // Actually user requirement: "Güç parametresi olsun ona göre hedefe saplansın"
    const speed = 0.5 + (power / 100) * 2 // Speed between 0.5 and 2.5
    setProjectile({ x: 50, y: PLAYER_Y, active: true, speed })
  }

  const handleHit = () => {
    const newScore = score + 1
    setScore(newScore)
    setProjectile(null)
    
    if (newScore >= 3) {
      handleGameWin()
    }
  }

  const handleGameOver = () => {
    setGameRunning(false)
    setGameOver(true)
  }

  const handleGameWin = () => {
    setGameCompleted(true)
    setGameRunning(false)
    if (coupons.length > 0) {
        setWonCoupon(selectWeightedCoupon(coupons))
    }
  }

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
    setGameCompleted(false)
    setScore(0)
    setProjectile(null)
    obstacleRef.current = 0
  }

  // Visuals
  const obstacleX = 50 + Math.sin(obstacleRef.current * Math.PI / 180) * 40

  return (
             <div className={`p-4 flex flex-col items-center justify-center min-h-screen relative overflow-hidden ${embedded ? 'h-full w-full' : ''}`}
        style={{ 
        background: theme?.background || 'linear-gradient(to bottom, #1e1b4b, #312e81)',
        color: theme?.textColor || 'white'
        }}
    >
       {/* Background Effects */}
       <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
       </div>

       {/* Game Container */}
       <div className="relative w-full max-w-sm aspect-[9/16] max-h-[80vh] bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header / Score */}
            <div className="absolute top-4 left-0 right-0 z-10 flex justify-between px-6">
                <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-lg">{score}/3</span>
                </div>
                {gameRunning && (
                    <div className="flex items-center space-x-1">
                        <Zap className={`w-4 h-4 ${isCharging ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`} />
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 transition-all duration-75" style={{ width: `${power}%` }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Game Content */}
            {!gameRunning && !gameCompleted && !gameOver ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm p-6 text-center">
                    <Target className="w-16 h-16 text-indigo-400 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold mb-2">Circle Dash</h2>
                    <p className="text-gray-300 mb-6 text-sm">
                        Engellere dikkat et! Gücünü ayarla ve hedefe fırlat.
                    </p>
                    <button 
                        onClick={startGame}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        BAŞLA
                    </button>
                 </div>
            ) : null}

            {/* Win Modal */}
            {gameCompleted && wonCoupon && (
                 <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                     <div className="bg-white rounded-xl w-full">
                        <GameWinModal coupon={wonCoupon} gameType="circle-dash" onReset={startGame} />
                     </div>
                 </div>
            )}

            {/* Game Over Modal */}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm p-6 text-center animate-fadeIn">
                    <div className="text-6xl mb-4">💥</div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Iskaladın!</h2>
                    <p className="text-gray-300 mb-6">Hedefi vurman gerekiyor.</p>
                    <button 
                        onClick={startGame}
                        className="flex items-center bg-white text-indigo-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-transform hover:scale-105"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* Play Area */}
            {/* Target */}
            <div className="absolute left-1/2 -translate-x-1/2 w-16 h-16 border-4 border-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                 style={{ top: `${TARGET_Y}%` }}
            >
                <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            {/* Obstacle */}
            <div className="absolute bg-pink-500/80 h-4 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] backdrop-blur-sm border border-pink-300/30"
                 style={{ 
                     top: `${OBSTACLE_Y}%`,
                     left: `${obstacleX}%`,
                     width: '20%',
                     transform: 'translate(-50%, -50%)'
                 }}
            ></div>

            {/* Player / Projectile */}
            <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-75"
                 style={{ 
                     top: projectile?.active ? `${projectile.y}%` : `${PLAYER_Y}%`,
                     opacity: projectile?.active || !gameRunning ? 1 : 0.5
                 }}
            >
                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-cyan-400 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            </div>

            {/* Controls Overlay (Click area) */}
            {gameRunning && (
                <div 
                    className="absolute inset-0 z-10 cursor-pointer active:cursor-grabbing"
                    onMouseDown={startCharging}
                    onMouseUp={releaseArrow}
                    onTouchStart={startCharging}
                    onTouchEnd={releaseArrow}
                ></div>
            )}

       </div>
    </div>
  )
}
