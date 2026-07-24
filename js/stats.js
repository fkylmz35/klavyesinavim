// stats.js — Geçmiş denemeler: özet, trend grafiği (canvas), tablo
// Klasik script olarak yüklenir; storage.js önce yüklenmeli.

const $ = (s) => document.querySelector(s);

function kacir(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function tarihKisa(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Basit çizgi grafiği (net kelime / deneme)
function grafikCiz(canvas, veriler) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  if (veriler.length === 0) return;

  const pad = { sol: 34, sag: 12, ust: 14, alt: 24 };
  const gW = W - pad.sol - pad.sag, gH = H - pad.ust - pad.alt;
  const enB = Math.max(...veriler, 10);
  const enK = 0;
  const stil = getComputedStyle(document.body);
  const renkInk = stil.getPropertyValue('--ink').trim() || '#16233A';
  const renkCizgi = stil.getPropertyValue('--cizgi').trim() || '#cfd5df';
  const renkSoluk = stil.getPropertyValue('--soluk').trim() || '#5b6675';

  // Izgara + eksen etiketleri
  ctx.strokeStyle = renkCizgi; ctx.fillStyle = renkSoluk;
  ctx.font = '11px system-ui'; ctx.lineWidth = 1;
  const adim = 4;
  for (let i = 0; i <= adim; i++) {
    const deger = Math.round(enK + (enB - enK) * (i / adim));
    const y = pad.ust + gH - (gH * i / adim);
    ctx.beginPath(); ctx.moveTo(pad.sol, y); ctx.lineTo(W - pad.sag, y); ctx.stroke();
    ctx.fillText(deger, 6, y + 3);
  }

  const x = (i) => pad.sol + (veriler.length === 1 ? gW / 2 : (gW * i / (veriler.length - 1)));
  const y = (v) => pad.ust + gH - (gH * (v - enK) / (enB - enK || 1));

  // Çizgi
  ctx.strokeStyle = renkInk; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  veriler.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
  ctx.stroke();
  // Noktalar
  ctx.fillStyle = renkInk;
  veriler.forEach((v, i) => { ctx.beginPath(); ctx.arc(x(i), y(v), 3.5, 0, 7); ctx.fill(); });
}

function kur() {
  const g = gecmisOku();

  // Özet kartları
  if (g.length) {
    const netler = g.map(d => d.net);
    const enIyi = Math.max(...netler);
    const ort = Math.round(netler.reduce((a, b) => a + b, 0) / netler.length);
    const gecen = g.filter(d => d.basarili).length;
    const sonKpm = g[g.length - 1].kpm;
    $('#ozetKartlar').innerHTML = [
      ['Deneme', g.length], ['En iyi net', enIyi], ['Ortalama net', ort],
      ['Geçer sayısı', gecen], ['Son hız (kelime/dk)', sonKpm],
    ].map(([e, v]) => `<div class="bilgi-kutu"><span class="bk-buyuk">${v}</span><span class="bk-alt">${e}</span></div>`).join('');
  } else {
    $('#bosDurum').hidden = false;
    $('#icealan').hidden = true;
    return;
  }

  // Grafik (son 30 deneme)
  const son = g.slice(-30);
  grafikCiz($('#grafik'), son.map(d => d.net));

  // Tablo (en yeni üstte)
  $('#tabloGovde').innerHTML = g.slice().reverse().map(d => `
    <tr>
      <td>${kacir(tarihKisa(d.tarih))}</td>
      <td><b>${d.net}</b></td>
      <td>${d.dogru}</td>
      <td>${d.hatali}</td>
      <td>${d.atlanan}</td>
      <td>%${d.oran}</td>
      <td>${d.kpm}</td>
      <td>${d.basarili ? '<span class="etk gecer">GEÇER</span>' : '<span class="etk kalir">KALIR</span>'}</td>
    </tr>`).join('');

  $('#temizleBtn').addEventListener('click', () => {
    if (confirm('Tüm deneme geçmişin silinecek. Emin misin?')) { gecmisiTemizle(); location.reload(); }
  });

  window.addEventListener('resize', () => grafikCiz($('#grafik'), son.map(d => d.net)));
}

// Kendi kendine başlat (satır-içi script olmadan; katı CSP için).
if (typeof document !== 'undefined' && document.getElementById('tabloGovde')) {
  if (document.readyState !== 'loading') kur();
  else document.addEventListener('DOMContentLoaded', kur);
}
