import React, { useState } from 'react'
import { X, Gift, Play, Monitor, Smartphone, Grid, ArrowLeft } from 'lucide-react'
import SnakeGame from '../pages/SnakeGame'
import WheelGame from '../pages/WheelGame'
import MemoryGame from '../pages/MemoryGame'

interface WidgetConfig {
  target: string
  games: string[]
  type: 'popup' | 'embedded'
  theme: string
  userId?: string
}

interface ThemeStyles {
  background: string
  text: string
  primary: string
  secondary: string
}

const THEMES: Record<string, ThemeStyles> = {
  light: {
    background: '#ffffff',
    text: '#1f2937',
    primary: '#4f46e5',
    secondary: '#f3f4f6'
  },
  dark: {
    background: '#111827',
    text: '#f9fafb',
    primary: '#6366f1',
    secondary: '#374151'
  },
  colorful: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    text: '#ffffff',
    primary: 'rgba(255, 255, 255, 0.2)',
    secondary: 'rgba(255, 255, 255, 0.1)'
  }
}

interface BoosteWidgetAppProps {
  config: WidgetConfig
}

export default function BoosteWidgetApp({ config }: BoosteWidgetAppProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<string | null>(
    config.games.length === 1 ? config.games[0] : null
  )

  const themeStyles = THEMES[config.theme] || THEMES.light
  
  // If embedded, we are always "open", but if we have multiple games and none selected, 
  // we show the selector.
  // If popup, we toggle visibility.
  const isVisible = config.type === 'embedded' || isOpen

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
  }

  const handleClose = () => {
    if (config.type === 'popup') {
      setIsOpen(false)
      // Reset selection if multiple games, so user sees selector again next time? 
      // Maybe better UX to keep it or reset it. Let's reset for now if multiple.
      if (config.games.length > 1) setSelectedGame(null)
    }
  }

  const renderGame = () => {
    const commonProps = {
      embedded: true,
      userId: config.userId,
      testMode: false,
      theme: {
        background: themeStyles.background,
        primaryColor: themeStyles.primary,
        textColor: themeStyles.text
      }
    }

    switch (selectedGame) {
      case 'snake':
        return <SnakeGame {...commonProps} />
      case 'wheel':
        return <WheelGame {...commonProps} />
      case 'memory':
        return <MemoryGame {...commonProps} />
      default:
        return <div>Oyun bulunamadı</div>
    }
  }

  const renderContent = () => {
    // 1. If multiple games and none selected -> Show Selector
    if (config.games.length > 1 && !selectedGame) {
      return (
        <div 
          className="flex flex-col items-center justify-center h-full p-6 text-center"
          style={{ background: themeStyles.background, color: themeStyles.text }}
        >
          <h2 className="text-2xl font-bold mb-6">Bir Oyun Seç</h2>
          <div className="grid grid-cols-2 gap-4 w-full">
            {config.games.map(gameId => (
              <button
                key={gameId}
                onClick={() => handleGameSelect(gameId)}
                className="p-4 rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-105"
                style={{ background: themeStyles.secondary }}
              >
                <span className="text-4xl mb-2">
                  {gameId === 'snake' ? '🐍' : gameId === 'wheel' ? '🎡' : '🧩'}
                </span>
                <span className="font-bold capitalize">
                  {gameId === 'snake' ? 'Yılan' : gameId === 'wheel' ? 'Çark' : 'Hafıza'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )
    }

    // 2. If game selected (or only one game) -> Render Game
    return (
      <div className="relative h-full">
        {/* Back button if we have multiple games and are in a game */}
        {config.games.length > 1 && selectedGame && (
          <button
            onClick={() => setSelectedGame(null)}
            className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            style={{ color: themeStyles.text }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        {renderGame()}
      </div>
    )
  }

  // Popup Trigger Button
  if (config.type === 'popup' && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-bounce"
        style={{ background: themeStyles.background === '#ffffff' ? '#4f46e5' : themeStyles.background }}
      >
        <Gift className="w-8 h-8 text-white" />
      </button>
    )
  }

  // Modal / Container Structure
  return (
    <div className={`
      ${config.type === 'popup' ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4' : 'w-full h-full min-h-[500px]'}
    `}>
      <div 
        className={`
          relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl
          ${config.type === 'embedded' ? 'h-[600px]' : 'aspect-[4/3]'}
        `}
        style={{ background: themeStyles.background }}
      >
        {/* Close Button for Popup */}
        {config.type === 'popup' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {renderContent()}
      </div>
    </div>
  )
}
