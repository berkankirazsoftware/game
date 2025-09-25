import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { GamepadIcon, TrendingUp, Users, Gift, Plus, Code } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

export default function Dashboard() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState({
    totalGames: 3, // Sabit 3 oyun
    totalCoupons: 0,
    totalPlays: 0
  })

  useEffect(() => {
    fetchCoupons()
  }, [user])


  const fetchCoupons = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (data) {
      setCoupons(data)
      setStats(prev => ({ ...prev, totalCoupons: data.length }))
    }
  }

  const statCards = [
    {
      title: 'Mevcut Oyunlar',
      value: stats.totalGames,
      icon: GamepadIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Kuponlarım',
      value: stats.totalCoupons,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Toplam Oynama',
      value: stats.totalPlays,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Hoş geldiniz! 👋
        </h1>
        <p className="text-indigo-100">
          GameCoupon ile e-ticaret sitenizi daha etkileşimli hale getirin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Games */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Oyun Widget'ı</h3>
            <Link to="/integration" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Entegrasyon
            </Link>
          </div>
          <div className="text-center py-8">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🐍</div>
                <p className="text-sm font-medium text-gray-700">Yılan Oyunu</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🧠</div>
                <p className="text-sm font-medium text-gray-700">Hafıza Oyunu</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🧩</div>
                <p className="text-sm font-medium text-gray-700">Puzzle Oyunu</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              3 farklı oyun widget'ınızda mevcut
            </p>
            <Link
              to="/integration"
              className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              <Code className="h-4 w-4 mr-2" />
              Widget Kodunu Al
            </Link>
          </div>
        </div>

        {/* Recent Coupons */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Son Kuponlarım</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Kupon Ekle
            </button>
          </div>
          <div className="space-y-3">
            {coupons.length > 0 ? coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Gift className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{coupon.code}</p>
                    <p className="text-sm text-gray-500">{coupon.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz kupon oluşturmadınız</p>
                <p className="text-sm">Oyun seçip kupon ekleyebilirsiniz</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}