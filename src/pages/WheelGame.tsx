import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Gift, Star } from 'lucide-react'
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
}

export default function WheelGame({ embedded = false, userId: propUserId, theme }: WheelGameProps) {
  const [searchParams] = useSearchParams()
  const userId = propUserId || searchParams.get('userId')
  const testMode = searchParams.get('testMode') === 'true'
  const [coupons, setCoupons] = useState<Coupon[]>([])
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonSegment, setWonSegment] = useState<Segment | null>(null)
  
  // Confetti Reference
  const containerRef = useRef<HTMLDivElement>(null)

  const [segments, setSegments] = useState<Segment[]>([])

  useEffect(() => {
    if (userId && !testMode) {
      fetchCoupons()
    }
    
    if (testMode) {
      // Mock coupons for test
      setCoupons([
        { 
          id: 'test-1', user_id: userId || '', code: 'TEST10', description: '%10 İndirim', 
          discount_type: 'percentage', discount_value: 10, level: 1, quantity: 100, used_count: 0, created_at: '' 
        },
        { 
          id: 'test-2', user_id: userId || '', code: 'TEST50', description: '50TL İndirim', 
          discount_type: 'fixed', discount_value: 50, level: 2, quantity: 50, used_count: 0, created_at: '' 
        }
      ])
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
    // Generate segments from coupons
    // We will create 8 segments. If fewer coupons, repeat them.
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']
    const newSegments: Segment[] = []
    
    // Create pool based on weights to fill 8 slots logic or just repeat
    // Simple approach: Use available coupons and fill 8 slots
    for (let i = 0; i < 8; i++) {
        // Pick a weighted coupon for this slot to visualize distribution? 
        // OR better: Create unique segments for each coupon type, but size them differently?
        // Wheel UI usually has equal sized segments. 
        // So we will pick 8 coupons based on their weight to populate the wheel.
        // This visually represents the probability.
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

    // Calculate random angle (min 5 spins = 1800 deg)
    const minSpins = 5
    const randomDegrees = Math.floor(Math.random() * 360)
    const newRotation = rotation + (minSpins * 360) + randomDegrees
    
    setRotation(newRotation)

    // Layout calculation to find winning segment
    // Normalize to 0-360
    const normalizedRotation = newRotation % 360
    
    // In CSS rotate, 0 is at 3 o'clock usually, or top depending on implementation.
    // Let's assume standard CSS circle: Top is 0. 
    // The pointer is usually at the top.
    // If we rotate the wheel clockwise, the segment at the "Top" changes counter-clockwise relative to the wheel.
    // Winning Angle = 360 - normalizedRotation.
    
    // Wait for animation to finish (5s)
    setTimeout(() => {
        setIsSpinning(false)
        calculateWinner(normalizedRotation)
    }, 5000)
  }

  const calculateWinner = (degrees: number) => {
    // Correct angle logic for a pointer at the TOP (0deg visually)
    // If wheel rotates 90deg (clockwise), the segment at 270deg (left) moves to top? 
    // Actually simpler: 
    // Segment Index = floor( (360 - (degrees % 360)) / segmentSize )
    
    const segmentSize = 360 / segments.length
    // Adjust for offset if needed.
    const winningIndex = Math.floor(((360 - degrees) % 360) / segmentSize)
    const winner = segments[winningIndex]
    
    setWonSegment(winner)
    
    if (winner.value !== '0') {
      triggerConfetti()
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

  // Create conic gradient for the wheel
  const wheelBackground = `conic-gradient(
    ${segments.map((seg, i) => {
      const start = (i * 100) / segments.length
      const end = ((i + 1) * 100) / segments.length
      return `${seg.color} ${start}% ${end}%`
    }).join(', ')}
  )`

  return (
    <div 
        className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
        style={{
            background: theme?.background || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
        }}
    >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-block p-3 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                    <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 filter drop-shadow-lg">
                    Şans Çarkı
                </h1>
                <p className="text-indigo-200 text-sm">
                    Çarkı çevir, sürpriz hediyeleri yakala!
                </p>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full aspect-square max-w-[320px] mx-auto mb-8">
                {/* Pointer (Triangle) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-lg"></div>

                {/* The Wheel */}
                <div 
                    className="w-full h-full rounded-full border-4 border-white shadow-2xl relative transition-transform duration-[5000ms] cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                    style={{
                        background: wheelBackground,
                        transform: `rotate(${rotation}deg)`
                    }}
                >
                     {/* Segment Labels */}
                     {segments.map((seg, i) => {
                         const angle = (360 / segments.length) * i + (360 / segments.length) / 2
                         return (
                             <div
                                 key={seg.id}
                                 className="absolute top-1/2 left-1/2 w-full h-[1px] -translate-y-1/2 origin-left"
                                 style={{ transform: `rotate(${angle - 90}deg)` }} // -90 to start from top
                             >
                                 <div className="absolute right-8 -translate-y-1/2 text-white font-bold text-sm sm:text-base drop-shadow-md whitespace-nowrap" style={{ transform: 'rotate(90deg)' }}>
                                     {seg.label}
                                 </div>
                             </div>
                         )
                     })}
                </div>
                
                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-indigo-100">
                    <Gift className="w-8 h-8 text-indigo-600" />
                </div>
            </div>

            {/* Controls */}
            <div className="text-center">
                {!wonSegment ? (
                    <button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className={`
                            px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all
                            ${isSpinning 
                                ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 hover:scale-105 active:scale-95 text-white ring-4 ring-yellow-200/30'}
                        `}
                    >
                        {isSpinning ? 'Bol Şans...' : 'ÇEVİR'}
                    </button>
                ) : (
                    <GameWinModal 
                        coupon={wonSegment.coupon!}
                        onReset={() => {
                            setIsSpinning(false)
                            setWonSegment(null)
                        }}
                        gameType="wheel"
                    />
                )}
            </div>
        </div>
    </div>
  )
}
