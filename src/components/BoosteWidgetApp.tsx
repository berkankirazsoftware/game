import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Copy, Check, Mail, ArrowRight, Loader2 } from 'lucide-react';
import CircleDashGame from '../pages/CircleDashGame';
import WheelGame from '../pages/WheelGame';
import MemoryGame from '../pages/MemoryGame';
import type { Database } from '../lib/database.types';

type Coupon = Database['public']['Tables']['coupons']['Row'];

interface WidgetConfig {
  target: string;
  games?: string[];
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
    secondary: '#f3f4f6',
    inputBg: '#ffffff',
    inputBorder: '#e5e7eb'
  },
  dark: {
    background: '#111827',
    text: '#f9fafb',
    primary: '#6366f1',
    secondary: '#374151',
    inputBg: '#1f2937',
    inputBorder: '#374151'
  },
  colorful: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    text: '#ffffff',
    primary: 'rgba(255, 255, 255, 0.2)',
    secondary: 'rgba(255, 255, 255, 0.1)',
    inputBg: 'rgba(255, 255, 255, 0.1)',
    inputBorder: 'rgba(255, 255, 255, 0.2)'
  }
};

export default function BoosteWidgetApp({ config }: BoosteWidgetAppProps) {
  const [isOpen, setIsOpen] = useState(config.autoOpen || false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<string[]>((config.games || []).filter(g => g !== 'circle-dash'));
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const themeStyles = THEMES[config.theme] || THEMES.light;
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  // Cooldown & Result States
  const [isGamePlayable, setIsGamePlayable] = useState(true);
  const [showCooldownView, setShowCooldownView] = useState(false);
  const [latestCoupon, setLatestCoupon] = useState<Coupon | null>(null);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [cooldownTimerStr, setCooldownTimerStr] = useState<string>('');
  const [remoteCooldownMinutes, setRemoteCooldownMinutes] = useState(1440);
  const [copied, setCopied] = useState(false);

  // Claim States
  const [pendingCoupon, setPendingCoupon] = useState<Coupon | null>(null);
  const [claimEmail, setClaimEmail] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    checkAvailability();
    
    // Timer interval for both Time Limit and Cooldown Display
    const timer = setInterval(() => {
        updateTimeRemaining();
        updateCooldownDisplay();
    }, 1000);

    return () => clearInterval(timer);
  }, [config.userId, cooldownEndTime]);

  const updateCooldownDisplay = () => {
    if (!cooldownEndTime) return;
    
    const now = Date.now();
    const diff = cooldownEndTime - now;
    
    if (diff <= 0) {
        setCooldownTimerStr('Hazır!');
    } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCooldownTimerStr(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const updateTimeRemaining = () => {
      const expiry = localStorage.getItem('booste_limit_expiry');
      if (expiry) {
          const expiryTime = parseInt(expiry);
          const now = Date.now();
          const diff = expiryTime - now;
          
          if (diff <= 0) {
              setTimeRemaining('00:00');
          } else {
              const minutes = Math.floor(diff / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
              setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }
      }
  };

  const trackEvent = async (eventType: string, metadata: any = {}) => {
    if (!config.userId) return;
    try {
        await import('../lib/supabase').then(m => 
            m.supabase.rpc('track_event', {
                p_user_id: config.userId!,
                p_event_type: eventType,
                p_metadata: metadata
            })
        );
    } catch (e) {
        console.error('Tracking error', e);
    }
  };

  // Conversion Funnel Tracking
  useEffect(() => {
     if (!config.userId) return;

     const currentUrl = window.location.href.toLowerCase();
     if (currentUrl.includes('cart') || currentUrl.includes('sepet') || currentUrl.includes('basket')) {
         trackEvent('page_view_cart', { url: window.location.href });
     } else if (currentUrl.includes('checkout') || currentUrl.includes('odeme') || currentUrl.includes('payment')) {
         trackEvent('page_view_checkout', { url: window.location.href });
     } else if (currentUrl.includes('order-received') || currentUrl.includes('thank-you') || currentUrl.includes('siparis-onay')) {
          trackEvent('conversion_purchase', { url: window.location.href });
     }
  }, [config.userId]);

  // Helper to collect rich user info
  const collectUserInfo = () => {
    // Unique Visitor ID Logic
    let visitorId = localStorage.getItem('booste_visitor_id');
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('booste_visitor_id', visitorId);
    }

    return {
        visitor_id: visitorId,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth
        },
        window: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
  };

  const checkAvailability = async () => {
    if (!config.userId) {
      setIsAllowed(true);
      return;
    }

    try {
      const { data, error } = await import('../lib/supabase').then(m => 
        m.supabase.rpc('check_widget_status', { p_user_id: config.userId! })
      );
      
      if (error) {
        console.error('Widget check error:', error);
        setIsAllowed(true); 
      } else {
        const result = data as any;
        const remoteConfig = result.config || { cooldown_minutes: 1440 }; // Default 24h
        const cooldownMinutes = remoteConfig.cooldown_minutes || 1440;
        setRemoteCooldownMinutes(cooldownMinutes);

        // Check Cooldown
        const lastPlayed = localStorage.getItem('booste_last_played');
        
        if (lastPlayed) {
            const lastPlayedTime = parseInt(lastPlayed);
            const now = Date.now();
            const elapsedMinutes = (now - lastPlayedTime) / (1000 * 60);
            
            if (elapsedMinutes < cooldownMinutes) {
                console.log(`Booste Widget: Cool down active. Wait ${cooldownMinutes - elapsedMinutes} minutes.`);
                
                // Set Cooldown State
                setIsGamePlayable(false);
                setShowCooldownView(true);
                setCooldownEndTime(lastPlayedTime + cooldownMinutes * 60 * 1000);
                
                // Load cached coupon
                const cachedCoupon = localStorage.getItem('booste_latest_coupon');
                if (cachedCoupon) {
                    try {
                        setLatestCoupon(JSON.parse(cachedCoupon));
                    } catch (e) {
                        console.error("Error parsing cached coupon", e);
                    }
                }
            }
        }

        // Check Time Limit
        if (remoteConfig.time_limit_enabled) {
            const timeLimitMinutes = remoteConfig.time_limit_minutes || 15;
            let visitStart = localStorage.getItem('booste_visit_start');
            let limitExpiry = localStorage.getItem('booste_limit_expiry');
            
            if (!visitStart) {
                // First visit
                const now = Date.now();
                visitStart = now.toString();
                limitExpiry = (now + timeLimitMinutes * 60 * 1000).toString();
                
                localStorage.setItem('booste_visit_start', visitStart);
                localStorage.setItem('booste_limit_expiry', limitExpiry);
            } else if (!limitExpiry) {
                 const startTime = parseInt(visitStart);
                 limitExpiry = (startTime + timeLimitMinutes * 60 * 1000).toString();
                 localStorage.setItem('booste_limit_expiry', limitExpiry);
            }

            const now = Date.now();
            if (now > parseInt(limitExpiry!)) {
                console.log('Booste Widget: Time limit expired.');
                setIsAllowed(false); // Widget is hidden if time limit expired
                return;
            } else {
                 const diff = parseInt(limitExpiry!) - now;
                 // Set timeout to close
                 setTimeout(() => {
                     setIsAllowed(false);
                     setIsOpen(false);
                 }, diff);
            }
        } else {
            localStorage.removeItem('booste_limit_expiry');
            setTimeRemaining(null);
        }

        if (result.allowed === false) {
             console.log('Booste Widget: Not allowed. Reason:', result.reason);
             setRejectionReason(result.reason);
        }

        setIsAllowed(result.allowed);
        
        let gamesToUse = (result.games || []).filter((g: string) => g !== 'circle-dash');
        if (gamesToUse.length === 0 && result.game_type && result.game_type !== 'circle-dash') {
            gamesToUse = [result.game_type];
        }

        if (result.allowed && gamesToUse.length > 0) {
            // Track Impression if allowed with RICH METADATA
            const userInfo = collectUserInfo();
            trackEvent('impression', userInfo);

            if ( gamesToUse.length === 1) {
                setSelectedGame(gamesToUse[0]);
            } else {
                setAvailableGames(gamesToUse);
            }
        }
      }
    } catch (err) {
      console.error('Widget check failed:', err);
      setIsAllowed(true);
    }
  };

  const handleGameComplete = (coupon: Coupon | null) => {
    // Stage 1: Store pending coupon and show email form
    // Do not save to localStorage yet!
    setPendingCoupon(coupon);

    // Track Game Complete
    if (coupon) {
        trackEvent('game_complete', { 
            game: selectedGame, 
            coupon_code: coupon.code,
            discount: coupon.discount_value
        });
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!claimEmail || !pendingCoupon || !selectedGame) return;

      // Basic Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(claimEmail)) {
          setClaimError("Lütfen geçerli bir e-posta adresi giriniz.");
          return;
      }

      setIsClaiming(true);
      setClaimError(null);

      try {
          const { data, error } = await import('../lib/supabase').then(m => 
            m.supabase.rpc('claim_coupon', { 
                p_coupon_id: pendingCoupon.id,
                p_email: claimEmail,
                p_game_type: selectedGame
            })
          );

          if (error) throw error;

          const result = data as any;
          if (!result.success) {
              throw new Error(result.error);
          }

          // Success!
          const finalValues = { ...pendingCoupon, code: result.coupon_code };
          
          // Save and transition
          const now = Date.now();
          localStorage.setItem('booste_last_played', now.toString());
          localStorage.setItem('booste_latest_coupon', JSON.stringify(finalValues));
          
          setLatestCoupon(finalValues);
          setPendingCoupon(null);
          setIsGamePlayable(false);
          setShowCooldownView(true);
          setCooldownEndTime(now + remoteCooldownMinutes * 60 * 1000);

      } catch (err: any) {
          console.error("Claim error:", err);
          setClaimError(err.message || "Bir hata oluştu.");
      } finally {
          setIsClaiming(false);
      }
  };

  const handleCopyCode = () => {
      if (latestCoupon?.code) {
          navigator.clipboard.writeText(latestCoupon.code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const renderEmailForm = () => {
      if (!pendingCoupon) return null;

      return (
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '24px',
              textAlign: 'center',
              color: themeStyles.text,
              background: themeStyles.background
          }}>
              <div style={{
                  padding: '16px',
                  borderRadius: '50%',
                  background: themeStyles.secondary,
                  marginBottom: '24px'
              }}>
                  <Mail size={40} className="text-indigo-600" style={{ color: themeStyles.primary }} />
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Kuponunu Al
              </h2>
              
              <p style={{ opacity: 0.8, marginBottom: '24px' }}>
                  Kupon kodunu görmek ve e-postana gönderilmesi için adresini gir.
              </p>

              <form onSubmit={handleClaimSubmit} style={{ width: '100%' }}>
                  <input 
                      type="email"
                      required
                      placeholder="E-posta adresin"
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          border: `1px solid ${themeStyles.inputBorder || '#ccc'}`,
                          background: themeStyles.inputBg || 'white',
                          color: themeStyles.text,
                          marginBottom: '16px',
                          fontSize: '16px',
                          outline: 'none'
                      }}
                  />
                  
                  {claimError && (
                      <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px' }}>
                          {claimError}
                      </div>
                  )}

                  <button 
                      type="submit"
                      disabled={isClaiming}
                      style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          background: themeStyles.text === '#ffffff' ? 'white' : '#4f46e5',
                          color: themeStyles.text === '#ffffff' ? '#444' : 'white',
                          border: 'none',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: isClaiming ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          opacity: isClaiming ? 0.7 : 1
                      }}
                  >
                      {isClaiming ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            İşleniyor...
                          </>
                      ) : (
                          <>
                            Kuponu Göster
                            <ArrowRight size={20} />
                          </>
                      )}
                  </button>
              </form>
          </div>
      );
  };

  const renderCooldownView = () => {
      return (
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '24px',
              textAlign: 'center',
              color: themeStyles.text,
              background: themeStyles.background
          }}>
              <div style={{
                  padding: '16px',
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.1)',
                  marginBottom: '24px'
              }}>
                  <Trophy size={48} className="text-indigo-600" style={{ color: themeStyles.primary }} />
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {latestCoupon ? 'Tebrikler!' : 'Oyun Tamamlandı'}
              </h2>
              
              <p style={{ opacity: 0.8, marginBottom: '24px' }}>
                  {latestCoupon ? 'Ödülünü kazandın. Bir sonraki şans için bekle.' : 'Bugünlük şansını denedin. Yarın tekrar gel!'}
              </p>

              {latestCoupon && (
                  <div style={{
                      background: themeStyles.secondary,
                      padding: '20px',
                      borderRadius: '16px',
                      width: '100%',
                      marginBottom: '24px',
                      position: 'relative'
                  }}>
                      <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>Kupon Kodun</div>
                      <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          letterSpacing: '2px',
                          color: themeStyles.primary,
                          marginBottom: '8px'
                      }}>
                          {latestCoupon.code}
                      </div>
                      <button 
                          onClick={handleCopyCode}
                          style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: copied ? '#10B981' : themeStyles.text,
                              opacity: 0.8
                          }}
                      >
                          {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                           {latestCoupon.discount_type === 'percentage' ? `%${latestCoupon.discount_value}` : `${latestCoupon.discount_value}₺`} İndirim
                      </div>
                  </div>
              )}

              <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0,0,0,0.05)',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '500'
              }}>
                  <Clock size={16} />
                  <span>Sonraki Oyun: {cooldownTimerStr}</span>
              </div>
          </div>
      );
  };

  const isVisible = (config.type === 'embedded' || isOpen) && (isAllowed === true);

  if (isAllowed === null) return null; 
  if (isAllowed === false) return null; 


  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    trackEvent('game_select', { game: gameId });
  };

  const handleClose = () => {
    if (config.type === 'popup') {
      setIsOpen(false);
      setSelectedGame(null);
    }
  };

  const renderGame = () => {
    if (!isGamePlayable) return null; 

    const gameProps = {
      embedded: true,
      userId: config.userId,
      theme: {
        background: 'transparent',
        textColor: themeStyles.text
      },
      testMode: false,
      onGameComplete: handleGameComplete
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
    // Priority: Cooldown View -> Email Form -> Game Selector -> Game View
    
    if (showCooldownView) {
        return renderCooldownView();
    }

    if (pendingCoupon) {
        return renderEmailForm();
    }

    if (!selectedGame) {
      // Selector Logic
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
            {availableGames.map(gameId => {
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

  if (config.type === 'popup' && !isOpen) {
    const triggerStyle: React.CSSProperties = {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2147483647,
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
      animation: 'float 3s ease-in-out infinite' 
    };

    return (
      <button
        onClick={() => {
            setIsOpen(true);
            trackEvent('widget_open');
        }}
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
            <span>Oyna Kazan</span>
            {(showCooldownView || latestCoupon) ? (
                 <span style={{ fontSize: '10px', opacity: 0.9 }}>
                    Kuponun Hazır
                 </span>
            ) : timeRemaining && (
                <span style={{ fontSize: '10px', opacity: 0.9 }}>
                    Kalan: {timeRemaining}
                </span>
            )}
        </div>
      </button>
    );
  }

  const containerStyle: React.CSSProperties = config.type === 'popup' ? {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: config.type === 'popup' ? themeStyles.background : 'transparent', 
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-out forwards' 
  } : {
    width: '100%',
    height: '100%',
    minHeight: '100%' 
  };

  const widgetStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%', 
    maxWidth: '100%', 
    maxHeight: '100%', 
    overflow: 'hidden',
    borderRadius: config.type === 'popup' ? '0' : '16px', 
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
    background: 'rgba(0, 0, 0, 0.05)', 
    border: 'none',
    cursor: 'pointer',
    color: themeStyles.text, 
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
