import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Zap, Gift, AlertCircle, CheckCircle, Mail, Activity } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    emailUsage: 0,
    emailLimit: 100,
    isWidgetActive: false,
    hasActiveCampaign: false,
    hasValidCoupons: false
  })
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // 1. Get Active Campaign
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
      
      const hasActiveCampaign = !!(campaignData && campaignData.length > 0)
      // 2. Get Monthly Email Usage
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      
      const { count: emailCount } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
      
      const currentUsage = emailCount || 0
      const planLimit = 100 // Hardcoded free limit for MVP

      // 3. Check Coupons
      const { data: coupons } = await supabase
        .from('coupons')
        .select('level, quantity, used_count')
        .eq('user_id', user.id)
      
      const levelsMap = new Set()
      if (coupons) {
        coupons.forEach(c => {
            if (c.quantity > c.used_count) {
                levelsMap.add(c.level)
            }
        })
      }
      const hasValidCoupons = levelsMap.has(1) && levelsMap.has(2) && levelsMap.has(3)

      const isWidgetActive = !!(hasActiveCampaign && hasValidCoupons && currentUsage < planLimit)

      setStats({
        emailUsage: currentUsage,
        emailLimit: planLimit,
        isWidgetActive,
        hasActiveCampaign,
        hasValidCoupons
      })

      // 3. Generate Derived Notifications
      const newNotifications = []

      // Widget Status Notification
      if (isWidgetActive) {
        newNotifications.push({
          id: 'widget-active',
          type: 'success',
          title: 'Widget Yayında',
          message: 'Widget\'ınız web sitenizde aktif ve görüntüleniyor.',
          time: 'Şimdi',
          icon: Activity
        })
      } else {
        if (!hasActiveCampaign) {
          newNotifications.push({
            id: 'no-campaign',
            type: 'warning',
            title: 'Aktif Kampanya Yok',
            message: 'Widget\'ın görünmesi için lütfen bir kampanya oluşturun.',
            time: 'Şimdi',
            icon: AlertCircle
          })
        }
        if (!hasValidCoupons) {
            newNotifications.push({
              id: 'missing-coupons',
              type: 'error',
              title: 'Eksik Kuponlar',
              message: 'Widget\'ın çalışması için her seviye (1, 2, 3) için stokta kupon bulunmalıdır.',
              time: 'Şimdi',
              icon: AlertCircle
            })
        }
      }

      // Usage Notification
      if (currentUsage >= planLimit) {
        newNotifications.push({
          id: 'limit-reached',
          type: 'error',
          title: 'Limit Aşıldı',
          message: 'Aylık e-posta limitinize ulaştınız. Widget gösterimi durduruldu.',
          time: 'Şimdi',
          icon: AlertCircle
        })
      } else if (currentUsage >= planLimit * 0.8) {
         newNotifications.push({
          id: 'limit-warning',
          type: 'warning',
          title: 'Limit Uyarısı',
          message: `Aylık limitinizin %80'ine ulaştınız. (${currentUsage}/${planLimit})`,
          time: 'Şimdi',
          icon: AlertCircle
        })
      } else {
        newNotifications.push({
          id: 'usage-info',
          type: 'info',
          title: 'Aylık Kullanım',
          message: `Bu ay ${currentUsage} adet e-posta topladınız.`,
          time: 'Bu ay',
          icon: Mail
        })
      }

      setNotifications(newNotifications)

    } catch (error) {
      console.error('Dashboard data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Widget Durumu',
      value: stats.isWidgetActive ? 'Aktif' : 'Pasif',
      icon: Activity,
      color: stats.isWidgetActive ? 'text-green-600' : 'text-red-600',
      bgColor: stats.isWidgetActive ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Bu Ay Gönderilen',
      value: stats.emailUsage,
      icon: Mail,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Aylık Limit',
      value: stats.emailLimit,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Kalan Hak',
      value: Math.max(0, stats.emailLimit - stats.emailUsage),
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  if (loading) {
     return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Hoş geldiniz! 👋
          </h1>
          <p className="text-indigo-100">
            Booste ile e-ticaret sitenizi daha etkileşimli hale getirin
          </p>
        </div>
        <Link 
          to="/campaigns/new" 
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg flex items-center"
        >
          <Gift className="h-5 w-5 mr-2" />
          Booste Oluştur
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-indigo-600" />
            Önemli Bildirimler
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{notifications.length} Yeni</span>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = notification.icon
              const typeClasses = {
                success: 'bg-green-50 text-green-700 border-green-200',
                warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                error: 'bg-red-50 text-red-700 border-red-200',
                info: 'bg-blue-50 text-blue-700 border-blue-200'
              }
              
              return (
                <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-4 ${typeClasses[notification.type as keyof typeof typeClasses]} bg-opacity-20`}>
                       <Icon className={`h-5 w-5 ${typeClasses[notification.type as keyof typeof typeClasses].split(' ')[1]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <span className="text-xs text-gray-400 font-medium">{notification.time}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>Yeni bildiriminiz yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}