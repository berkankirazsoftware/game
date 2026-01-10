import React, { useState } from 'react';
import SnakeGame from '../pages/SnakeGame';
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
  const isVisible = config.type === 'embedded' || isOpen;

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
      case 'snake':
        return (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <SnakeGame {...gameProps} />
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
        snake: { emoji: '🐍', name: 'Yılan' },
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
  // Popup trigger button
  if (config.type === 'popup' && !isOpen) {
    // Explicitly using React.CSSProperties to ensure type safety
    const triggerStyle: React.CSSProperties = {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2147483647, // Max z-index supported by browsers
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      background: themeStyles.background === '#ffffff' ? '#4f46e5' : themeStyles.background,
      color: 'white',
      fontSize: '32px',
      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      animation: 'none' // Remove unsupported 'bounce' unless defined in global css
    };

    return (
      <button
        onClick={() => setIsOpen(true)}
        style={triggerStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Open Game Widget"
      >
        🎁
      </button>
    );
  }

  // Main container
  const containerStyle: React.CSSProperties = config.type === 'popup' ? {
    position: 'fixed',
    inset: '0',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    padding: '20px'
  } : {
    width: '100%',
    height: '100%',
    minHeight: '500px'
  };

  const widgetStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: config.type === 'popup' ? '900px' : '100%',
    height: config.type === 'popup' ? 'auto' : '100%',
    aspectRatio: config.type === 'popup' ? '4/3' : undefined,
    maxHeight: '90vh',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    background: themeStyles.background
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 60,
    padding: '8px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.2)',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    fontSize: '24px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  };

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
