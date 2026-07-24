# Uygulama Planı — Katiplik Klavye Sınavı Simülatörü

## 1. Hedef
Adalet Bakanlığı zabıt katibi uygulamalı (klavye) sınavına **birebir** benzeyen, ücretsiz,
kayıtsız web simülatörü. Fark yaratan nokta: **resmi kelime-bazlı puanlama motoru**.

## 2. Teknik Temel
- Sade HTML + CSS + Vanilla JS (ES modülleri). Sıfır bağımlılık.
- Veri: `localStorage` (deneme geçmişi, ayarlar, tercih edilen klavye).
- Barındırma: statik hosting (GitHub Pages/Netlify/Vercel).
- Dosya yapısı:
  ```
  /index.html            → Sınav (ana ekran)
  /pratik.html           → Serbest pratik (süresiz/özel süre)
  /kurallar.html         → Sınav kuralları + puanlama açıklaması
  /tuyolar.html          → F/Q klavye tüyo kartları, parmak yerleşimi
  /istatistik.html       → Geçmiş denemeler + hız grafiği
  /css/style.css
  /js/engine.js          → PUANLAMA MOTORU (çekirdek, test edilecek)
  /js/exam.js            → Sınav akışı: süre, girdi kilidi, sonuç
  /js/storage.js         → localStorage sarmalayıcı
  /js/texts.js           → Metin havuzu (resmi tarzı, küçük harf, noktalamasız)
  /js/ui.js, /js/charts.js
  /data/texts.json       → Metin arşivi
  /tests/engine.test.html→ Motor testleri (resmi PDF örnekleriyle)
  ```

## 3. Puanlama Motoru (EN KRİTİK — önce bu, test-güdümlü)
Girdi: `referans` (verilen metin, kelime dizisi) + `yazilan` (kullanıcı çıktısı).
Çıktı: `{ dogruKelime, hataliKelime, netKelime, atlananKelime, eksikSonKelime,
        hataOrani, basarili, hataDetay[] }`.

Algoritma:
1. **Fazla boşluk** tespiti: ham metinde art arda 2+ boşluk → her blok 1 hata.
2. Kelime dizilerini **hizala** (word-level alignment / Needleman-Wunsch benzeri) →
   eşleşen, atlanan (referansta var yazılmamış), bölme (2 yazılan→1 referans),
   birleştirme (1 yazılan→2 referans) durumlarını çıkar.
3. Eşleşen çiftlerde hata türünü sınıflandır: tam eşit=doğru; değilse
   fazla vuruş / eksik vuruş / harf yer değiştirme / karakter / karışık → 1 hata.
