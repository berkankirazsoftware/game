import React from 'react'
import { Link } from 'react-router-dom'
import { Gamepad as GamepadIcon, Check, Star, Zap, Crown, Palette, BarChart3, Shield, Headphones, Sparkles } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      price: '1.000₺',
      period: '/yıl',
      description: 'Küçük işletmeler için ideal başlangıç paketi',
      features: [
        'Hafıza ve Zamanlama oyunları',
        '3 seviye kupon sistemi',
        'Temel widget entegrasyonu',
        'Aylık 1.000 oyun oynama',
        'E-posta desteği',
        'Temel istatistikler'
      ],
      buttonText: 'Başlayın',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      popular: false,
      icon: GamepadIcon,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Advanced',
      price: 'İletişim',
      period: '',
      description: 'Büyük işletmeler için özelleştirilmiş çözümler',
      features: [
        'Tüm Basic özellikler',
        'Markaya özel oyun tasarımı',
        'Özel oyun geliştirme',
        'Sınırsız oyun oynama',
        'Öncelikli 7/24 destek',
        'Detaylı analitik raporlar',
        'API entegrasyonu',
        'Özel kupon sistemleri',
        'Beyaz etiket çözümü',
        'Özel domain desteği'
      ],
      buttonText: 'İletişime Geçin',
      buttonStyle: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white',
      popular: true,
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  const features = [
    {
      icon: Palette,
      title: 'Markaya Özel Tasarım',
      description: 'Oyunları markanızın renklerine ve tarzına uygun şekilde özelleştirin'
    },
    {
      icon: Sparkles,
      title: 'Özel Oyun Geliştirme',
      description: 'İhtiyaçlarınıza özel yeni oyunlar geliştirelim'
    },
    {
      icon: BarChart3,
      title: 'Detaylı Analitik',
      description: 'Oyuncu davranışları ve kupon kullanım istatistikleri'
    },
    {
      icon: Shield,
      title: 'Kurumsal Güvenlik',
      description: 'SSL sertifikası ve veri güvenliği garantisi'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center">
              <GamepadIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GameCoupon</span>
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Size Uygun
            <span className="text-indigo-600 block">Planı Seçin</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            İşletmenizin büyüklüğüne ve ihtiyaçlarına göre en uygun paketi seçin. 
            Tüm planlar 30 gün para iade garantisi ile gelir.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
                      <Star className="h-4 w-4 mr-1" />
                      En Popüler
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.gradient} mb-4 shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        </div>
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    to="/signup"
                    className={`w-full flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden GameCoupon?
            </h2>
            <p className="text-xl text-gray-600">
              E-ticaret sitenizi daha etkileşimli hale getiren özellikler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sorularınız mı var?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Size en uygun planı seçmenizde yardımcı olmak için buradayız
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@gamecoupon.com"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Headphones className="h-5 w-5 mr-2" />
              E-posta Gönder
            </a>
            <a
              href="tel:+905551234567"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-colors flex items-center justify-center"
            >
              <Zap className="h-5 w-5 mr-2" />
              Hemen Ara
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <GamepadIcon className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">GameCoupon</span>
          </div>
          <div className="text-center text-gray-400 mt-4">
            © 2024 GameCoupon. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}