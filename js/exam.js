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
let secilenMetinId = null;  // null => rastgele; aksi halde belirli metin
let aktifKelimeler = [];    // aktif metnin kelime dizisi (canlı renklendirme için)

// --- Ses (WebAudio; dosyasız, offline) ---------------------------------------
let sesCtx = null;
function ses(tip) {
  if (!ayarlar.ses) return;
  try {
    sesCtx = sesCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = sesCtx.createOscillator(), g = sesCtx.createGain();
    o.connect(g); g.connect(sesCtx.destination);
    const t = sesCtx.currentTime;
    if (tip === 'tik') {
      o.frequency.value = 880; g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); o.start(t); o.stop(t + 0.06);
    } else if (tip === 'bitti') {
      o.type = 'triangle'; o.frequency.setValueAtTime(540, t);
      o.frequency.exponentialRampToValueAtTime(300, t + 0.35);
      g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.start(t); o.stop(t + 0.4);
    }
  } catch (e) { /* ses desteklenmiyorsa sessiz geç */ }
}

// --- Canlı renklendirme (yalnız pratik; ayar açıksa) -------------------------
function canliRenklendir() {
  const alan = $('#metinAlani');
  const val = $('#yazmaAlani').value;
  const bosBiter = /\s$/.test(val);
  const tokens = val.split(/\s+/).filter(x => x.length);
  const tamamlanan = bosBiter ? tokens.length : Math.max(0, tokens.length - 1);
  const spanlar = alan.querySelectorAll('.mk-w');
  spanlar.forEach((sp, i) => {
    sp.classList.remove('dogru', 'yanlis', 'aktif');
    if (i < tamamlanan) {
      sp.classList.add(tokens[i] === aktifKelimeler[i] ? 'dogru' : 'yanlis');
    } else if (i === tamamlanan && tokens.length && !bosBiter) {
      sp.classList.add('aktif');
    }
  });
}

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
  if (secilenMetinId) {
    aktifMetin = METINLER.find(m => m.id === secilenMetinId) || rastgeleMetin();
  } else {
    aktifMetin = rastgeleMetin(aktifMetin?.id);
  }
  kalanSaniye = seciliSure();
  durum = 'calisiyor';
  baslangicZamani = Date.now();

  aktifKelimeler = aktifMetin.metin.split(' ');
  $('#metinAlani').innerHTML = aktifKelimeler
    .map((k, i) => `<span class="mk-w" data-i="${i}">${kacir(k)}</span>`).join(' ');
  $('#metinAlani').classList.toggle('renkli', ayarlar.renklendirme);
  const yazma = $('#yazmaAlani');
  yazma.value = '';
  yazma.disabled = false;
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
    if (kalanSaniye > 0 && kalanSaniye <= 3) ses('tik');
    if (kalanSaniye <= 0) bitir(true);
  }, 1000);
}

// --- Canlı istatistik (kelime sayısı + renklendirme + takip) ----------------
function guncelleIstatistik() {
  const val = $('#yazmaAlani').value;
  $('#canliKelime').textContent = splitWords(val).length;
  if (durum !== 'calisiyor') return;
  if (ayarlar.renklendirme) canliRenklendir();
  ilerleyeGoster(val);
}

// Metin kutusunu, adayın yazmakta olduğu kelimeye kaydır (gerçek sınav akışı).
function ilerleyeGoster(val) {
  const bosBiter = /\s$/.test(val);
  const tokens = val.split(/\s+/).filter(x => x.length);
  const idx = bosBiter ? tokens.length : Math.max(0, tokens.length - 1);
  const sp = $('#metinAlani').querySelector(`.mk-w[data-i="${idx}"]`);
  if (sp) sp.scrollIntoView({ block: 'nearest' });
}

