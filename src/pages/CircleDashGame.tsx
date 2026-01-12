import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Target, Zap, RotateCcw, Play, Info, Trophy } from 'lucide-react'
import GameWinModal from '../components/GameWinModal'
import type { Database } from '../lib/database.types'
import { selectWeightedCoupon } from '../lib/gameUtils'
import confetti from 'canvas-confetti'

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
  onGameComplete?: (coupon: Coupon | null) => void
}

export default function CircleDashGame({ embedded = false, userId: propUserId, testMode: propTestMode, theme, onGameComplete }: CircleDashGameProps = {}) {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  const userId = propUserId || searchParams.get('userId')
  const testMode = propTestMode || searchParams.get('testMode') === 'true'

  // Standard states
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  
  // Game states
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY'>('IDLE')
  const [score, setScore] = useState(0)
  const [power, setPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [projectile, setProjectile] = useState<{ y: number, active: boolean, speed: number } | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  
  // Refs
  const requestRef = useRef<number>()
  const obstacleRef = useRef<number>(0)
  
  // Constants
  const TARGET_Y = 15 // Target position (%)
  const OBSTACLE_Y = 50 // Obstacle position (%)
  const PLAYER_Y = 85 // Player start position (%)

  useEffect(() => {
    if (userId && !testMode) fetchCoupons()
    if (testMode) {
      setCoupons([{
        id: 'test', user_id: userId || '', code: 'DASH20', description: '%20 İndirim',
        discount_type: 'percentage', discount_value: 20, level: 1, quantity: 100, used_count: 0, created_at: ''
      }])
    }
  }, [userId, testMode])

  const fetchCoupons = async () => {
    if (!userId) return
    const { data } = await supabase.from('coupons').select('*').eq('user_id', userId).gt('quantity', 0)
    if (data) setCoupons(data)
  }

  const handleGameOver = () => {
     setGameState('GAME_OVER')
     setIsCharging(false)
  }

  const handleGameWin = () => {
    setGameState('VICTORY')
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    })
    
    let selectedPlugin: Coupon | null = null;
    if (coupons.length > 0) {
        selectedPlugin = selectWeightedCoupon(coupons)
        setWonCoupon(selectedPlugin)
    }
    onGameComplete?.(selectedPlugin)
  }

  const startGame = () => {
    setGameState('PLAYING')
    setScore(0)
    setProjectile(null)
    setPower(0)
    setShowInstructions(false)
    obstacleRef.current = 0
  }

  // Game Loop
  const animate = () => {
    if (gameState !== 'PLAYING') return

    // 1. Obstacle rotation (0 to 360 degrees)
    // Speed could increase with score to make it harder
    const obstacleSpeed = 2 + (score * 0.5)
    obstacleRef.current = (obstacleRef.current + obstacleSpeed) % 360
    
    // 2. Power charging
    if (isCharging) {
        // Ping-pong power effect: 0 -> 100 -> 0 .. or just cycle?
        // Let's cycle 0-100 quickly
        setPower(prev => (prev + 3) % 100)
    }

    // 3. Projectile movement
    if (projectile && projectile.active) {
        // Move up
        const newY = projectile.y - projectile.speed
        
        // Collision Logic
        // Calculate obstacle position at this exact frame
        // It oscillates left-right using Sin wave
        // Center is 50%, range is +/- 40%
        const obstacleX = 50 + Math.sin(obstacleRef.current * Math.PI / 180) * 40
        
        // Check collision if we are crossing the Obstacle Y line
        // We use a small range for "crossing" logic to ensure we don't skip over it with high speed
        if (projectile.y > OBSTACLE_Y && newY <= OBSTACLE_Y) {
            // Projectile is always at X=50
            // Check if Obstacle covers X=50
            // Obstacle Width is approx 20%
            const safeDistance = 10 + 2 // 10 is half width, 2 is margin
            if (Math.abs(50 - obstacleX) < safeDistance) {
                handleGameOver()
                return 
            }
        }
        
        // Check Target Hit
        if (newY <= TARGET_Y) {
            const newScore = score + 1
            setScore(newScore)
            setProjectile(null)
            
            if (newScore >= 3) {
                handleGameWin()
                return
            }
        } else if (newY < 0) {
            // Missed target somehow? (Shouldn't happen with fixed X)
            setProjectile(null)
        } else {
             // Continue moving
             setProjectile(prev => prev ? { ...prev, y: newY } : null)
        }
    }

    requestRef.current = requestAnimationFrame(animate)
  }

  const startCharging = () => {
      if (gameState !== 'PLAYING' || projectile?.active) return
      setIsCharging(true)
      setPower(0)
  }

  const releaseArrow = () => {
      if (!isCharging) return
      setIsCharging(false)
      // Speed base: 1.0 (slow) to 3.0 (fast)
      const speed = 1.0 + (power / 100) * 2.0
      // Start projectile
      setProjectile({ y: PLAYER_Y, active: true, speed })
  }

  useEffect(() => {
    if (gameState === 'PLAYING') {
        requestRef.current = requestAnimationFrame(animate)
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [gameState, isCharging, projectile])

  // Visual Helper for Obstacle
  const obstacleX = 50 + Math.sin(obstacleRef.current * Math.PI / 180) * 40

  return (
    <div 
        className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans select-none ${embedded ? 'h-full w-full' : ''}`}
        style={{ 
           background: theme?.background || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
           color: theme?.textColor || 'white'
        }}
    >
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        {/* Game Frame */}
        <div className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center">
            
            {/* Header: Score & Power */}
            <div className="w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/40 to-transparent">
                 <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white tracking-wider">{score} / 3</span>
                 </div>
                 
                 {/* Power Meter */}
                 <div className="flex items-center space-x-2">
                    <Zap className={`w-4 h-4 ${isCharging ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`} />
                    <div className="w-24 h-2 bg-slate-700/50 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                            style={{ width: `${power}%` }}
                        ></div>
                    </div>
                 </div>
            </div>

            {/* Play Area */}
            <div className="flex-1 w-full relative">
                
                {/* 1. Target (Top) */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 w-16 h-16 pointer-events-none"
                    style={{ top: `${TARGET_Y}%` }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                         {/* Rings */}
                         <div className="absolute w-full h-full border-4 border-emerald-500/30 rounded-full animate-ping"></div>
                         <div className="relative w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                             <div className="w-8 h-8 bg-emerald-300 rounded-full border-2 border-emerald-600"></div>
                         </div>
                    </div>
                </div>

                {/* 2. Obstacle (Middle, Moving) */}
                <div 
                    className="absolute pointer-events-none"
                    style={{ 
                        top: `${OBSTACLE_Y}%`, 
                        left: `${obstacleX}%`, 
                        width: '20%', 
                        height: '16px',
                        transform: 'translate(-50%, -50%)',
                        transition: 'left 0ms linear' // Controlled by frame loop
                    }}
                >
                    <div className="w-full h-full bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] relative overflow-hidden">
                        {/* Striped pattern */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhMOCAwTTAgMEw4IDgiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50"></div>
                    </div>
                </div>

                {/* 3. Player / Projectile (Bottom) */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ 
                        top: projectile?.active ? `${projectile.y}%` : `${PLAYER_Y}%`,
                        filter: 'drop-shadow(0 0 15px rgba(56,189,248,0.5))'
                    }}
                >
                    <div className="w-6 h-6 rotate-45 bg-cyan-400 border-2 border-white rounded-sm transform origin-center"></div>
                    {/* Tail effect when moving */}
                    {projectile?.active && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-transparent blur-sm"></div>
                    )}
                </div>

                {/* Interaction Zone (Full overlay for ease of use) */}
                {gameState === 'PLAYING' && (
                    <div 
                        className="absolute inset-0 z-30 cursor-pointer active:cursor-grabbing hover:bg-white/5 transition-colors"
                        onMouseDown={startCharging}
                        onMouseUp={releaseArrow}
                        onTouchStart={startCharging}
                        onTouchEnd={releaseArrow}
                    >
                         {/* Hint text if waiting */}
                         {!isCharging && !projectile?.active && score === 0 && (
                             <div className="absolute bottom-[20%] w-full text-center text-white/30 text-sm font-medium animate-pulse pointer-events-none">
                                 Basılı tut & Fırlat
                             </div>
                         )}
                    </div>
                )}
            </div>

            {/* Overlays */}
            
            {/* Start / Instructions Screen */}
            {(gameState === 'IDLE' || showInstructions) && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <Info className="w-16 h-16 text-cyan-400 mb-6" />
                    <h2 className="text-3xl font-black text-white mb-2">Circle Dash</h2>
                    <p className="text-slate-300 mb-8 max-w-xs">
                        Reflekslerini test et! Engelleri aş ve 3 kez hedefi vur.
                    </p>
                    
                    <div className="space-y-4 mb-8 w-full max-w-xs">
                        <div className="flex items-center text-left bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 text-cyan-400 font-bold">1</div>
                            <span className="text-sm text-slate-200">Parmağını basılı tutarak gücünü topla.</span>
                        </div>
                        <div className="flex items-center text-left bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 text-rose-400 font-bold">2</div>
                            <span className="text-sm text-slate-200">Kırmızı engel ortadan çekilince bırak!</span>
                        </div>
                    </div>

                    <button 
                        onClick={startGame}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                        <Play className="w-5 h-5 mr-2 fill-white" />
                        OYUNA BAŞLA
                    </button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/10">
                        <RotateCcw className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Çarptın!</h2>
                    <p className="text-slate-400 mb-8">
                        Zamanlama çok önemli. Engel tam ortadayken atış yapmamalısın.
                    </p>
                    <button 
                         onClick={startGame}
                        className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-xl"
                    >
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* Victory Screen */}
            {gameState === 'VICTORY' && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
                     <GameWinModal coupon={wonCoupon!} gameType="circle-dash" onReset={startGame} />
                </div>
            )}

        </div>
    </div>
  )
}
