import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Crown, Calendar, CheckCircle, XCircle, AlertTriangle, Zap, Star, Shield } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [user])

  const fetchSubscription = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Subscription fetch error:', error)
      } else {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanInfo = (planType: string) => {
    const plans = {
      basic: {
        name: 'Basic Plan',
        price: '1.000₺/yıl',
        color: 'indigo',
        icon: Zap,
        features: [
          'Hafıza ve Zamanlama oyunları',
          '3 seviye kupon sistemi',
          'Temel widget entegrasyonu',
          'Aylık 1.000 oyun oynama',
          'E-posta desteği',
          'Temel istatistikler'
        ]
      },
      advanced: {
        name: 'Advanced Plan',
        price: 'Özel Fiyat',
        color: 'yellow',
        icon: Crown,
        features: [
          'Tüm Basic özellikler',
          'Markaya özel oyun tasarımı',
          'Özel oyun geliştirme',
          'Sınırsız oyun oynama',
          'Öncelikli 7/24 destek',
          'Detaylı analitik raporlar',
          'API entegrasyonu',
          'Beyaz etiket çözümü'
        ]
      }
    }
    return plans[planType as keyof typeof plans] || plans.basic
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false
    return new Date(expirationDate) < new Date()
  }

  const getDaysUntilExpiration = (expirationDate: string | null) => {
    if (!expirationDate) return null
    const today = new Date()
    const expiry = new Date(expirationDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Abonelik Durumu</h1>
        <p className="text-gray-600">
          Mevcut abonelik planınızı ve detaylarını görüntüleyin
        </p>
      </div>

      {subscription ? (
        <div className="max-w-4xl mx-auto">
          {/* Subscription Status Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className={`bg-gradient-to-r ${
              subscription.plan_type === 'advanced' 
                ? 'from-yellow-500 to-orange-500' 
                : 'from-indigo-600 to-purple-600'
            } p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {React.createElement(getPlanInfo(subscription.plan_type).icon, {
                    className: "h-8 w-8 mr-3"
                  })}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {getPlanInfo(subscription.plan_type).name}
                    </h2>
                    <p className="text-lg opacity-90">
                      {getPlanInfo(subscription.plan_type).price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    subscription.is_active && !isExpired(subscription.expiration_date)
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {subscription.is_active && !isExpired(subscription.expiration_date) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        {isExpired(subscription.expiration_date) ? 'Süresi Dolmuş' : 'Pasif'}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-900">Başlangıç Tarihi</span>
                  </div>
                  <p className="text-gray-700">
                    {formatDate(subscription.start_date)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-900">Bitiş Tarihi</span>
                  </div>
                  <p className="text-gray-700">
                    {subscription.expiration_date 
                      ? formatDate(subscription.expiration_date)
                      : 'Belirsiz'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-900">Kalan Süre</span>
                  </div>
                  <p className="text-gray-700">
                    {subscription.expiration_date ? (
                      getDaysUntilExpiration(subscription.expiration_date) !== null ? (
                        getDaysUntilExpiration(subscription.expiration_date)! > 0 ? (
                          `${getDaysUntilExpiration(subscription.expiration_date)} gün`
                        ) : (
                          <span className="text-red-600 font-semibold">Süresi dolmuş</span>
                        )
                      ) : (
                        'Hesaplanamadı'
                      )
                    ) : (
                      'Sınırsız'
                    )}
                  </p>
                </div>
              </div>

              {/* Expiration Warning */}
              {subscription.expiration_date && getDaysUntilExpiration(subscription.expiration_date) !== null && (
                getDaysUntilExpiration(subscription.expiration_date)! <= 30 && 
                getDaysUntilExpiration(subscription.expiration_date)! > 0
              ) && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-800">Abonelik Uyarısı</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    Aboneliğinizin süresi {getDaysUntilExpiration(subscription.expiration_date)} gün içinde dolacak. 
                    Kesintisiz hizmet için yenileme yapın.
                  </p>
                </div>
              )}

              {/* Plan Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Özellikleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getPlanInfo(subscription.plan_type).features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription History */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonelik Geçmişi</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {getPlanInfo(subscription.plan_type).name} Aktivasyonu
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(subscription.created_at)}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(subscription.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Subscription */
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aktif Abonelik Bulunamadı
            </h2>
            <p className="text-gray-600 mb-8">
              Henüz aktif bir aboneliğiniz bulunmuyor. GameCoupon'un tüm özelliklerinden 
              yararlanmak için bir plan seçin.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Abonelik Nasıl Alınır?</h3>
                <p className="text-blue-800 text-sm">
                  <strong>Site Sahibi:</strong> Aboneliğinizi aktif etmek için Booste ile iletişime geçin
                  Abonelik almak için lütfen bizimle iletişime geçin.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@booste.com"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  E-posta Gönder
                </a>
                <a
                  href="tel:+905551234567"
                  className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Telefon Et
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}