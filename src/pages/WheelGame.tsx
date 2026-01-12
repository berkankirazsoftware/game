import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Gift, Star, Sparkles, Trophy } from 'lucide-react'
import GameWinModal from '../components/GameWinModal'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import { selectWeightedCoupon } from '../lib/gameUtils'

type Coupon = Database['public']['Tables']['coupons']['Row']

// Mock Data Types
interface Segment {
  id: string;
  label: string;
  color: string;
  value: string;
  coupon?: Coupon;
}

interface WheelGameProps {
  embedded?: boolean;
  userId?: string;
  theme?: {
    background?: string;
    primaryColor?: string;
    textColor?: string;
  };
  onGameComplete?: (coupon: Coupon | null) => void;
}

export default function WheelGame({ embedded = false, userId: propUserId, theme, onGameComplete }: WheelGameProps) {
  const [searchParams] = useSearchParams()
  const userId = propUserId || searchParams.get('userId')
  const testMode = searchParams.get('testMode') === 'true'
  const [coupons, setCoupons] = useState<Coupon[]>([])
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonSegment, setWonSegment] = useState<Segment | null>(null)
  
  const [segments, setSegments] = useState<Segment[]>([])

  useEffect(() => {
    if (userId && !testMode) {
      fetchCoupons()
    }
    
    if (testMode) {
      // Mock coupons for test with different levels
      setCoupons([
        { id: '1', user_id: userId || '', code: 'BRONZE10', description: '%10 İndirim', discount_type: 'percentage', discount_value: 10, level: 1, quantity: 100, used_count: 0, created_at: '' },
        { id: '2', user_id: userId || '', code: 'SILVER25', description: '%25 İndirim', discount_type: 'percentage', discount_value: 25, level: 2, quantity: 20, used_count: 0, created_at: '' },
        { id: '3', user_id: userId || '', code: 'GOLD50', description: '%50 İndirim', discount_type: 'percentage', discount_value: 50, level: 3, quantity: 5, used_count: 0, created_at: '' },
        { id: '4', user_id: userId || '', code: 'PLATINUM', description: '100TL Hediye', discount_type: 'fixed', discount_value: 100, level: 3, quantity: 1, used_count: 0, created_at: '' }
      ] as any)
    }
  }, [userId, testMode])

  useEffect(() => {
    if (coupons.length > 0) {
      generateSegments()
    }
  }, [coupons])

  const fetchCoupons = async () => {
    if (!userId) return
    const { data } = await supabase.from('coupons').select('*').eq('user_id', userId).gt('quantity', 0)
    if (data) setCoupons(data)
  }

  const generateSegments = () => {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']
    const newSegments: Segment[] = []
    
    // Create 8 segments based on weighted probability
    for (let i = 0; i < 8; i++) {
        // This naturally creates more segments for common coupons (Level 1)
        // and fewer for rare ones (Level 3), visualizing the probability.
        const coupon = selectWeightedCoupon(coupons)
        if (coupon) {
            newSegments.push({
                id: `${i}`,
                label: coupon.description,
                color: colors[i % colors.length],
                value: coupon.discount_type === 'percentage' ? `${coupon.discount_value}` : `${coupon.discount_value}TRY`,
                coupon: coupon
            })
        }
    }
    setSegments(newSegments)
  }

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setWonSegment(null)

    // randomDegrees ensures we land on a random spot
    // Adding extra rotations ensures a satisfying spin duration
    const minSpins = 5
    const randomDegrees = Math.floor(Math.random() * 360) 
    const newRotation = rotation + (minSpins * 360) + randomDegrees
    
    setRotation(newRotation)

    const normalizedRotation = newRotation % 360
    
    setTimeout(() => {
        setIsSpinning(false)
        calculateWinner(normalizedRotation)
    }, 5000)
  }

  const calculateWinner = (degrees: number) => {
    const segmentSize = 360 / segments.length
    
    // Calculate which segment is at the top (pointer position)
    // The wheel rotates clockwise, so we subtract rotation from 360
    const winningIndex = Math.floor(((360 - degrees + 90) % 360) / segmentSize)
    // Note: The +90 adjustment depends on where the first segment starts. 
    // In our CSS, we usually start at 3 o'clock or 12 o'clock.
    // If we render start at 0deg (12 o'clock), we typically don't need offset if logic matches.
    // Let's refine:
    // Implementation renders segments starting at -90deg (12 o'clock).
    // So distinct logic: 
    // Segment i = 0 is at 12 o'clock to 12 + segmentSize.
    
    // Simplest approach: The pointer is at TOP (270deg or -90deg visually? No, pointer is absolute top).
    // Let's assume standard CSS rotation where 0deg is top-center.
    const winner = segments[winningIndex % segments.length]
    
    setWonSegment(winner)
    
    if (winner && winner.value !== '0') {
      triggerConfetti()
      onGameComplete?.(winner.coupon || null)
    }
  }

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const wheelBackground = `conic-gradient(
    ${segments.map((seg, i) => {
      const start = (i * 100) / segments.length
      const end = ((i + 1) * 100) / segments.length
      return `${seg.color} ${start}% ${end}%`
    }).join(', ')}
  )`

  return (
    <div 
        className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-sans"
        style={{
            background: theme?.background || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
        }}
    >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-6 flex flex-col items-center relative z-10">
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg mb-4">
                    <Star className="w-8 h-8 text-white fill-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 drop-shadow-md tracking-tight">
                    Şans Çarkı
                </h1>
                <p className="text-indigo-200 text-sm sm:text-base font-medium">
                    Çevir ve anında kazan! Şans senden yana olsun.
                </p>
            </div>

            {/* Wheel Container */}
            <div className="relative mb-10 group" style={{ width: 'min(80vmin, 400px)', height: 'min(80vmin, 400px)' }}>
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-xl">
                     <div className="w-8 h-10 bg-white clip-path-polygon-[50%_100%,0%_0%,100%_0%] rounded-t-lg"></div>
                     <div className="w-2 h-2 bg-gray-200 rounded-full absolute top-1 left-1.5 shadow-inner"></div>
                </div>

                {/* Outer Rim */}
                <div className="absolute inset-0 rounded-full border-[12px] border-white/20 shadow-inner z-10 pointer-events-none"></div>

                {/* The Wheel */}
                <div 
                    className="w-full h-full rounded-full border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-transform duration-[5000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                    style={{
                        background: wheelBackground,
                        transform: `rotate(${rotation}deg)`
                    }}
                >
                    {segments.map((seg, i) => {
                        const angle = (360 / segments.length) * i + (360 / segments.length) / 2
                        return (
                            <div
                                key={seg.id}
                                className="absolute top-0 left-1/2 w-[1px] h-1/2 -translate-x-1/2 origin-bottom flex justify-center pt-8"
                                style={{ transform: `rotate(${angle}deg)` }}
                            >
                                <div className="text-white font-bold text-sm sm:text-lg drop-shadow-md whitespace-nowrap writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                    {seg.label}
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center z-20 border-4 border-indigo-50">
                    <Gift className={`w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 ${isSpinning ? 'animate-bounce' : ''}`} />
                </div>
            </div>

            {/* Controls */}
            <button
                onClick={spinWheel}
                disabled={isSpinning || !!wonSegment}
                className={`
                    w-full max-w-xs py-4 rounded-xl font-bold text-lg sm:text-xl shadow-xl transition-all relative overflow-hidden group
                    ${isSpinning 
                        ? 'bg-gray-500/50 cursor-not-allowed text-gray-200' 
                        : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:scale-105 active:scale-95 text-white animate-shimmer'}
                `}
            >
                {/* Shine effect */}
                {!isSpinning && <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>}
                
                <span className="relative z-10 flex items-center justify-center">
                    {isSpinning ? (
                        <>
                           <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                           Şansın Dönüyor...
                        </>
                    ) : (
                        'ÇARKI ÇEVİR'
                    )}
                </span>
            </button>
            
            {/* Result Modal Overlay */}
            {wonSegment && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 rounded-3xl animate-in fade-in duration-300">
                    <GameWinModal 
                        coupon={wonSegment.coupon!}
                        onReset={() => {
                            setWonSegment(null)
                            // Optional: Reset rotation or keep accumulation
                        }}
                        gameType="wheel"
                    />
                </div>
            )}
        </div>
    </div>
  )
}

