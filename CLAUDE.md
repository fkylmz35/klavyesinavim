# Katiplik Klavye Sınavı Simülasyonu

## Proje Vizyonu
Adalet Bakanlığı zabıt/icra katipliği **uygulama (klavye) sınavına** birebir benzeyen,
**ücretsiz ve kayıt gerektirmeyen** bir web simülasyonu. Amaç: adayların gerçek sınav
deneyimini önceden yaşaması ve kendini doğru şekilde ölçmesi.

## Temel İlkeler
- **Kullanıcı yararı her şeyden önce gelir**: ücretsiz, kayıtsız, reklamsız başlangıç.
- **Gerçeğe sadakat**: sınav ekranı, süre, metin formatı ve puanlama gerçek sınavla
  birebir aynı olmalı. "Yaklaşık benzer" yeterli değil.
- Basitlik: statik/hafif bir site; giriş bariyeri sıfır.

## Süreç Sırası (kullanıcının belirlediği)
1. **Detaylı araştırma** ← şu an buradayız (deep-research workflow çalışıyor)
2. Fikri geliştirme (araştırma bulgularıyla birlikte)
3. Planlama
4. Canlıya alma

## Araştırma Kapsamı
- Resmi sınav formatı ve mevzuat (süre, 90 kelime kuralı, doğru/yanlış kelime sayımı)
- Adalet Bakanlığı resmi çalışma metinleri (kaynak, format, liste)
- Rakip siteler ve eksikleri
- Aday şikayetleri / forum analizi (memurlar.net, ekşi, YouTube vb.)
- Puanlama detayı (harf hatası, boşluk hatası, silme/düzeltme kuralları)

## RESMİ SINAV KURALLARI (Puanlama Motorunun Kaynağı)
Kaynak: Adalet Bakanlığı PGM, "Zabıt Katibi Uygulamalı Sınav Değerlendirme Kriterleri"
(13.07.2026 yayını, 1 Ağustos 2026 sözleşmeli zabıt katibi sınavı için). Dayanak:
Adalet Bakanlığı Memur Sınav, Atama ve Nakil Yönetmeliği md. 6/6.

### Genel
- **Program:** Onparmak Klavye Programı (Bilgi İşlem Genel Müdürlüğü geliştirdi).
- **Süre:** 3 dakika = **180 saniye**.
- **Metin:** Tamamı **küçük harf**, **noktalama işareti YOK**, **paragraf YOK**.
  Aday da noktalama, rakam veya metin dışı ibare **eklemeyecek**.
- Metin sistemce otomatik seçilir; aday önceden göremez (basılı çıktı verilmez).
- Değerlendirme **kelime bazlı**; vuruş bazlı sonuç yalnızca bilgi amaçlı.
- Sonuç: "Net Kelime Sayısı" sıralama/başarı ölçütüdür.

### Hata Türleri (her biri 1 kelime hatası, "adalet" örneğiyle)
- **Fazla Vuruş:** harf fazladan → adalett
- **Eksik Vuruş:** harf eksik → adale
- **Harf Yer Değiştirme:** iki harf yer değiştirmiş → adalte
- **Karakter Hatası:** harf yerine noktalama/rakam → .dalet
- **Kelime Bölme:** kelime doğru ama bölünmüş → 1 hata; kelime yanlış+bölünmüş → her parça 1 hata
  (ada al et = 3 hata; bir leşş tir me = 4 hata)
- **Kelime Birleştirme:** iki kelime bitişik yazılmış → 1 hata (adaletbakanlığı)
- **Fazla Boşluk:** art arda 2+ boşluk → tek fazla boşluk hatası = 1 hata (net kelimeden düşülür)
- **Karışık Hata:** yukarıdakiler dışındaki her hata; özellikle metin dışı noktalama/rakam/harf ekleme → 1 hata

### Özel Durumlar
- **Eksik Son Kelime:** süre biterken yarım kalan SON kelime → hata SAYILMAZ.
- **Atlanan Kelime:** yazılmayan kelime → hata sayılmaz. AMA **toplam 22+ kelime atlanırsa
  yazılan kelime sayısına bakılmaksızın sınav BAŞARISIZ.**
- **Anlam bütünlüğü:** Yanlış kelime / toplam yazılan kelime oranı **%25'i geçerse** metin anlam
  bütünlüğü şartını taşımaz → BAŞARISIZ.
- NOT: Bu kriterler belgesinde sabit "en az 90 kelime" eşiği YOK. Başarı, iki geçersizlik kapısı
  (22 atlama, %25 hata) + net kelime sıralaması ile belirlenir. "90 kelime" eski/söylenti eşik;
  motor eşiği **ayarlanabilir** olacak.

### Resmi Metin Kaynağı
- PGM her alımda **uygulama metinlerini ZIP** olarak yayınlıyor (küçük harf, noktalamasız).
  Simülasyonda gerçek metin havuzu olarak bunlar kullanılabilir.
  Sayfa: pgm.adalet.gov.tr → "Sözleşmeli Zabıt Katibi Uygulamalı Sınav Metinleri ve Değerlendirme Kriterleri".

## Önemli Kararlar
Önemli kararlar kullanıcıya sorulur.
- **Kural kaynağı:** Resmi doğrulama yapıldı (yukarıdaki kriterler). ✔
- **Klavye desteği:** F ve Q birlikte (kullanıcı seçer, tüyo kartları her ikisi için). ✔
- **İlk sürüm kapsamı:** Tam paket (simülasyon + tüyo kartları + kurallar + metin arşivi +
  kişisel istatistik/geçmiş + hız grafiği). ✔
