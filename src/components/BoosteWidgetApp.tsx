import React, { useState } from 'react';

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
  const [selectedGame, setSelectedGame] = useState<string | null>(
    config.games.length === 1 ? config.games[0] : null
  );

  const themeStyles = THEMES[config.theme] || THEMES.light;
  const isVisible = config.type === 'embedded' || isOpen;

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleClose = () => {
    if (config.type === 'popup') {
      setIsOpen(false);
      if (config.games.length > 1) setSelectedGame(null);
    }
  };

  const renderGame = () => {
    const gameStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: themeStyles.text
    };

    const gameContent = {
      snake: { emoji: '🐍', name: 'Yılan Oyunu', desc: 'Klasik yılan oyunu' },
      wheel: { emoji: '🎡', name: 'Çarkıfelek', desc: 'Şansını dene!' },
      memory: { emoji: '🧩', name: 'Hafıza Oyunu', desc: 'Kartları eşleştir' }
    };

    const game = gameContent[selectedGame as keyof typeof gameContent];

    return (
      <div style={gameStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>{game?.emoji}</div>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>{game?.name}</div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>{game?.desc}</div>
          <div style={{ marginTop: '30px', fontSize: '14px', opacity: 0.5 }}>
            Oyun yükleniyor...
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Game selector
    if (config.games.length > 1 && !selectedGame) {
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
        {config.games.length > 1 && selectedGame && (
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
