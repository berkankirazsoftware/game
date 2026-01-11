import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, Zap, Star, Check, Gamepad2 } from 'lucide-react'

// MVP: Only Free Plan available
const FREE_LIMIT = 100;

export default function SubscriptionPage() {
  const { user } = useAuth()
  
  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Abonelik Yönetimi</h1>
        <p className="text-gray-600">
          Mevcut abonelik planınızı ve detaylarını görüntüleyin
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Active Plan Card - Static Free Plan */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-500 to-gray-700 p-8 text-white relative overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <Gamepad2 className="h-12 w-12 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    Free Plan
                  </h2>
                  <p className="text-xl opacity-90">
                    Ücretsiz
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg bg-green-500 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktif
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-bold text-gray-900 text-sm">Paket</span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    Başlangıç Paketi (MVP)
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-indigo-600 mr-2" />
                        <span className="font-bold text-gray-900 text-sm">Limit</span>
                    </div>
                  <p className="text-gray-700 font-medium">
                    Aylık {FREE_LIMIT} E-posta
                  </p>
                </div>
            </div>

            {/* Plan Features */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <Star className="w-5 h-5 mr-2 text-indigo-600" />
                Plan Özellikleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Temel Oyunlar (Yılan, vb.)',
                  'Standart Temalar',
                  'E-posta Toplama',
                  'Otomatik Kupon Gönderimi',
                  `Aylık ${FREE_LIMIT} e-posta hakkı`
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}