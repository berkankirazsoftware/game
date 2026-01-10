import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Crown, Calendar, CheckCircle, XCircle, AlertTriangle, Zap, Star, Shield, Check, Gamepad2 } from 'lucide-react'
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
      free: {
        name: 'Free Plan',
        price: '0₺/ay',
        color: 'gray',
        icon: Gamepad2,
        features: [
          'Temel Oyunlar (Yılan, vb.)',
          'Standart Temalar',
          'E-posta Toplama (Görüntüleme Kapalı)',
          'Otomatik Kupon Gönderimi',
          'Aylık 500 oyun hakkı'
        ]
      },
      basic: {
        name: 'Growth Plan',
        price: '1.000₺/ay',
        color: 'indigo',
        icon: Zap,
        features: [
          'Tüm Free özellikler',
          'Pro Oyunlar (Hafıza, Çarkıfelek)',
          'WhatsApp & Email Veri Toplama',
          'Gizli Numara ile Mesajlaşma',
          'Otomatik Pazarlama Kampanyaları',
          'Detaylı Analitik & Raporlama',
          'Özelleştirilebilir Temalar'
        ]
      },
      advanced: {
        name: 'Enterprise Plan',
        price: 'Özel Fiyat',
        color: 'yellow',
        icon: Crown,
        features: [
          'Markaya Özel Oyun Kurgusu',
          'Full API Erişimi',
          'Özel CRM Entegrasyonu',
          'Özel Dedicated Sunucu',
          '7/24 Öncelikli Destek',
          'Custom Domain',
          'Sınırsız Kullanım'
        ]
      }
    }
    return plans[planType as keyof typeof plans] || plans.free
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

  // If no subscription, show Free plan as active
  const activePlan = subscription || {
    plan_type: 'free',
    is_active: true,
    start_date: new Date().toISOString(),
    expiration_date: null,
    created_at: new Date().toISOString()
  }

  const planInfo = getPlanInfo(activePlan.plan_type)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Abonelik Yönetimi</h1>
        <p className="text-gray-600">
          Mevcut abonelik planınızı ve detaylarını görüntüleyin
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Active Plan Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className={`bg-gradient-to-r ${
            activePlan.plan_type === 'advanced' 
              ? 'from-yellow-500 to-orange-500' 
              : activePlan.plan_type === 'basic'
              ? 'from-indigo-600 to-purple-600'
              : 'from-gray-500 to-gray-700'
          } p-8 text-white relative overflow-hidden`}>
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                {React.createElement(planInfo.icon, {
                  className: "h-12 w-12 mr-4"
                })}
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {planInfo.name}
                  </h2>
                  <p className="text-xl opacity-90">
                    {planInfo.price}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  subscription && subscription.is_active && !isExpired(subscription.expiration_date)
                    ? 'bg-green-500 text-white'
                    : !subscription
                    ? 'bg-white/30 text-white backdrop-blur-sm'
                    : 'bg-red-500 text-white'
                }`}>
                  {subscription && subscription.is_active && !isExpired(subscription.expiration_date) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aktif
                    </>
                  ) : !subscription ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Free Plan Aktif
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

          <div className="p-8">
            {/* Stats Grid */}
            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-bold text-gray-900 text-sm">Başlangıç</span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {formatDate(subscription.start_date)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-bold text-gray-900 text-sm">Bitiş</span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {subscription.expiration_date 
                      ? formatDate(subscription.expiration_date)
                      : 'Belirsiz'
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-bold text-gray-900 text-sm">Kalan Süre</span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {subscription.expiration_date ? (
                      getDaysUntilExpiration(subscription.expiration_date) !== null ? (
                        getDaysUntilExpiration(subscription.expiration_date)! > 0 ? (
                          `${getDaysUntilExpiration(subscription.expiration_date)} gün`
                        ) : (
                          <span className="text-red-600 font-bold">Süresi dolmuş</span>
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
            )}

            {/* Expiration Warning */}
            {subscription && subscription.expiration_date && getDaysUntilExpiration(subscription.expiration_date) !== null && (
              getDaysUntilExpiration(subscription.expiration_date)! <= 30 && 
              getDaysUntilExpiration(subscription.expiration_date)! > 0
            ) && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-lg mb-8">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1">Abonelik Uyarısı</h4>
                    <p className="text-amber-800 text-sm">
                      Aboneliğinizin süresi {getDaysUntilExpiration(subscription.expiration_date)} gün içinde dolacak. 
                      Kesintisiz hizmet için yenileme yapın.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Features */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <Star className="w-5 h-5 mr-2 text-indigo-600" />
                Plan Özellikleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {planInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            {!subscription && (
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  Daha Fazla Özellik mi İstiyorsunuz?
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Growth veya Enterprise planlarıyla işinizi bir üst seviyeye taşıyın. Detaylı analitikler, özel oyunlar ve sınırsız kullanım için bizimle iletişime geçin.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:info@booste.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    E-posta Gönder
                  </a>
                  <a
                    href="tel:+905551234567"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                  >
                    Telefon Et
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription History (only if has subscription) */}
        {subscription && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Abonelik Geçmişi</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Star className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {planInfo.name} Aktivasyonu
                    </p>
                    <p className="text-sm text-gray-500">
                      İlk aktivasyon tarihi
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200">
                  {formatDate(subscription.created_at)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}