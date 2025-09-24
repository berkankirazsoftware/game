import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Gift, 
  Plus, 
  Trash2, 
  Edit3,
  Check,
  X
} from 'lucide-react'
import type { Database } from '../lib/supabase'

type Coupon = Database['public']['Tables']['coupons']['Row']

export default function CouponsPage() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0
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
    }
  }

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('coupons')
      .insert([{
        user_id: user.id,
        game_id: null,
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
      discount_value: 0
    })
  }

  const cancelEdit = () => {
    setEditingCoupon(null)
    resetForm()
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

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {coupons.length > 0 ? (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Gift className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{coupon.code}</h3>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                      <p className="text-xs text-gray-500">
                        Oluşturulma: {new Date(coupon.created_at).toLocaleDateString('tr-TR')}
                      </p>
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
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                İlk Kuponunuzu Oluşturun
              </button>
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