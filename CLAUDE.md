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

## Sıradaki (opsiyonel cila)
Tema değiştirme butonu, ses efektleri, sınavda canlı renklendirme aç/kapa, ısınma turu vurgusu,
resmî ZIP metinlerini havuza ekleme. Sonra istenirse deploy (Netlify/GitHub Pages/Vercel).

## Notlar
- Kullanıcı Türkçe iletişim kuruyor; tüm UI ve dokümantasyon Türkçe.
- Kullanıcı çok fazla/uzun araştırma istemiyor; hedefli ve hızlı ilerlenecek.
- Git repo'su var; commit'ler Türkçe.
