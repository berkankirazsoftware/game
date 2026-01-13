import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Calendar, Settings, Gamepad2, Megaphone, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../lib/database.types'

type Campaign = Database['public']['Tables']['campaigns']['Row']

interface Booste extends Campaign {
  health: {
      status: 'healthy' | 'warning' | 'error';
      message: string;
      reason?: string;
  }
}



export default function MyBoostesPage() {
  const { user } = useAuth()
  const [boostes, setBoostes] = useState<Booste[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBoostes()
    }
  }, [user])

  const fetchBoostes = async () => {
    try {
      const { data: coupons, error: couponError } = await supabase
        .from('coupons')
        .select('id, quantity, used_count')
        .eq('user_id', user!.id)

      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (campaignError) throw campaignError

      if (campaigns) {
        // Calculate Global Health
        let globalHealth: Booste['health'] = { status: 'healthy', message: 'Yayında', reason: 'active' };
        
        const couponList = coupons || [];
        const hasCoupons = couponList.length > 0;
        
        // Strict Stock Check: All coupons must have positive stock
        const hasStock = couponList.every(c => (c.quantity - c.used_count) > 0);
        
        if (!hasCoupons) {
            globalHealth = { status: 'error', message: 'Kupon Yok', reason: 'no_coupons' };
        } else if (!hasStock) {
            globalHealth = { status: 'error', message: 'Stok Bitti', reason: 'no_stock' };
        }

        const mappedBoostes = campaigns.map(camp => {
            // Campaign specific health override if needed (e.g. paused)
            let health = globalHealth;
            
            // If campaign is NOT active, it overrides global health issues (e.g. a draft doesn't need coupons yet)
            if (camp.status !== 'active') {
                health = { 
                    status: 'healthy', 
                    message: camp.status === 'draft' ? 'Taslak' : (camp.status === 'ended' ? 'Sona Erdi' : camp.status),
                    reason: camp.status || undefined 
                };
            }

            return {
              ...camp,
              health
            }
        })
        setBoostes(mappedBoostes)
      }
    } catch (error) {
      console.error('Error fetching boostes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Booste['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'ended': return 'bg-red-100 text-red-800'
    }
  }

  const getStatusLabel = (status: Booste['status']) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'draft': return 'Taslak'
      case 'ended': return 'Sona Erdi'
    }
  }

  /* Delete Modal State */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [boosteToDelete, setBoosteToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const initiateDelete = (id: string) => {
    setBoosteToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!boosteToDelete) return
    setIsDeleting(true)
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', boosteToDelete)

      if (error) throw error

      const newBoostes = boostes.filter(b => b.id !== boosteToDelete)
      setBoostes(newBoostes)
    } catch (error) {
      console.error('Error deleting booste:', error)
      alert('Silme işlemi başarısız oldu.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setBoosteToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Megaphone className="mr-3 h-8 w-8 text-indigo-600" />
            Boostelerim
          </h1>
          <p className="text-gray-600 mt-1">Oluşturduğunuz tüm oyun widget'larını buradan yönetin.</p>
        </div>
        <Link 
          to="/campaigns/new" 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Booste Oluştur
        </Link>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {boostes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booste Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oyunlar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kampanya İstatistikleri
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            Yükleniyor...
                        </td>
                    </tr>
                ) : boostes.map((booste) => (
                  <tr key={booste.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Gamepad2 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booste.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{booste.type} Widget</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {booste.health.status === 'error' ? (
                           <div className="group relative flex items-center">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 cursor-help">
                                    <AlertTriangle className="w-3 h-3 mr-1 self-center" />
                                    {booste.health.message}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    {booste.health.reason === 'no_coupons' && 'Gösterilecek kupon bulunamadı. Lütfen "Kuponlar" sayfasından kupon ekleyin.'}
                                    {booste.health.reason === 'no_stock' && 'Kupon stoklarınız tükendiği için widget gizlendi. Lütfen stok ekleyin.'}
                                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                           </div>
                       ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booste.status)}`}>
                            {getStatusLabel(booste.status)}
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-1">
                        {(booste.games || []).map((g, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs" title={g}>
                            {g === 'wheel' ? '🎡' : g === 'circle-dash' ? '🎯' : '🧩'}
                          </div>
                        ))}
                      </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booste.health.status === 'error' ? (
                                <span className="text-xs text-red-500 font-medium">Veri toplanamıyor</span>
                          ) : (
                              <div className="flex items-center space-x-4 text-xs text-gray-600">
                                 <span className="text-gray-400 italic">Veri toplanıyor...</span>
                              </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(booste.created_at || '').toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded" title="Düzenle">
                              <Settings className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => initiateDelete(booste.id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" 
                                title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz Booste Yok</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hemen yeni bir oyun kampanyası oluşturun ve satışlarınızı artırın.
            </p>
            <div className="mt-6">
              <Link
                to="/campaigns/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Yeni Booste Oluştur
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Booste Silinecek</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Bu kampanyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </p>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            İptal
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Siliniyor...
                                </>
                            ) : 'Evet, Sil'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
