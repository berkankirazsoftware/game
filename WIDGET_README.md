# 🎮 Booste Widget - CORS-Safe Game Widget

Booste Widget, web sitenize kolayca entegre edebileceğiniz, CORS ve ORB hatalarından korunan bir oyun widget'ıdır.

## ✨ Özellikler

- ✅ **CORS-Safe**: Herhangi bir web sitesinde sorunsuz çalışır
- ✅ **ORB Korumalı**: Opaque Response Blocking hatalarından korunur
- ✅ **Tek Dosya**: Tüm kaynaklar tek bir JS dosyasında
- ✅ **Self-Contained**: Harici bağımlılık yok
- ✅ **Hafif**: ~400KB (gzip: ~111KB)
- ✅ **Responsive**: Tüm cihazlarda çalışır
- ✅ **Özelleştirilebilir**: Tema ve oyun seçenekleri
- ✅ **TypeScript**: Tip güvenli API

## 🚀 Hızlı Başlangıç

### 1. Script'i Ekleyin

```html
<script src="https://your-domain.com/widget.js"></script>
```

### 2. Container Oluşturun

```html
<div id="booste-game" style="width: 100%; height: 500px;"></div>
```

### 3. Widget'ı Başlatın

```html
<script>
  window.addEventListener('BoosteWidgetReady', function() {
    window.Booste.init({
      target: '#booste-game',
      games: ['snake', 'wheel', 'memory'],
      type: 'embedded',
      theme: 'dark',
      userId: 'user-123'
    });
  });
</script>
```

## 📖 Kullanım Modları

### Gömülü Mod (Embedded)

```javascript
window.Booste.init({
  target: '#booste-game',
  type: 'embedded',
  games: ['snake', 'wheel'],
  theme: 'dark'
});
```

### Popup Mod

```javascript
window.Booste.init({
  target: '#booste-game',
  type: 'popup',
  games: ['snake', 'wheel'],
  theme: 'colorful'
});
```

## ⚙️ Konfigürasyon Seçenekleri

| Parametre | Tip | Gerekli | Varsayılan | Açıklama |
|-----------|-----|---------|------------|----------|
| `target` | string | ✅ | - | Widget container selector |
| `games` | string[] | ✅ | - | Oyun listesi |
| `type` | 'embedded' \| 'popup' | ✅ | - | Widget tipi |
| `theme` | 'light' \| 'dark' \| 'colorful' | ✅ | - | Tema |
| `userId` | string | ❌ | - | Kullanıcı ID |
| `boosteId` | string | ❌ | - | Booste kampanya ID |
| `apiUrl` | string | ❌ | - | Özel API URL |

## 🎯 Oyunlar

Mevcut oyunlar:
- `snake` - Yılan Oyunu
- `wheel` - Çarkıfelek
- `memory` - Hafıza Oyunu

## 🔧 API Metodları

### init(config)

Widget'ı başlatır.

```javascript
window.Booste.init({
  target: '#booste-game',
  games: ['snake'],
  type: 'embedded',
  theme: 'dark'
});
```

### destroy()

Widget'ı kapatır ve temizler.

```javascript
window.Booste.destroy();
```

### version

Widget versiyonunu döndürür.

```javascript
console.log(window.Booste.version); // "1.0.0"
```

## 📡 Events

### BoosteWidgetReady

Widget yüklendiğinde tetiklenir.

```javascript
window.addEventListener('BoosteWidgetReady', function(event) {
  console.log('Widget version:', event.detail.version);
});
```

## 🔒 CORS ve Güvenlik

### CORS Nedir?

Cross-Origin Resource Sharing (CORS), farklı domainler arasında kaynak paylaşımını kontrol eden bir tarayıcı güvenlik mekanizmasıdır.

### Bu Widget Nasıl CORS-Safe?

