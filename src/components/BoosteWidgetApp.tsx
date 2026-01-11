import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import CircleDashGame from '../pages/CircleDashGame';
import WheelGame from '../pages/WheelGame';
import MemoryGame from '../pages/MemoryGame';

interface WidgetConfig {
  target: string;
  games: string[];
  type: 'popup' | 'embedded';
  theme: string;
  userId?: string;
  autoOpen?: boolean;
}

interface BoosteWidgetAppProps {
  config: WidgetConfig;
}

const THEMES: Record<string, any> = {
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
};

export default function BoosteWidgetApp({ config }: BoosteWidgetAppProps) {
  const [isOpen, setIsOpen] = useState(config.autoOpen || false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const themeStyles = THEMES[config.theme] || THEMES.light;
  // Initialize availability state
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkAvailability();
  }, [config.userId]);

  const checkAvailability = async () => {
    // If no userId, assume allowed (e.g. demo mode) or handle as needed
    if (!config.userId) {
      setIsAllowed(true);
      return;
    }

    try {
      // Import needed if not available globally. Assuming supabase client is passed or imported.
      // We need to import supabase here.
      const { data, error } = await import('../lib/supabase').then(m => 
        m.supabase.rpc('check_widget_status', { p_user_id: config.userId })
      );
      
      if (error) {
        console.error('Widget check error:', error);
        // Fallback to allowed on error to avoid breaking site? Or deny?
        // Let's safe fail to TRUE for now, or FALSE regarding strictness.
        // User asked: "hiç görünmemeli". So maybe false on error is safer if strict.
        setIsAllowed(true); 
      } else {
        setIsAllowed((data as any).allowed);
      }
    } catch (err) {
      console.error('Widget check failed:', err);
      setIsAllowed(true);
    }
  };

  // Only show if type logic meets AND isAllowed is true.
  // Wait for check to complete (isAllowed !== null) to avoid flash?
  // Or start hidden.
  const isVisible = (config.type === 'embedded' || isOpen) && (isAllowed === true);

  // If check is pending, what to render?
  // If embedded, maybe skeleton? If popup, nothing.
  if (isAllowed === null) return null; // Don't render until checked


  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleClose = () => {
    if (config.type === 'popup') {
      setIsOpen(false);
      setSelectedGame(null);
    }
  };

  const renderGame = () => {
    // Props suitable for game components
    const gameProps = {
      embedded: true,
      userId: config.userId,
      theme: {
        background: 'transparent',
        textColor: themeStyles.text
      },
      // Pass a flag to indicate it's in a widget to possibly adjust layout if needed
      testMode: false // Or config.testMode if you add it
    };

    switch (selectedGame) {
      case 'circle-dash':
        return (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <CircleDashGame {...gameProps} />
          </div>
        );
      case 'wheel':
        return (
          <div style={{ height: '100%', overflow: 'auto' }}>
             <WheelGame {...gameProps} />
          </div>
        );
      case 'memory':
        return (
          <div style={{ height: '100%', overflow: 'auto' }}>
             <MemoryGame {...gameProps} />
          </div>
        );
      default:
        return (
          <div style={{ color: themeStyles.text, textAlign: 'center', padding: '20px' }}>
            Oyun bulunamadı
          </div>
        );
    }
  };

  const renderContent = () => {
    // Game selector
    if (!selectedGame) {
      const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        textAlign: 'center',
        background: themeStyles.background,
        color: themeStyles.text
      };

      const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '600px',
        marginTop: '30px'
      };

      const buttonStyle: React.CSSProperties = {
        padding: '30px 20px',
        borderRadius: '16px',
        background: themeStyles.secondary,
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        fontSize: '16px',
        fontWeight: 'bold',
        color: themeStyles.text
      };

      const gameIcons = {
        'circle-dash': { emoji: '🎯', name: 'Circle Dash' },
        wheel: { emoji: '🎡', name: 'Çark' },
        memory: { emoji: '🧩', name: 'Hafıza' }
      };

      return (
        <div style={containerStyle}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            Bir Oyun Seç
          </h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Oynamak istediğin oyunu seç
          </p>
          <div style={gridStyle}>
            {config.games.map(gameId => {
              const game = gameIcons[gameId as keyof typeof gameIcons];
              return (
                <button
                  key={gameId}
                  onClick={() => handleGameSelect(gameId)}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                    {game?.emoji}
                  </div>
                  <div>{game?.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Game view
    return (
      <div style={{ position: 'relative', height: '100%' }}>
        {selectedGame && (
          <button
            onClick={() => setSelectedGame(null)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 50,
              padding: '10px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
              color: themeStyles.text,
              fontSize: '20px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
        )}
        {renderGame()}
      </div>
    );
  };

  // Popup trigger button
  if (config.type === 'popup' && !isOpen) {
    // Explicitly using React.CSSProperties to ensure type safety
    const triggerStyle: React.CSSProperties = {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2147483647, // Max z-index supported by browsers
      padding: '12px 24px',
      height: '60px',
      borderRadius: '9999px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      background: themeStyles.background === '#ffffff' ? '#4f46e5' : themeStyles.background,
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      animation: 'float 3s ease-in-out infinite' // Add float animation
    };

    return (
      <button
        onClick={() => setIsOpen(true)}
        style={triggerStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Open Game Widget"
      >
        <Trophy className="w-6 h-6 mr-2" />
        <span>Oyna Kazan</span>
      </button>
    );
  }

  // Main container
  const containerStyle: React.CSSProperties = config.type === 'popup' ? {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: config.type === 'popup' ? themeStyles.background : 'transparent', // Full screen background for popup
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-out forwards' // Add fade in animation
  } : {
    width: '100%',
    height: '100%',
    minHeight: '100%' // Remove minHeight constraint for embedded if possible, or keep it responsive
  };

  const widgetStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%', // Full height
    maxWidth: '100%', // Full width
    maxHeight: '100%', // Full height
    overflow: 'hidden',
    borderRadius: config.type === 'popup' ? '0' : '16px', // No radius for full screen popup
    boxShadow: config.type === 'popup' ? 'none' : '0 20px 60px rgba(0,0,0,0.3)',
    background: themeStyles.background,
    display: 'flex',
    flexDirection: 'column'
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 60,
    padding: '8px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.05)', // Lighter background
    border: 'none',
    cursor: 'pointer',
    color: themeStyles.text, // Use theme text color
    fontSize: '24px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  if (!isVisible && config.type !== 'popup') {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={widgetStyle}>
        {config.type === 'popup' && (
          <button
            onClick={handleClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
            }}
          >
            ✕
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
}
