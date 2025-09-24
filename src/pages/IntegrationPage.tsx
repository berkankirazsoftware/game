import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Copy, ExternalLink, Code, Settings } from 'lucide-react'
import type { Database } from '../lib/supabase'

type UserGame = Database['public']['Tables']['user_games']['Row'] & {
  games: Database['public']['Tables']['games']['Row']
}

export default function IntegrationPage() {
  const { user } = useAuth()
  const [selectedGames, setSelectedGames] = useState<UserGame[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>('')

  useEffect(() => {
    fetchSelectedGames()
  }, [user])

  const fetchSelectedGames = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('user_games')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) {
      setSelectedGames(data as UserGame[])
      if (data.length > 0 && !selectedGameId) {
        setSelectedGameId(data[0].games.id)
      }
    }
  }

  const generateIframeUrl = (gameId: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/game-select?userId=${user?.id}&gameId=${gameId}`
  }

  const generateIframeCode = (gameId: string) => {
    const iframeUrl = generateIframeUrl(gameId)
    return `<iframe 
  src="${iframeUrl}" 
  width="800" 
  height="600" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const selectedGame = selectedGames.find(sg => sg.games.id === selectedGameId)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Entegrasyon</h1>
        <p className="text-gray-600">
          Oyunlarınızı e-ticaret sitenize entegre edin
        </p>
      </div>

      {selectedGames.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Önce Oyun Seçin</h3>
          <p className="text-gray-600 mb-4">
            Entegrasyon yapmak için önce oyun seçmeniz gerekiyor.
          </p>
          <a
            href="/games"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Oyun Seç
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Oyun Seçin</h3>
            <div className="space-y-3">
              {selectedGames.map((userGame) => (
                <div
                  key={userGame.id}
                  onClick={() => setSelectedGameId(userGame.games.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedGameId === userGame.games.id
                      ? 'bg-indigo-50 border-2 border-indigo-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{userGame.games.name}</h4>
                  <p className="text-sm text-gray-500">{userGame.games.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Code */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Entegrasyon Kodu</h3>
            
            {selectedGame && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    iframe URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={generateIframeUrl(selectedGameId)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(generateIframeUrl(selectedGameId))}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Kodu
                  </label>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto">
                      <code>{generateIframeCode(selectedGameId)}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateIframeCode(selectedGameId))}
                      className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(generateIframeUrl(selectedGameId), '_blank')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Önizle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedGame && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              src={generateIframeUrl(selectedGameId)}
              width="100%"
              height="600"
              frameBorder="0"
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}