// --- Sınavı bitir ------------------------------------------------------------
function bitir(sureBitti) {
  if (durum !== 'calisiyor') return;
  clearInterval(sayacId);
  durum = 'bitti';

  ses('bitti');
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

  // Süre modu: seçilen kartı görsel olarak işaretle
  document.querySelectorAll('.mod input').forEach(r =>
    r.addEventListener('change', () => {
      document.querySelectorAll('.mod').forEach(m => m.classList.remove('aktif-mod'));
      r.closest('.mod').classList.add('aktif-mod');
    }));

  // Klavye seçimi kartları
  document.querySelectorAll('.secim-kart[data-klavye]').forEach(k => {
    if (k.dataset.klavye === ayarlar.klavye) k.classList.add('aktif');
    k.addEventListener('click', () => {
      document.querySelectorAll('.secim-kart[data-klavye]').forEach(x => x.classList.remove('aktif'));
      k.classList.add('aktif');
      ayarlar.klavye = k.dataset.klavye; ayarlariYaz(ayarlar);
    });
  });

  // Metin seçimi (rastgele / belirli)
  metinGridDoldur();
  document.querySelectorAll('.metin-mod-btn').forEach(b =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.metin-mod-btn').forEach(x => x.classList.remove('aktif'));
      b.classList.add('aktif');
      const sec = b.dataset.mm === 'sec';
      $('#metinGrid').hidden = !sec;
      if (!sec) { secilenMetinId = null; metinSeciliGuncelle(); temizleGridSecim(); }
    }));

  // Ayar anahtarları (ses + canlı renklendirme)
  const sesChk = $('#sesChk');
  if (sesChk) {
    sesChk.checked = ayarlar.ses;
    sesChk.addEventListener('change', () => { ayarlar.ses = sesChk.checked; ayarlariYaz(ayarlar); });
  }
  const renkChk = $('#renkChk');
  if (renkChk) {
    renkChk.checked = ayarlar.renklendirme;
    renkChk.addEventListener('change', () => {
      ayarlar.renklendirme = renkChk.checked; ayarlariYaz(ayarlar);
      const alan = $('#metinAlani');
      if (alan) alan.classList.toggle('renkli', ayarlar.renklendirme);
      if (durum === 'calisiyor') {
        if (ayarlar.renklendirme) canliRenklendir();
        else alan.querySelectorAll('.mk-w').forEach(s => s.classList.remove('dogru', 'yanlis', 'aktif'));
      }
    });
  }

  ozetGoster();
}

// Metin kartları ızgarasını doldur
function metinGridDoldur() {
  const grid = $('#metinGrid');
  if (!grid || typeof METINLER === 'undefined') return;
  grid.innerHTML = METINLER.map((m, i) => {
    const onizleme = m.metin.split(' ').slice(0, 8).join(' ');
    return `<button type="button" class="metin-kart" data-id="${kacir(m.id)}">
      <span class="mk-no">${i + 1}</span>
      <span class="mk-onizleme">${kacir(onizleme)}…</span>
      <span class="mk-kelime">${m.kelime || m.metin.split(' ').length} kelime</span>
    </button>`;
  }).join('');
  grid.querySelectorAll('.metin-kart').forEach(k =>
    k.addEventListener('click', () => {
      temizleGridSecim();
      k.classList.add('secili');
      secilenMetinId = k.dataset.id;
      metinSeciliGuncelle();
    }));
}
function temizleGridSecim() {
  document.querySelectorAll('.metin-kart.secili').forEach(x => x.classList.remove('secili'));
}
function metinSeciliGuncelle() {
  const p = $('#metinSecili');
  if (!p) return;
  if (!secilenMetinId) { p.textContent = 'Her başlangıçta rastgele bir resmî metin gelir.'; return; }
  const m = METINLER.find(x => x.id === secilenMetinId);
  const no = METINLER.indexOf(m) + 1;
  p.innerHTML = `Seçildi: <strong>Metin ${no}</strong> — “${kacir(m.metin.split(' ').slice(0, 6).join(' '))}…”`;
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
