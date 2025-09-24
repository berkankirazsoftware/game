/*
  # Widget için kupon erişim düzeltmesi

  1. Güvenlik Değişiklikleri
    - Kuponlar için anonim okuma izni ekleme
    - Widget'ın kuponlara erişebilmesi için policy güncelleme

  2. Notlar
    - Sadece okuma izni veriliyor
    - Yazma/silme işlemleri hala korumalı
*/

-- Kuponlar tablosu için anonim okuma policy'si ekle
CREATE POLICY "Allow anonymous read for widget"
  ON coupons
  FOR SELECT
  TO anon
  USING (true);