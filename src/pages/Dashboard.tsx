import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Bell, BarChart3, Gift, AlertCircle, CheckCircle, Clock } from 'lucide-react'

import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

export default function Dashboard() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState({
    totalCoupons: 0,
    totalUsedCoupons: 0,
    totalAvailableCoupons: 0
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
      const totalUsed = data.reduce((sum, coupon) => sum + coupon.used_count, 0)
      const totalAvailable = data.reduce((sum, coupon) => sum + (coupon.quantity - coupon.used_count), 0)
      setStats({
        totalCoupons: data.length,
        totalUsedCoupons: totalUsed,
        totalAvailableCoupons: totalAvailable
      })
    }
  }

  const statCards = [
    {
      title: 'Toplam Kupon',
      value: stats.totalCoupons,
      icon: Gift,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Kullanılan Kupon',
      value: stats.totalUsedCoupons,
      icon: Gift,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Kalan Kupon',
      value: stats.totalAvailableCoupons,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Widget Aktif',
      message: 'Oyun widget\'ınız başarıyla çalışıyor',
      time: '2 saat önce',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'warning',
      title: 'Kupon Stoku Azalıyor',
      message: 'Level 2 kuponunuzun stoku %20\'nin altına düştü',
      time: '5 saat önce',
      icon: AlertCircle
    },
    {
      id: 3,
      type: 'info',
      title: 'Yeni Oyuncu',
      message: '3 yeni oyuncu kupon kazandı',
      time: '1 gün önce',
      icon: Clock
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
        {/* Bildirimler */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Bildirimler
            </h3>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon
              const typeColors = {
                success: 'text-green-600 bg-green-50 border-green-200',
                warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                info: 'text-blue-600 bg-blue-50 border-blue-200'
              }
              
              return (
                <div key={notification.id} className={`p-4 rounded-lg border ${typeColors[notification.type as keyof typeof typeColors]}`}>
                  <div className="flex items-start">
                    <Icon className="h-5 w-5 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                      <p className="text-xs opacity-75 mt-2">{notification.time}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Kupon İstatistikleri */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Kupon İstatistikleri
            </h3>
            <Link to="/coupons" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-4">
            {coupons.length > 0 ? coupons.map((coupon) => {
              const usagePercentage = coupon.quantity > 0 ? (coupon.used_count / coupon.quantity) * 100 : 0
              const remaining = coupon.quantity - coupon.used_count
              
              return (
                <div key={coupon.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{coupon.code}</h4>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Kullanılan: {coupon.used_count}/{coupon.quantity}
                    </span>
                    <span className={`font-medium ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {remaining > 0 ? `${remaining} kalan` : 'Tükendi'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${usagePercentage >= 80 ? 'bg-red-500' : usagePercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz kupon oluşturmadınız</p>
                <Link
                  to="/coupons"
                  className="inline-block mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  İlk kuponunuzu oluşturun
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
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