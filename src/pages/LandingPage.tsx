import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Gamepad as GamepadIcon, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  Code, 
  Layout, 
  Gift,
  Play,
  Star
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Code,
      title: 'Tak-Çalıştır Entegrasyon',
      description: 'Ikas, Shopify veya herhangi bir altyapı. Script kodunu eklemeniz yeterli.'
    },
    {
      icon: TrendingUp,
      title: 'Lead Toplama',
      description: 'Oyun sonunda müşterilerin WhatsApp veya E-mail bilgilerini toplayın.'
    },
    {
      icon: Gift,
      title: 'Otomatik Mesajlaşma',
      description: 'Kazanılan kuponları ve hatırlatmaları müşterilerinize otomatik gönderin.'
    },
    {
      icon: Shield,
      title: 'KVKK Uyumlu',
      description: 'Verileriniz güvende ve yasal mevzuatlara tamamen uyumlu.'
    }
  ]

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      business: 'TechStore',
      content: 'Booste sayesinde satışlarımız %35 arttı. Müşteriler oyun oynamayı çok seviyor!'
    },
    {
      name: 'Elif Demir',
      business: 'ModaBoutique',
      content: 'Kupon sistemi harika çalışıyor. Müşteriler oyun oynayıp indirim kazanıyor.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GamepadIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Booste</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Fiyatlar
              </Link>
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
                Yeni Nesil E-ticaret Pazarlaması
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Ziyaretçilerinizi <br/>
                <span className="text-indigo-600">Oyunla Müşteriye</span> <br/>
                Dönüştürün
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Klasik pop-up'lardan sıkılan müşterilerinize eğlenceli bir deneyim sunun. 
                Oyun oynatın, kupon verin, satışlarınızı %30 artırın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  Ücretsiz Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <div className="flex items-center gap-4 px-4 py-2 text-gray-600">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">1000+ Mutlu Müşteri</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <GamepadIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Kazan Kazan Oyunu</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Aktif • TechStore
                    </div>
                  </div>
                </div>
                
                {/* Mock Game UI */}
                <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="animate-bounce mb-4">
                    <Gift className="h-16 w-16 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tebrikler!</h3>
                  <p className="text-gray-600 mb-4">Yılan oyununda 150 puan topladın.</p>
                  <div className="bg-white border border-indigo-200 px-6 py-3 rounded-lg font-mono text-indigo-600 font-bold text-xl mb-2">
                    YILAN20
                  </div>
                  <p className="text-xs text-gray-500">%20 İndirim Kazandınız</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Integration Code */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Karmaşık entegrasyon süreçlerini unutun. Sadece 3 adımda sisteminiz hazır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layout className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Oyununu Seç</h3>
              <p className="text-gray-600">
                Markana uygun oyunu kütüphanemizden seç ve kurallarını belirle.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center relative">
              <div className="absolute top-1/2 -right-4 hidden md:block z-10">
                <ArrowRight className="h-8 w-8 text-gray-300" />
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. Ödülleri Belirle</h3>
              <p className="text-gray-600">
                Kazanılacak kupon oranlarını ve kazanma zorluğunu ayarla.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Scripti Ekleyin</h3>
              <p className="text-gray-600">
                Size verilen kodu sitenizin &lt;head&gt; veya &lt;body&gt; alanına yapıştırın. Ikas ve Shopify ile tam uyumlu.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-gray-400 text-sm font-mono">index.html</div>
            </div>
            <div className="font-mono text-sm sm:text-base">
              <div className="text-gray-400">&lt;!-- Booste Widget Code --&gt;</div>
              <div className="text-blue-400">&lt;script</div>
              <div className="pl-4">
                <span className="text-purple-400">src</span>=
                <span className="text-green-400">"https://cdn.booste.com/widget.js"</span>
              </div>
              <div className="pl-4">
                <span className="text-purple-400">data-api-key</span>=
                <span className="text-green-400">"bst_123456789"</span>
              </div>
              <div className="text-blue-400">&gt;&lt;/script&gt;</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oyun Kütüphanesi
            </h2>
            <p className="text-xl text-gray-600">
              Sürekli genişleyen oyun seçenekleri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Wheel Game Card */}
            <Link 
              to="/game/wheel-demo?testMode=true" 
              target="_blank"
              className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-transform hover:-translate-y-1 block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1605020420620-20c943cc4669?q=80&w=800&auto=format&fit=crop" 
                alt="Spin Wheel" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Şans Çarkı</h3>
                    <p className="text-gray-200 text-sm">Klasik çarkıfelek. Çevir ve büyük ödülü kazan.</p>
                  </div>
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-indigo-600">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                </div>
              </div>
            </Link>
            {/* Snake Game Card */}
            <Link 
              to="/game/snake-demo?testMode=true" 
              target="_blank"
              className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-transform hover:-translate-y-1 block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800&auto=format&fit=crop" 
                alt="Snake Game" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Snake (Yılan)</h3>
                    <p className="text-gray-200 text-sm">Klasik yılan oyunu. Yemleri topla, uza ve kazan.</p>
                  </div>
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-indigo-600">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Memory Game Card */}
            <Link 
              to="/memory/memory-demo?testMode=true" 
              target="_blank"
              className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-transform hover:-translate-y-1 block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=800&auto=format&fit=crop" 
                alt="Memory Game" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
               <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Hafıza Kartları</h3>
                    <p className="text-gray-200 text-sm">Eşleşen kartları bul, hafızanı test et ve kazan.</p>
                  </div>
                   <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-indigo-600">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden Booste?
            </h2>
            <p className="text-xl text-gray-600">
              E-ticaret sitenizi daha etkileşimli hale getirin
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-indigo-100">Aktif E-ticaret Sitesi</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">%40</div>
              <div className="text-indigo-100">Ortalama Satış Artışı</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-indigo-100">Aylık Oyun Oynama</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hazır mısınız?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Bugün başlayın ve satışlarınızı artırmaya başlayın
          </p>
          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <GamepadIcon className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">Booste</span>
          </div>
          <div className="text-center text-gray-400 mt-4">
            © 2024 Booste. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}