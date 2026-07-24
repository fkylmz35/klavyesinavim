// exam.js — Sınav akışı: süre, girdi kilidi, canlı sayaç, sonuç tutanağı
// Klasik script olarak yüklenir; engine.js, texts.js, storage.js önce yüklenmeli.

const SINAV_SURESI = 180; // saniye (resmî: 3 dakika)

const $ = (sel) => document.querySelector(sel);

// Kullanıcı kaynaklı metni HTML'e gömmeden önce kaçır (XSS önlemi).
function kacir(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let durum = 'hazir';        // 'hazir' | 'calisiyor' | 'bitti'
let aktifMetin = null;
let kalanSaniye = SINAV_SURESI;
let sayacId = null;
let baslangicZamani = 0;
let ayarlar = ayarlariOku();

// --- Süre ayarı (mod) --------------------------------------------------------
function seciliSure() {
  const secili = document.querySelector('input[name="mod"]:checked');
  if (!secili || secili.value === 'sinav') return SINAV_SURESI;
  return parseInt(secili.value, 10);
}

function ddss(saniye) {
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;
  return `${dk}:${String(sn).padStart(2, '0')}`;
}

// --- Sınavı başlat -----------------------------------------------------------
function baslat() {
  aktifMetin = rastgeleMetin(aktifMetin?.id);
  kalanSaniye = seciliSure();
  durum = 'calisiyor';
  baslangicZamani = Date.now();

  $('#metinAlani').textContent = aktifMetin.metin;
  const yazma = $('#yazmaAlani');
  yazma.value = '';
  yazma.disabled = false;
  yazma.classList.toggle('renklendir', ayarlar.renklendirme);
  yazma.focus();

  $('#sayac').textContent = ddss(kalanSaniye);
  $('#sayac').classList.remove('kritik');
  guncelleIstatistik();

  ekranDurumu('calisiyor');

  clearInterval(sayacId);
  sayacId = setInterval(() => {
    kalanSaniye--;
    $('#sayac').textContent = ddss(kalanSaniye);
    if (kalanSaniye <= 10) $('#sayac').classList.add('kritik');
    if (kalanSaniye <= 0) bitir(true);
  }, 1000);
}

// --- Canlı istatistik (kelime sayısı) ---------------------------------------
function guncelleIstatistik() {
  const yazilan = splitWords($('#yazmaAlani').value).length;
  $('#canliKelime').textContent = yazilan;
}

// --- Sınavı bitir ------------------------------------------------------------
function bitir(sureBitti) {
  if (durum !== 'calisiyor') return;
  clearInterval(sayacId);
  durum = 'bitti';

  const yazma = $('#yazmaAlani');
  yazma.disabled = true;
  const gecenSure = Math.min(seciliSure(), Math.round((Date.now() - baslangicZamani) / 1000)) || 1;

  const sonuc = degerlendir(aktifMetin.metin, yazma.value, { kesildi: sureBitti });
  tutanakGoster(sonuc, gecenSure);

  // Geçmişe kaydet
  denemeEkle({
    tarih: new Date().toISOString(),
    metinId: aktifMetin.id,
    sure: gecenSure,
    net: sonuc.netKelime,
    dogru: sonuc.dogruKelime,
    hatali: sonuc.hataliKelime,
    atlanan: sonuc.atlananKelime,
    oran: sonuc.hataOraniYuzde,
    kpm: Math.round((sonuc.netKelime / gecenSure) * 60),
    basarili: sonuc.basarili,
  });

  ekranDurumu('bitti');
}

// --- Tutanak (sonuç) ekranı --------------------------------------------------
function tutanakGoster(s, gecenSure) {
  const kpm = Math.round((s.netKelime / gecenSure) * 60);
  const rozet = $('#sonucRozet');
  rozet.textContent = s.basarili ? 'GEÇER' : 'KALIR';
  rozet.className = 'rozet ' + (s.basarili ? 'basarili' : 'basarisiz');

  const neden = {
    atlanan_kelime: '22 ve üzeri kelime atlandığı için',
    hata_orani: 'yanlış oranı %25’i geçtiği için',
    net_kelime_hedefi: 'net kelime hedefinin altında kalındığı için',
  }[s.basarisizlikNedeni] || '';
  $('#sonucAciklama').textContent = s.basarili
    ? 'Bu sonuç gerçek sınav kriterlerine göre geçerli sayılırdı.'
    : `Bu sonuç ${neden} geçersiz sayılırdı.`;

  const satir = (etiket, deger, vurgu) =>
    `<div class="tutanak-satir${vurgu ? ' vurgu' : ''}"><span>${etiket}</span><strong>${deger}</strong></div>`;

  $('#tutanak').innerHTML =
    satir('Net Kelime Sayısı', s.netKelime, true) +
    satir('Doğru Kelime', s.dogruKelime) +
    satir('Hatalı Kelime', s.hataliKelime) +
    satir('Atlanan Kelime', s.atlananKelime) +
    satir('Fazla Boşluk', s.fazlaBosluk) +
    satir('Toplam Yazılan', s.toplamYazilan) +
    satir('Hata Oranı', '%' + s.hataOraniYuzde) +
    satir('Hız (net kelime/dk)', kpm) +
    (s.eksikSonKelime ? satir('Eksik Son Kelime', kacir(s.eksikSonKelime.yazilan + ' → ' + s.eksikSonKelime.dogrusu)) : '');

  // Hata dökümü
  const dokum = $('#hataDokum');
  if (s.hataListesi.length === 0) {
    dokum.innerHTML = '<p class="temiz">Hiç hata yok — tertemiz! 🎯</p>';
  } else {
    const turAd = {
      fazla_vurus: 'fazla vuruş', eksik_vurus: 'eksik vuruş', harf_yer_degistirme: 'harf yer değiştirme',
      karakter: 'karakter', karisik: 'karışık', kelime_bolme: 'kelime bölme', kelime_birlestirme: 'kelime birleştirme',
    };
    dokum.innerHTML = '<h3>Hata Dökümü</h3>' + s.hataListesi.map(h =>
      `<div class="hata-satir"><code class="yanlis">${kacir(h.yazilan || '∅')}</code>
       <span class="ok">→</span> <code class="dogru">${kacir(h.dogrusu || '—')}</code>
       <span class="tur">${kacir(turAd[h.tur] || h.tur)}</span></div>`).join('');
  }
}

// --- Ekran durum yönetimi ----------------------------------------------------
function ekranDurumu(d) {
  $('#hazirEkran').hidden = d !== 'hazir';
  $('#sinavEkran').hidden = d !== 'calisiyor';
  $('#sonucEkran').hidden = d !== 'bitti';
}

// --- Kurulum -----------------------------------------------------------------
function kur() {
  ekranDurumu('hazir');

  $('#baslatBtn').addEventListener('click', baslat);
  $('#bitirBtn').addEventListener('click', () => bitir(false));
  $('#tekrarBtn').addEventListener('click', baslat);
  $('#yeniBtn').addEventListener('click', () => { durum = 'hazir'; ekranDurumu('hazir'); });

  const yazma = $('#yazmaAlani');
  yazma.addEventListener('input', guncelleIstatistik);

  // Yapıştırmayı engelle (hile önleme)
  yazma.addEventListener('paste', (e) => {
    if (ayarlar.yapistirmaEngeli) { e.preventDefault(); yazma.classList.add('uyari'); setTimeout(() => yazma.classList.remove('uyari'), 400); }
  });
  yazma.addEventListener('drop', (e) => { if (ayarlar.yapistirmaEngeli) e.preventDefault(); });

  // Klavye kısayolu: Enter (hazır/sonuç ekranında) başlat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (durum === 'hazir' || durum === 'bitti') &&
        document.activeElement?.id !== 'yazmaAlani') { e.preventDefault(); baslat(); }
    if (e.key === 'Escape' && durum === 'calisiyor') bitir(false);
  });

  // Ayar: renklendirme + tema
  const renkChk = $('#renkChk');
  if (renkChk) {
    renkChk.checked = ayarlar.renklendirme;
    renkChk.addEventListener('change', () => {
      ayarlar.renklendirme = renkChk.checked; ayarlariYaz(ayarlar);
      $('#yazmaAlani').classList.toggle('renklendir', ayarlar.renklendirme);
    });
  }

  ozetGoster();
}

// Küçük özet: en iyi skor / deneme sayısı
function ozetGoster() {
  const g = gecmisOku();
  const kutu = $('#ozet');
  if (!kutu) return;
  if (!g.length) { kutu.textContent = 'Henüz deneme yok. İlk sınavını başlat!'; return; }
  const enIyi = Math.max(...g.map(d => d.net));
  const gecen = g.filter(d => d.basarili).length;
  kutu.innerHTML = `Toplam deneme: <strong>${g.length}</strong> · En iyi net: <strong>${enIyi}</strong> · Geçer: <strong>${gecen}</strong>`;
}
