# Klavye Sınavım

Adalet Bakanlığı **zabıt ve icra katipliği** uygulamalı (klavye) sınavının ücretsiz,
kayıtsız simülatörü. Gerçek sınav kriterleriyle puanlar; sonuçlar yalnızca tarayıcında saklanır.

## Özellikler

- **Resmî puanlama motoru** — kelime bazlı hata, 22 kelime atlama kapısı, %25 hata sınırı.
- **3 dakikalık gerçek sınav** akışı; süre bitince resmî tutanak formatında sonuç.
- **30 gerçek metin** (Adalet Bakanlığı PGM, 2025 uygulama sınavı metinleri).
- **Prompter modu** (kelimeler ayarlanabilir hızda kayar) ve **tam ekran metin** okuma.
- **F/Q klavye tüyoları** — parmak yerleşimi renkli, basılan tuş ekranda yanar.
- **Kişisel istatistik** ve gelişim grafiği, açık/koyu tema, ses, canlı renklendirme.
- Kayıt yok, dış kaynak yok; tamamen `localStorage` tabanlı.

## Sayfalar

| Dosya | İçerik |
|-------|--------|
| `index.html` | Ana sayfa (tanıtım, SSS, nasıl puanlanır) |
| `sinav.html` | Sınav ve alıştırma ekranı |
| `kurallar.html` | Resmî değerlendirme kriterleri |
| `tuyolar.html` | F/Q klavye parmak yerleşimi |
| `istatistik.html` | Deneme geçmişi ve grafik |

## Çalıştırma

Kurulum gerekmez: `index.html` dosyasına çift tıkla.

Geliştirme için yerel sunucu (opsiyonel):

```bash
node server.mjs               # http://localhost:8080
node tests/engine.test.mjs    # puanlama motoru testleri (37 test)
```

## Puanlama

Üç dakikada yazılan metin kelime kelime karşılaştırılır. Fazla harf, eksik harf, yer değiştirme,
karakter, kelime bölme, kelime birleştirme ve fazla boşluk hatalarının her biri 1 kelime hatasıdır.
**22 ve üzeri kelime atlanırsa** veya **yanlış oranı %25'i geçerse** sınav başarısız sayılır.
Ulaşılamayan (süre yetmeyen) kuyruk atlanan sayılmaz. Sabit "90 kelime" şartı yoktur.

## Yayın (Vercel)

Statik site; build gerektirmez. `vercel.json` güvenlik başlıklarını (CSP vb.) taşır.
Özel domain eklersen `index.html` ve diğer sayfaların `canonical`/OG etiketleri, `sitemap.xml`
ve `robots.txt` içindeki adresi güncelle.

---

Bağımsız bir çalışma aracıdır; Adalet Bakanlığı’nın resmî sitesi değildir.