4. **Eksik son kelime:** süre bitince yarım kalan son kelime → hata sayılmaz.
5. **Geçersizlik kapıları:** atlanan ≥ 22 → başarısız; hataliKelime/toplamYazilan > %25 → başarısız.
6. **Net Kelime** = doğru kelimeler (fazla boşluk vb. net'ten düşülür).
- **Doğrulama:** resmi PDF örnekleri birebir test edilecek
  (adalet→adalett=1, ada al et=3, bir leşş tir me=4, adaletbakanlığı=1, vb.).

## 4. Sınav Ekranı (gerçeğe sadık)
- Üstte: rastgele seçilen metin (küçük harf, noktalamasız), okunması kolay tipografi.
- Altta: yazım alanı. Yazdıkça ilerlenen kelime vurgulanır (opsiyonel, ayarlanabilir).
- **180 sn geri sayım**, canlı kelime sayacı, ilerleme.
- Süre bitince girdi kilitlenir → **Sonuç Tutanağı** ekranı (gerçek tutanak formatı):
  net kelime, hatalı kelime, atlanan, hata oranı %, vuruş bazlı bilgi, GEÇTİ/KALDI.
- Kurallara uygun: metin önceden görünmez (Başlat'a basınca gelir), silme serbest.

## 5. Tam Paket Özellikleri
- **Serbest pratik:** özel süre, tekrar, sadece belirli metinler.
- **Tüyo kartları:** F ve Q parmak yerleşimi, ısınma, sık hata ipuçları.
- **Kurallar sayfası:** resmi kriterlerin sade anlatımı.
- **İstatistik:** deneme geçmişi, net kelime/dk trendi, en iyi skor, hız grafiği (localStorage).
- **Ayarlar:** klavye tercihi (F/Q), tema (açık/koyu), ses/uyarı.

## 6. Metin Havuzu
- Başlangıç: resmi tarza uygun (küçük harf, noktalamasız) 15-20 metin.
- İleride: PGM'nin yayınladığı resmi ZIP metinleri eklenebilir.

## 6.5 İnce Detaylar / Kalite Özellikleri (kullanıcı isteği)

### Süre ayarları
- **Sınav modu:** 180 sn sabit, kurallara tam uyum (değiştirilemez).
- **Serbest mod:** hazır süreler (60/120/180/300 sn) veya sınırsız + özel süre girişi.
- Son 10 sn görsel/sesli uyarı; süre bitince otomatik kilit.
- **Isınma turu:** sayılmayan 30 sn ısınma seçeneği.

### Metin ayarları
- Seçim: rastgele / kategori / belirli metin / uzunluğa göre (kısa-orta-uzun).
- İçerik türü: resmi tarz · edebi · hukuki terim ağırlıklı.
- "Aynı metni tekrar" ve "yeni metin" butonları.
- **Yazı boyutu (punto)**, satır aralığı, font seçimi — okunabilirlik.
- Metni gizleme modu (ezber/dikte pratiği — opsiyonel).

### Yazım deneyimi
- Anlık renklendirme (doğru=yeşil, yanlış=kırmızı) — **ayarlanabilir**; gerçek sınavda
  yok, o yüzden "gerçek sınav" modunda varsayılan KAPALI.
- İlerledikçe otomatik kaydırma (auto-scroll) + imleç takibi.
- **Yapıştırmayı engelle** (kopya-yapıştır ile hile önleme).
- Türkçe karakter doğruluğu (ç ğ ı İ ö ş ü) — **kritik, en baştan doğru işlenecek**.

### Görsel sanal klavye
- Ekranda **F ve Q düzeni** çizimi; basılan tuş vurgulanır, parmaklar renk kodlu.
- Sonraki basılması gereken tuşu gösterme (öğrenme modu — opsiyonel).

### Ses / geri bildirim
- Tuş sesi, hata sesi, bitiş sesi — hepsi aç/kapa.
- Titreşim (mobil) — opsiyonel.

### Sonuç ekranı zenginliği
- Detaylı hata dökümü: yanlış yazılan kelimeler + hata türü etiketiyle.
- KPM (kelime/dk), vuruş/dk, doğruluk %.
- Gerçek tutanak görünümü + "resmî olsaydı: GEÇER/KALIR".
- En çok hata yapılan tuş/harf ısı haritası.
- "Tekrar dene" + skor kartı görseli (paylaşılabilir, opsiyonel).

### İlerleme / motivasyon
- Geçmiş grafiği, en iyi skor, ortalama net kelime.
- Günlük seri (streak), hedef belirleme (ör. 90 net kelime) + ilerleme çubuğu.
- Sade kilometre taşları (abartısız).

### Genel kalite
- Klavye kısayolları (Enter=başlat, Esc=iptal).
- Ayarların hatırlanması (localStorage), tema (açık/koyu).
- Mobil/tablet uyarısı: "fiziksel klavye önerilir".
- Sekme kapanınca/istemsiz çıkışta uyarı.
- Çevrimdışı çalışma (PWA) — opsiyonel, sona.

## 7. Yapım Sırası
1. İskelet + puanlama motoru (TDD, resmi örneklerle) ← ilk ve en önemli.
2. Sınav ekranı + süre + sonuç tutanağı.
3. Metin havuzu + rastgele seçim.
4. İstatistik/geçmiş + grafik.
5. Tüyolar + kurallar + serbest pratik.
6. Cila: tasarım, mobil uyum, erişilebilirlik.
7. Canlıya alma (statik hosting).

## 8. Açık Sorular (canlı öncesi)
- Site adı / marka? (ör. "Katip Klavye", "Zabıt Sınavı Simülatörü")
- Domain alınacak mı, yoksa bedava alt alan adı mı?
- İlk metinleri resmi ZIP'ten mi çekelim, yoksa özgün mü yazalım?