- **Teknik temel:** Sade HTML/CSS/JS, çerçevesiz, sıfır bağımlılık. Backend yok; geçmiş/istatistik
  localStorage'da. Barındırma: statik (GitHub Pages / Netlify / Vercel — bedava). ✔

## Kapsam Notu (önemli)
Bu klavye sınavı SADECE zabıt katipliğine özel değil. Aynı sistem (Onparmak Klavye Programı,
3 dk, kelime bazlı, 22 atlama / %25 hata) Adalet Bakanlığı'nın **zabıt kâtibi, icra kâtibi ve
görevde yükselme** sınavlarında kullanılıyor. UI metinleri "zabıt ve icra katipliği" der.
Marka geçici olarak **KatipSınav** (ikisini de kapsar).

## Durum (2026-07-24)
- MVP tamam ve tarayıcıda doğrulandı: Sınav, Kurallar, Tüyolar (interaktif Q/F klavye), İstatistik.
- Puanlama motoru: 34/34 test geçiyor (`node tests/engine.test.mjs`).
- **Sunucusuz çalışır:** `index.html`'e çift tıkla — ES modül YOK, klasik script'ler + inline metin.
  (Dev sunucu opsiyonel: `node server.mjs` → localhost:8080.)
- Yayın: kullanıcı "şimdilik sadece yerel" dedi; deploy YOK.

## Eklendi (2026-07-24, ikinci oturum)
- **Gerçek metinler:** PGM resmî ZIP'inden 30 gerçek 2025 zabıt katibi sınav metni (`js/texts.js`).
  Hepsi hukuk konulu, küçük harf, noktalamasız, ~300 kelime. (Kaynak ZIP scratchpad'de.)
- **Tema seçimi:** açık/koyu, `js/theme.js` + her sayfada tema butonu, localStorage'da.
- **KRİTİK MOTOR DÜZELTMESİ:** Hizalama artık referansın adayın ulaştığı **önekinde** biter;
  ulaşılamayan kuyruk ATLANAN sayılmaz (önceden 300 kelimelik metinde herkes otomatik KALIR
  oluyordu). Bkz. engine.js `jSon` (en düşük maliyetli bitiş noktası). 37/37 test geçiyor.

## Eklendi (2026-07-24, üçüncü oturum — PROJE TAMAMLANDI)
- **Seçim kartları:** başlamadan süre + klavye (Q/F) + metin (rastgele veya 30'dan biri) seçimi.
- **Sağ yardımcı ray:** kare kutucuklar (Kurallar/Tüyolar linkleri + hatırlatıcılar); seçim ve sınav
  ekranında görünür, mobilde alta iner.
- **Ayarlar:** ses (son saniye tik + bitiş çanı, WebAudio) ve canlı renklendirme anahtarları,
  localStorage'da. Canlı renklendirme varsayılan KAPALI (gerçek sınavda yok).
- **Canlı renklendirme:** metin kelime kelime span; doğru=yeşil, yanlış=kırmızı, aktif=altı çizili.
- **Metin kutusu:** sabit yükseklik (40vh) + kaydırma; yazdıkça aktif kelimeyi takip eder.
- Mobil düzen doğrulandı (Playwright, 390px).

## Eklendi (2026-07-24, dördüncü oturum — v2.0)
- **Güvenlik:** server.mjs path traversal düzeltildi + güvenlik başlıkları (CSP, X-Frame-Options,
  nosniff, Referrer-Policy). CSP META DEĞİL BAŞLIK olarak verilir (meta script-src 'self' file://
  çift-tıklamayı bozardı). Deploy için `_headers` (Netlify/Cloudflare). Satır-içi script'ler
  dosyalara taşındı (exam.js/stats.js self-init, init-tuyolar.js). localStorage okuma sayısal
  alanları Number'a zorlar (kurcalama XSS savunması). Tüm innerHTML girişleri kaçırılır.
- **Yapı değişti:** index.html artık HOMEPAGE; uygulama sinav.html'e taşındı. Nav/CTA/linkler
  güncellendi (logo→homepage, "Sınav"→sinav.html).
- **Homepage + SEO/GEO/AEO:** hero (gerçek tutanak önizlemesi), özellik bento'su, puanlama bandı,
  SSS akordeon. JSON-LD (WebApplication + FAQPage — AEO için), OG/Twitter meta, canonical,
  sitemap.xml, robots.txt. Tasarım taste + frontend-design ilkeleriyle (tek aksan, serif gerekçeli,
  AI-tell yok). Puanlama bandı her iki temada sabit lacivert (tema-kilidi).
- **Tam ekran metin:** ⛶ butonu + görünüm modu; okuma panelini büyütür, rayı gizler.
- **Prompter modu:** kelimeler ayarlanabilir hızda (15-120 kelime/dk) kayar; aktif kelime vurgulanır.
- DEPLOY NOTU: sitemap/robots/canonical/OG'de "katipsinav.local" yerine gerçek domain yazılmalı.

## Durum: TAMAMLANDI (v2.0)
Homepage + 4 uygulama sayfası, sunucusuz (index.html çift tık), açık/koyu tema, 30 gerçek metin,
prompter + tam ekran, ses + canlı renklendirme, SEO/GEO/AEO, güvenlik başlıkları, 37/37 test.
Tüm sayfalar tarayıcıda 0 konsol hatasıyla doğrulandı.

## Notlar
- Kullanıcı Türkçe iletişim kuruyor; tüm UI ve dokümantasyon Türkçe.
- Kullanıcı çok fazla/uzun araştırma istemiyor; hedefli ve hızlı ilerlenecek.
- Git repo'su var; commit'ler Türkçe.
