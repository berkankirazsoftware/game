import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, Trash2, BarChart2, Calendar, Settings, Gamepad2, Megaphone } from 'lucide-react'

// Mock Data (until we have real data from Supabase)
interface Booste {
  id: string
  name: string
  status: 'active' | 'draft' | 'ended'
  type: 'embedded' | 'popup'
  games: string[]
  views: number
  plays: number
  clicks: number
  createdAt: string
  theme: string
}

const MOCK_BOOSTES: Booste[] = [
  {
    id: '1',
    name: 'Yaz İndirimleri Kampanyası',
    status: 'active',
    type: 'popup',
    games: ['wheel'],
    views: 1250,
    plays: 450,
    clicks: 120,
    createdAt: '2024-06-15',
    theme: 'colorful'
  },
  {
    id: '2',
    name: 'Website Gömülü Oyun',
    status: 'draft',
    type: 'embedded',
    games: ['snake', 'memory'],
    views: 0,
    plays: 0,
    clicks: 0,
    createdAt: '2024-06-20',
    theme: 'dark'
  }
]

export default function MyBoostesPage() {
  const [boostes, setBoostes] = useState<Booste[]>(() => {
    const saved = localStorage.getItem('boostes')
    return saved ? [...JSON.parse(saved), ...MOCK_BOOSTES] : MOCK_BOOSTES
  })

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
                    İstatistikler
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
                {boostes.map((booste) => (
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booste.status)}`}>
                        {getStatusLabel(booste.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-1">
                        {booste.games.map((g, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs" title={g}>
                            {g === 'wheel' ? '🎡' : g === 'snake' ? '🐍' : '🧩'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                         <div className="flex items-center" title="Görüntülenme">
                           <BarChart2 className="h-3 w-3 mr-1" />
                           {booste.views}
                         </div>
                         <div className="flex items-center" title="Oynanma">
                           <Play className="h-3 w-3 mr-1" />
                           {booste.plays}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booste.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded" title="Düzenle">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" title="Sil">
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
    </div>
  )
}
