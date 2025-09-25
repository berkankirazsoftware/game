/*
  # Varsayılan oyunlar ve test kuponları ekleme

  1. Varsayılan Oyunlar
    - Snake (Yılan Oyunu)
    - Memory (Hafıza Oyunu)
  
  2. Test Kuponları
    - Örnek kuponlar ekleniyor
  
  3. Notlar
    - Bu migration sadece boş tablolara veri ekler
    - Mevcut veriler korunur
*/

-- Varsayılan oyunları ekle (sadece tablo boşsa)
INSERT INTO games (id, name, description, code, created_at)
SELECT 
  'snake-game-default',
  'Yılan Oyunu',
  'Klasik yılan oyunu. Ok tuşları ile yılanı yönlendirin ve yemi toplayın. 50 puana ulaşınca kupon kazanın!',
  'snake',
  now()
WHERE NOT EXISTS (SELECT 1 FROM games WHERE code = 'snake');

INSERT INTO games (id, name, description, code, created_at)
SELECT 
  'memory-game-default',
  'Hafıza Oyunu',
  'Kartları çevirerek eşleşen çiftleri bulun. Tüm çiftleri eşleştirince kupon kazanın!',
  'memory',
  now()
WHERE NOT EXISTS (SELECT 1 FROM games WHERE code = 'memory');

-- Test kullanıcısı için örnek kuponlar ekle
DO $$
BEGIN
  -- Sadece bu kullanıcı için kupon yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM coupons 
    WHERE user_id = '4badf38d-e44b-4231-a881-338c25698ca7'
  ) THEN
    
    INSERT INTO coupons (user_id, code, description, discount_type, discount_value, created_at)
    VALUES 
    (
      '4badf38d-e44b-4231-a881-338c25698ca7',
      'OYUN20',
      'Oyun tamamlama kuponu - %20 indirim',
      'percentage',
      20,
      now()
    ),
    (
      '4badf38d-e44b-4231-a881-338c25698ca7',
      'SUPER15',
      'Süper oyuncu kuponu - %15 indirim',
      'percentage',
      15,
      now()
    ),
    (
      '4badf38d-e44b-4231-a881-338c25698ca7',
      'BONUS50',
      'Bonus kupon - 50₺ indirim',
      'fixed',
      50,
      now()
    );
    
  END IF;
END $$;