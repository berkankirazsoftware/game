import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Gift, Plus, Trash2, CreditCard as Edit3, Check, X } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

export default function CouponsPage() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [levelCounts, setLevelCounts] = useState({ 1: 0, 2: 0, 3: 0 })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    level: 1,
    quantity: 1
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
    
    if (data) {
      setCoupons(data)
      
      // Level sayılarını hesapla
      const counts = { 1: 0, 2: 0, 3: 0 }
      data.forEach(coupon => {
        counts[coupon.level as keyof typeof counts]++
      })
      setLevelCounts(counts)
    }
  }

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('coupons')
      .insert([{
        user_id: user.id,
        ...couponForm
      }])

    if (!error) {
      fetchCoupons()
      setShowAddModal(false)
      resetForm()
    }
  }

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return

    const { error } = await supabase
      .from('coupons')
      .update(couponForm)
      .eq('id', editingCoupon.id)

    if (!error) {
      fetchCoupons()
      setEditingCoupon(null)
      resetForm()
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)

    if (!error) {
      fetchCoupons()
    }
  }

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    })
  }

  const resetForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      level: 1,
      quantity: 1
    })
  }

  const cancelEdit = () => {
    setEditingCoupon(null)
    resetForm()
  }

  const getLevelInfo = (level: number) => {
    const levelData = {
      1: {
        name: 'Level 1 - Başlangıç',
        description: 'Az başarılı oyunculara verilir',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🥉'
      },
      2: {
        name: 'Level 2 - Orta',
        description: 'Orta başarılı oyunculara verilir',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '🥈'
      },
      3: {
        name: 'Level 3 - Uzman',
        description: 'Çok başarılı oyunculara verilir',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🥇'
      }
    }
    return levelData[level as keyof typeof levelData]
  }

  const canAddLevel = (level: number) => {
    return levelCounts[level as keyof typeof levelCounts] === 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kuponlar</h1>
          <p className="text-gray-600">Oyun kazananlar için kuponlarınızı yönetin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kupon
        </button>
      </div>

      {/* Level Açıklaması */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          🎯 Kupon Seviyeleri Nasıl Çalışır?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(level => {
            const info = getLevelInfo(level)
            const hasLevel = levelCounts[level as keyof typeof levelCounts] > 0
            return (
              <div key={level} className={`p-4 rounded-lg border-2 ${info.color}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{info.icon}</span>
                  <h4 className="font-semibold">{info.name}</h4>
                </div>
                <p className="text-sm mb-2">{info.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {hasLevel ? '✅ Kupon Mevcut' : '❌ Kupon Gerekli'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Önemli Kurallar:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Her seviyeden <strong>sadece 1 kupon</strong> ekleyebilirsiniz</li>
            <li>• Widget'ın çalışması için <strong>3 seviyenin de</strong> kuponları olmalı</li>
            <li>• Oyuncu başarısına göre otomatik seviye seçimi yapılır</li>
            <li>• Kupon miktarı bitince o seviye için yeni kupon verilemez</li>
          </ul>
        </div>
      </div>

      {/* Progress Göstergesi */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Kupon Durumu ({Object.values(levelCounts).filter(count => count > 0).length}/3 Seviye Tamamlandı)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(level => {
            const info = getLevelInfo(level)
            const hasLevel = levelCounts[level as keyof typeof levelCounts] > 0
            const coupon = coupons.find(c => c.level === level)
            
            return (
              <div key={level} className={`p-4 rounded-lg border-2 ${hasLevel ? info.color : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{hasLevel ? info.icon : '⚪'}</span>
                    <span className="font-medium text-sm">{info.name}</span>
                  </div>
                  {hasLevel && (
                    <span className="text-xs px-2 py-1 bg-white rounded-full">
                      {coupon?.quantity} adet
                    </span>
                  )}
                </div>
                {hasLevel && coupon ? (
                  <div className="text-xs">
                    <div className="font-medium">{coupon.code}</div>
                    <div className="text-gray-600">{coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Kupon eklenmedi</div>
                )}
              </div>
            )
          })}
        </div>
        
        {Object.values(levelCounts).filter(count => count > 0).length < 3 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Widget'ın çalışması için tüm seviyelerin kuponları gerekli. 
              Eksik seviyeler: {[1, 2, 3].filter(level => levelCounts[level as keyof typeof levelCounts] === 0).map(level => `Level ${level}`).join(', ')}
            </p>
          </div>
        )}
      </div>
      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {coupons.length > 0 ? (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex flex-col items-center mr-4">
                      <Gift className="h-6 w-6 text-green-600" />
                      <span className="text-xs mt-1 px-2 py-1 rounded-full bg-white border">
                        {getLevelInfo(coupon.level).icon} L{coupon.level}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{coupon.code}</h3>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getLevelInfo(coupon.level).color}`}>
                          {getLevelInfo(coupon.level).name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Miktar: {coupon.quantity - coupon.used_count}/{coupon.quantity}</span>
                        <span>Oluşturulma: {new Date(coupon.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                      </p>
                      <p className="text-xs text-gray-500">
                        {coupon.discount_type === 'percentage' ? 'Yüzde' : 'Sabit'} İndirim
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {coupon.quantity - coupon.used_count > 0 ? (
                          <span className="text-green-600">✅ Stokta</span>
                        ) : (
                          <span className="text-red-600">❌ Tükendi</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(coupon)}
                        className="text-blue-600 hover:text-blue-700 p-2"
                        title="Düzenle"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                      </div>

              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Henüz kupon oluşturmadınız
              </h3>
              <p className="text-gray-600 mb-6">
                Oyun kazananlar için kuponlar oluşturun
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  İlk Kuponunuzu Oluşturun
                </button>
                <p className="text-sm text-gray-500">
                  Kuponlar widget'taki tüm oyunlar için geçerli olacak
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Kupon Ekle</h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kupon Kodu
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: INDIRIM20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Kupon açıklaması"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kupon Seviyesi
                  </label>
                  <select
                    value={couponForm.level}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      level: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {[1, 2, 3].map(level => {
                      const info = getLevelInfo(level)
                      const canAdd = canAddLevel(level)
                      return (
                        <option key={level} value={level} disabled={!canAdd}>
                          {info.icon} {info.name} {!canAdd ? '(Zaten Mevcut)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getLevelInfo(couponForm.level).description}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Tipi
                  </label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      discount_type: e.target.value as 'percentage' | 'fixed' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Miktarı
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      discount_value: Number(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kupon Miktarı
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={couponForm.quantity}
                  onChange={(e) => setCouponForm({ 
                    ...couponForm, 
                    quantity: Number(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Kaç adet kupon verilecek"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Kupon Ekle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kupon Düzenle</h3>
            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kupon Kodu
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Tipi
                  </label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      discount_type: e.target.value as 'percentage' | 'fixed' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Miktarı
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      discount_value: Number(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kupon Miktarı
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={couponForm.quantity}
                  onChange={(e) => setCouponForm({ 
                    ...couponForm, 
                    quantity: Number(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kaç adet kupon verilecek"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}