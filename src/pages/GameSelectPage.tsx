import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { GamepadIcon, Plus, Check, Trash2 } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type UserGame = Database['public']['Tables']['user_games']['Row'] & {
  games: Game
}

export default function GameSelectPage() {
  const { user } = useAuth()
  const [availableGames, setAvailableGames] = useState<Game[]>([])
  const [selectedGames, setSelectedGames] = useState<UserGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
    fetchSelectedGames()
  }, [user])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setAvailableGames(data)
    }
    setLoading(false)
  }

  const fetchSelectedGames = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('user_games')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    console.log('Fetching selected games for user:', user.id)
    console.log('Selected games result:', { data, error })
    
    if (data && !error) {
      setSelectedGames(data as UserGame[])
    } else {
      console.error('Error fetching selected games:', error)
    }
  }

  const handleSelectGame = async (gameId: string) => {
    if (!user) return

    console.log('Selecting game:', gameId, 'for user:', user.id)
    
    const { data, error } = await supabase
      .from('user_games')
      .insert([{
        user_id: user.id,
        game_id: gameId
      }])

    console.log('Insert result:', { data, error })

    if (!error) {
      fetchSelectedGames()
    } else {
      console.error('Error selecting game:', error)
    }
  }

  const handleRemoveGame = async (userGameId: string) => {
    const { error } = await supabase
      .from('user_games')
      .delete()
      .eq('id', userGameId)

    if (!error) {
      fetchSelectedGames()
    }
  }

  const isGameSelected = (gameId: string) => {
    return selectedGames.some(sg => sg.games.id === gameId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oyun Seçimi</h1>
        <p className="text-gray-600">
          E-ticaret sitenizde kullanmak istediğiniz oyunları seçin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Games */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Oyunlar</h3>
          <div className="space-y-4">
            {availableGames.map((game) => (
              <div key={game.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <GamepadIcon className="h-8 w-8 text-indigo-600 mt-1" />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{game.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{game.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectGame(game.id)}
                    disabled={isGameSelected(game.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isGameSelected(game.id)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isGameSelected(game.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Seçildi
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Seç
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Games */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seçilen Oyunlar</h3>
          <div className="space-y-4">
            {selectedGames.length > 0 ? selectedGames.map((userGame) => (
              <div key={userGame.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <GamepadIcon className="h-8 w-8 text-green-600 mt-1" />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{userGame.games.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{userGame.games.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveGame(userGame.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <GamepadIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz oyun seçmediniz</p>
                <p className="text-sm">Sol taraftan oyun seçerek başlayın</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}