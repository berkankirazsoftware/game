import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Gift, Plus, Trash2, CreditCard as Edit3, Check, X, AlertCircle } from 'lucide-react'
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
      discount_value: coupon.discount_value,
      level: coupon.level,
      quantity: coupon.quantity
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Kupon Yönetimi</h1>
          <p className="text-gray-500 mt-1">
            Oyunlarınızda dağıtılacak indirim kuponlarını buradan yönetin.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Kupon Oluştur
        </button>
      </div>

      {/* Level Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(level => {
          const info = getLevelInfo(level)
          const hasLevel = levelCounts[level as keyof typeof levelCounts] > 0
          const coupon = coupons.find(c => c.level === level)
          
          return (
            <div 
              key={level} 
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                hasLevel 
                  ? 'bg-white border-green-100 shadow-sm hover:shadow-md' 
                  : 'bg-gray-50 border-dashed border-gray-300'
              }`}
            >
              {/* Level Decorative Background */}
              {hasLevel && (
                <div className={`absolute top-0 right-0 p-4 opacity-10 ${info.color.replace('bg-', 'text-')}`}>
                  <Gift className="w-24 h-24 transform rotate-12 -mr-8 -mt-8" />
                </div>
              )}
              
              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                        level === 3 ? 'bg-yellow-100' : level === 2 ? 'bg-gray-100' : 'bg-orange-100'
                    }`}>
                        {info.icon}
                    </div>
                    {hasLevel ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           <Check className="w-3 h-3 mr-1" /> Aktif
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                           Eksik
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{info.name}</h3>
                <p className="text-sm text-gray-500 mb-4 h-10">{info.description}</p>

                {hasLevel && coupon ? (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                            <code className="text-sm font-bold text-indigo-600 font-mono">{coupon.code}</code>
                            <span className="text-sm font-bold text-green-600">
                                {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                                className="bg-indigo-500 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, (coupon.used_count / coupon.quantity) * 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{coupon.used_count} Kullanılan</span>
                            <span>{coupon.quantity} Toplam</span>
                        </div>
                    </div>
                ) : (
                    <div className="h-[76px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                        <span className="text-sm text-gray-400">Bu seviye için kupon yok</span>
                    </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Alert if levels missing */}
      {Object.values(levelCounts).filter(count => count > 0).length < 3 && (
        <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-xl">
           <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mr-4">
              <AlertCircle className="w-5 h-5" />
           </div>
           <div>
              <h4 className="font-bold text-amber-800 text-sm">Kurulum Tamamlanmadı</h4>
              <p className="text-amber-700 text-sm mt-1">
                 Widget'ın sitenizde sorunsuz çalışabilmesi için <strong>tüm seviyeler (1, 2 ve 3)</strong> için birer kupon tanımlamalısınız.
                 Şu an eksik olan seviyeler: <strong>{[1, 2, 3].filter(level => levelCounts[level as keyof typeof levelCounts] === 0).join(', ')}</strong>
              </p>
           </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Tüm Kuponlar</h2>
            <span className="text-sm text-gray-500">{coupons.length} Kupon</span>
         </div>
         
         {coupons.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 font-medium tracking-wider">
                   <th className="px-6 py-4">Kupon Kodu</th>
                   <th className="px-6 py-4">Seviye</th>
                   <th className="px-6 py-4">İndirim</th>
                   <th className="px-6 py-4">Kullanım</th>
                   <th className="px-6 py-4">Durum</th>
                   <th className="px-6 py-4 text-right">İşlemler</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {coupons.map((coupon) => {
                   const levelInfo = getLevelInfo(coupon.level)
                   const percentUsed = (coupon.used_count / coupon.quantity) * 100
                   const isSoldOut = coupon.quantity - coupon.used_count <= 0

                   return (
                     <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex flex-col">
                           <span className="font-bold text-gray-900 font-mono">{coupon.code}</span>
                           <span className="text-sm text-gray-500 truncate max-w-[200px]">{coupon.description}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center">
                           <span className="text-lg mr-2">{levelInfo.icon}</span>
                           <span className="text-sm text-gray-700 font-medium hidden md:inline">Level {coupon.level}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-green-50 text-green-700 font-bold text-sm border border-green-100">
                           {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="w-32">
                           <div className="flex justify-between text-xs text-gray-500 mb-1">
                             <span>{((coupon.used_count / coupon.quantity) * 100).toFixed(0)}%</span>
                             <span>{coupon.used_count}/{coupon.quantity}</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-1.5">
                             <div 
                               className={`h-1.5 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-indigo-500'}`} 
                               style={{ width: `${percentUsed}%` }}
                             ></div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         {isSoldOut ? (
                           <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                             Tükendi
                           </span>
                         ) : (
                           <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                             Aktif
                           </span>
                         )}
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end space-x-2">
                           <button 
                             onClick={() => startEdit(coupon)}
                             className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                             title="Düzenle"
                           >
                             <Edit3 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDeleteCoupon(coupon.id)}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Sil"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="bg-indigo-50 p-6 rounded-full mb-4">
                    <Gift className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz Kupon Yok</h3>
                <p className="text-gray-500 max-w-md mb-8">
                    İlk kuponunuzu oluşturarak başlayın. 3 farklı seviye için kupon tanımlayarak oyun widget'ını aktif hale getirebilirsiniz.
                </p>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Kupon Ekle
                </button>
            </div>
         )}
      </div>

      {/* Modern Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Yeni Kupon Tanımla</h3>
                <button 
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleAddCoupon} className="p-6 space-y-5">
              
              {/* Level Selection Cards */}
              <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(level => {
                        const info = getLevelInfo(level)
                        const canAdd = canAddLevel(level)
                        const isSelected = couponForm.level === level
                        
                        return (
                            <div 
                                key={level}
                                onClick={() => canAdd && setCouponForm({...couponForm, level})}
                                className={`
                                    cursor-pointer border-2 rounded-xl p-3 text-center transition-all
                                    ${isSelected 
                                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
                                        : canAdd ? 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
                                    }
                                `}
                            >
                                <div className="text-2xl mb-1">{info.icon}</div>
                                <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`}>Level {level}</div>
                                {!canAdd && <div className="text-[10px] text-red-500 font-medium mt-1">Dolu</div>}
                            </div>
                        )
                  })}
              </div>
              <p className="text-sm text-gray-500 text-center bg-gray-50 p-2 rounded-lg">
                {getLevelInfo(couponForm.level).name} - {getLevelInfo(couponForm.level).description}
              </p>

              <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kupon Kodu</label>
                    <input
                        type="text"
                        required
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono placeholder-gray-300"
                        placeholder="YAZ2024"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Toplam Stok</label>
                    <input
                        type="number"
                        required
                        min="1"
                        value={couponForm.quantity}
                        onChange={(e) => setCouponForm({ ...couponForm, quantity: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kupon Açıklaması</label>
                <input
                    type="text"
                    required
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-300"
                    placeholder="Müşterilerinizin göreceği açıklama"
                />
              </div>

              <div className="grid grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">İndirim Tipi</label>
                   <select
                        value={couponForm.discount_type}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   >
                     <option value="percentage">Yüzde (%)</option>
                     <option value="fixed">Nakir (₺)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Değer</label>
                   <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        value={couponForm.discount_value}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-8 font-bold text-gray-900"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold">
                        {couponForm.discount_type === 'percentage' ? '%' : '₺'}
                      </span>
                   </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                 <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                 >
                    İptal
                 </button>
                 <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                 >
                    Kuponu Kaydet
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Edit Coupon Modal (Reusing similar style for consistency) */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Kuponu Düzenle</h3>
                  <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
               </div>
               
               <form onSubmit={handleUpdateCoupon} className="p-6 space-y-5">
                  {/* Read-Only Level Info */}
                   <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center">
                       <span className="text-2xl mr-3">{getLevelInfo(editingCoupon.level).icon}</span>
                       <div>
                          <div className="text-sm font-bold text-blue-900">Level {editingCoupon.level} Kuponu</div>
                          <div className="text-xs text-blue-700">Seviye değiştirilemez, silip yeni oluşturun.</div>
                       </div>
                   </div>

                   {/* Same fields as Add */}
                   <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Kupon Kodu</label>
                            <input
                                type="text"
                                required
                                value={couponForm.code}
                                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Toplam Stok</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={couponForm.quantity}
                                onChange={(e) => setCouponForm({ ...couponForm, quantity: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Açıklama</label>
                        <input
                            type="text"
                            required
                            value={couponForm.description}
                            onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">İndirim Tipi</label>
                        <select
                                value={couponForm.discount_type}
                                onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm"
                        >
                            <option value="percentage">Yüzde (%)</option>
                            <option value="fixed">Nakit (₺)</option>
                        </select>
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Değer</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0"
                                value={couponForm.discount_value}
                                onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold pl-8"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">
                                {couponForm.discount_type === 'percentage' ? '%' : '₺'}
                            </span>
                        </div>
                        </div>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button type="button" onClick={cancelEdit} className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50">
                            İptal
                        </button>
                        <button type="submit" className="flex-1 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg">
                            <Check className="w-4 h-4 mr-2 inline" /> Güncelle
                        </button>
                    </div>

               </form>
            </div>
        </div>
      )}
    </div>
  )
}