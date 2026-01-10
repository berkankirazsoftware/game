import React from 'react'
import { useSearchParams } from 'react-router-dom'
import BoosteWidgetApp from '../components/BoosteWidgetApp'

export default function WidgetPreviewPage() {
  const [searchParams] = useSearchParams()

  const type = searchParams.get('type') as 'popup' | 'embedded' || 'popup'
  const theme = searchParams.get('theme') || 'light'
  const gamesParam = searchParams.get('games')
  const games = gamesParam ? gamesParam.split(',') : ['snake']
  const userId = searchParams.get('userId') || undefined

  const config = {
    target: 'body', // Doesn't matter for preview as BoosteWidgetApp handles it
    type,
    games,
    theme,
    userId
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {type === 'embedded' && (
        <div className="mb-4 text-gray-500 text-sm">
          -- Gömülü Mod Önizlemesi (Embed Container) --
        </div>
      )}
      
      {/* 
        For popup mode, BoosteWidgetApp renders a fixed button, so this container 
        doesn't strictly constrain it, but for embedded it does. 
      */}
      <div className={type === 'embedded' ? "w-full max-w-4xl border-2 border-dashed border-gray-300 p-4" : ""}>
         <BoosteWidgetApp config={config} />
      </div>

       {type === 'popup' && (
        <div className="mt-8 text-gray-500 text-sm text-center">
          (Sağ alt köşedeki butona tıklayın)
        </div>
      )}
    </div>
  )
}