1. **Tek Dosya Dağıtımı**: Tüm kaynaklar (CSS, JS, React) tek bir dosyada
2. **Inline CSS**: CSS, JavaScript içine gömülü
3. **IIFE Format**: Global namespace kirliliğini önler
4. **Self-Contained**: Harici kaynak yüklemez
5. **No External Requests**: Widget kendi içinde çalışır

### ORB (Opaque Response Blocking) Koruması

Widget, Opaque Response Blocking hatalarını önlemek için:
- Tüm kaynakları inline olarak yükler
- Cross-origin istekleri minimize eder
- Same-origin policy'ye uyumludur

## 🛠️ Geliştirme

### Kurulum

```bash
npm install
```

### Widget Build

```bash
npm run build:widget
```

Build çıktısı `dist-widget/widget.js` dosyasında oluşur.

### Geliştirme Modu

```bash
npm run dev
```

## 📁 Dosya Yapısı

```
├── src/
│   ├── widget.tsx              # Widget entry point
│   ├── components/
│   │   └── BoosteWidgetApp.tsx # Widget ana component
│   └── ...
├── dist-widget/
│   └── widget.js               # Build çıktısı
├── vite.widget.config.ts       # Widget build config
└── widget-integration.html     # Entegrasyon kılavuzu
```

## 🔍 Sorun Giderme

### Widget Görünmüyor

1. Console'da hata var mı kontrol edin
2. Script doğru yüklenmiş mi?
3. Target selector doğru mu?
4. Container'ın yüksekliği var mı?

```javascript
// Debug komutları
console.log(window.Booste);           // Widget yüklü mü?
console.log(window.Booste.version);   // Versiyon?
```

### CORS Hatası Alıyorum

Widget CORS-safe olmasına rağmen, eğer hala CORS hatası alıyorsanız:

1. Widget dosyasının doğru domain'den yüklendiğinden emin olun
2. `apiUrl` parametresini kullanarak özel API URL belirtin
3. Server'ınızın CORS header'larını kontrol edin

## 📝 Örnek Kullanımlar

### Basit Entegrasyon

```html
<!DOCTYPE html>
<html>
<head>
    <title>Booste Widget Demo</title>
</head>
<body>
    <div id="game-container" style="width: 100%; height: 600px;"></div>
    
    <script src="https://cdn.example.com/widget.js"></script>
    <script>
        window.addEventListener('BoosteWidgetReady', function() {
            window.Booste.init({
                target: '#game-container',
                games: ['snake', 'wheel'],
                type: 'embedded',
                theme: 'dark'
            });
        });
    </script>
</body>
</html>
```

### Popup ile Kullanım

```html
<button onclick="openGame()">Oyun Oyna</button>

<script src="https://cdn.example.com/widget.js"></script>
<script>
    function openGame() {
        if (window.Booste) {
            window.Booste.init({
                target: '#game',
                games: ['wheel'],
                type: 'popup',
                theme: 'colorful'
            });
        }
    }
</script>
```

### Dinamik Tema Değiştirme

```javascript
// Önce mevcut widget'ı kapat
window.Booste.destroy();

// Yeni tema ile başlat
window.Booste.init({
    target: '#game',
    games: ['snake'],
    type: 'embedded',
    theme: 'light' // Yeni tema
});
```

## 🌐 Tarayıcı Desteği

- Chrome/Edge: ✅ Son 2 versiyon
- Firefox: ✅ Son 2 versiyon
- Safari: ✅ Son 2 versiyon
- Opera: ✅ Son 2 versiyon

## 📄 Lisans

MIT

## 💬 Destek

Sorularınız için: support@booste.com

## 🔗 Linkler

- [Canlı Demo](./widget-integration.html)
- [Entegrasyon Kılavuzu](./widget-integration.html)
- [API Dokümantasyonu](./widget-integration.html)

---

**Not**: Bu widget, modern web standartlarına uygun olarak geliştirilmiştir ve herhangi bir web sitesinde güvenle kullanılabilir.
