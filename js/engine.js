// engine.js — Zabıt Katibi Uygulamalı Sınav Puanlama Motoru
// Kaynak: Adalet Bakanlığı PGM "Zabıt Katibi Uygulamalı Sınav Değerlendirme Kriterleri"
// Değerlendirme KELİME BAZLI yapılır. Her hata türü = 1 kelime hatası.
//
// Bu modül saf JavaScript ES modülüdür; hem tarayıcıda hem Node'da çalışır.
// Sınav akışından (süre, arayüz) tamamen bağımsızdır: sadece metin karşılaştırır.

// ---- Ayarlanabilir eşikler (resmi kriterler) --------------------------------
const VARSAYILAN_AYAR = {
  atlananSiniri: 22,        // toplam 22+ atlanan kelime => başarısız
  hataOraniSiniri: 0.25,    // yanlış/toplam yazılan > %25 => anlam bütünlüğü yok => başarısız
  // Not: Resmî kriterlerde sabit "en az 90 net kelime" eşiği YOKTUR; başarı iki kapı
  // (atlama, hata oranı) + net kelime sıralamasıyla belirlenir. Yine de simülasyonda
  // kullanıcıya hedef göstermek için opsiyonel bir net kelime hedefi tutulabilir.
  netKelimeHedefi: null,
};

// ---- Türkçe'ye duyarlı yardımcılar ------------------------------------------
function trLower(s) {
  return String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr');
}

// Metni kelimelere böler (boşluk/sekme/satır sonu). Boş parçaları atar.
function splitWords(text) {
  return String(text).replace(/[\t\r\n]+/g, ' ').trim().split(/ +/).filter(Boolean);
}

// Yazılan ham metni kelimelere böler VE fazla boşluk hatalarını sayar.
// Art arda 2+ boşluk bırakılan her blok = 1 fazla boşluk hatası.
function tokenizeTyped(raw) {
  const spaced = String(raw).replace(/[\t\r\n]+/g, ' ');
  const runs = spaced.match(/ {2,}/g);
  const fazlaBosluk = runs ? runs.length : 0;
  const tokens = spaced.trim().split(/ +/).filter(Boolean);
  return { tokens, fazlaBosluk };
}

// Levenshtein (küçük kelimeler için yeterli) — hizalama benzerlik kılavuzu.
function lev(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    let cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

// Bir kelimenin diğerinin (ekleme yoluyla) alt dizisi olup olmadığı.
function altDizi(kisa, uzun) {
  let i = 0;
  for (let j = 0; j < uzun.length && i < kisa.length; j++) {
    if (uzun[j] === kisa[i]) i++;
  }
  return i === kisa.length;
}

// 1-1 eşleşen (yanlış) kelimede hata TÜRÜNÜ etiketle (sayıyı etkilemez, geri bildirim için).
function hataTuru(t, r) {
  if (t === r) return null;
  const nonLetter = /[^\p{L}]/u;
  if (t.length === r.length) {
    const diffs = [];
    for (let k = 0; k < r.length; k++) if (t[k] !== r[k]) diffs.push(k);
    if (diffs.length === 2 && diffs[1] === diffs[0] + 1 &&
        t[diffs[0]] === r[diffs[1]] && t[diffs[1]] === r[diffs[0]]) return 'harf_yer_degistirme';
    if (diffs.some(k => nonLetter.test(t[k]) && /\p{L}/u.test(r[k]))) return 'karakter';
    return 'karisik';
  }
  if (nonLetter.test(t)) return 'karisik'; // metin dışı karakter/rakam eklenmiş
  if (t.length > r.length) return altDizi(r, t) ? 'fazla_vurus' : 'karisik';
  return altDizi(t, r) ? 'eksik_vurus' : 'karisik';
}

// ---- Hizalama (DP) ----------------------------------------------------------
// Operasyonlar: MATCH(1-1), MERGE(1 yazılan↔2 referans=birleştirme),
// SPLIT(k yazılan↔1 referans=bölme), SKIP(atlanan referans), INSERT(fazladan yazılan).
const OP = { MATCH: 'match', MERGE: 'merge', SPLIT: 'split', SKIP: 'skip', INSERT: 'insert' };
const MAX_SPLIT = 4; // en fazla 4 parçaya bölme (ör. "bir leşş tir me")

function benzer(a, b) {
  // Hizalamanın alakasız kelimeleri birleştir/bölmesini engelleyen eşik.
  const d = lev(a, b);
  return d <= Math.max(1, Math.floor(Math.max(a.length, b.length) / 3));
}

function hizala(T, R) {
  const n = T.length, m = R.length;
  const INF = Infinity;
  // dp[i][j] = T[0..i) ile R[0..j) hizalamasının min maliyeti
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
  const geri = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
  dp[0][0] = 0;

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const cur = dp[i][j];
      if (cur === INF) continue;

      // SKIP: referanstaki R[j] yazılmamış (atlanan). Hata değil ama maliyet ~1
      // (aksi halde hizalama gerçek eşleşmeleri atlamaya kaçar).
      if (j < m && cur + 0.95 < dp[i][j + 1]) {
        dp[i][j + 1] = cur + 0.95;
        geri[i][j + 1] = { op: OP.SKIP, i, j };
      }
      // INSERT: T[i] fazladan yazılmış, referansta karşılığı yok (karışık hata=1)
      if (i < n && cur + 1.5 < dp[i + 1][j]) {
        dp[i + 1][j] = cur + 1.5;
        geri[i + 1][j] = { op: OP.INSERT, i, j };
      }
      // MATCH 1-1
      if (i < n && j < m) {
        const t = T[i], r = R[j];
        const c = t === r ? 0 : 1;
        if (cur + c < dp[i + 1][j + 1]) {
          dp[i + 1][j + 1] = cur + c;
          geri[i + 1][j + 1] = { op: OP.MATCH, i, j, hata: c };
        }
      }
      // MERGE 1 yazılan ↔ 2 referans (kelime birleştirme = 1 hata)
      if (i < n && j + 1 < m) {
        const t = T[i], birlesik = R[j] + R[j + 1];
        if (benzer(t, birlesik)) {
          const c = 1; // birleştirme her durumda 1 hata
          if (cur + c < dp[i + 1][j + 2]) {
            dp[i + 1][j + 2] = cur + c;
            geri[i + 1][j + 2] = { op: OP.MERGE, i, j };
          }
        }
      }
      // SPLIT k yazılan ↔ 1 referans (kelime bölme)
      if (j < m) {
        const r = R[j];
        for (let k = 2; k <= MAX_SPLIT && i + k <= n; k++) {
          const parcalar = T.slice(i, i + k);
          const birlesik = parcalar.join('');
          if (!benzer(birlesik, r)) continue;
          // doğru yazılıp bölünmüş => 1 hata; yanlış yazılıp bölünmüş => her parça 1 hata
          const c = birlesik === r ? 1 : k;
          if (cur + c < dp[i + k][j + 1]) {
            dp[i + k][j + 1] = cur + c;
            geri[i + k][j + 1] = { op: OP.SPLIT, i, j, k, dogruBolme: birlesik === r };
          }
        }
      }
    }
  }

  // Bitiş noktası: tüm yazılan kelimeler tüketildikten sonra (i = n), referansın
  // HANGİ konumunda durduğumuzu en düşük maliyetle seçeriz. Bu konumdan sonrası
  // "ulaşılamayan kuyruk"tur (adayın süresi yetmedi) — yola hiç girmez, atlanan sayılmaz.
  let jSon = 0, enAz = Infinity;
  for (let jj = 0; jj <= m; jj++) {
    if (dp[n][jj] < enAz) { enAz = dp[n][jj]; jSon = jj; }
  }

  // Geri izleme
  const ops = [];
  let i = n, j = jSon;
  while (i > 0 || j > 0) {
    const b = geri[i][j];
    if (!b) break; // güvenlik
    ops.push(b);
    if (b.op === OP.SKIP) { j = b.j; }
    else if (b.op === OP.INSERT) { i = b.i; }
    else if (b.op === OP.MATCH) { i = b.i; j = b.j; }
    else if (b.op === OP.MERGE) { i = b.i; j = b.j; }
    else if (b.op === OP.SPLIT) { i = b.i; j = b.j; }
  }
  ops.reverse();
  return ops;
}

// ---- Ana değerlendirme ------------------------------------------------------
// referansMetin: verilen metin (küçük harf, noktalamasız)
// yazilanMetin : adayın yazdığı ham metin
// secenek.kesildi: süre bitiminde yazım kesildiyse true (eksik son kelime kuralı için)
function degerlendir(referansMetin, yazilanMetin, secenek = {}) {
  const ayar = { ...VARSAYILAN_AYAR, ...(secenek.ayar || {}) };
  const R = splitWords(referansMetin);
  const { tokens: T, fazlaBosluk } = tokenizeTyped(yazilanMetin);

  const ops = hizala(T, R);

  let dogruKelime = 0;
  let hataliKelime = 0;
  let atlananKelime = 0;
  const hataListesi = []; // { yazilan, dogrusu, tur }

  // Not: Hizalama, adayın ulaştığı referans önekinde biter; ulaşılamayan kuyruk yola
  // hiç girmez. Bu yüzden buradaki tüm SKIP'ler gerçek (metin içinde geçilen) atlamalardır.
  let ulasilanReferans = 0; // adayın metinde ilerlediği referans kelime sayısı
  for (const o of ops) {
    if (o.op === OP.MATCH) {
      const t = T[o.i], r = R[o.j];
      if (o.hata === 0) dogruKelime++;
      else { hataliKelime++; hataListesi.push({ yazilan: t, dogrusu: r, tur: hataTuru(t, r) }); }
      ulasilanReferans++;
    } else if (o.op === OP.MERGE) {
      hataliKelime++;
      hataListesi.push({ yazilan: T[o.i], dogrusu: R[o.j] + ' ' + R[o.j + 1], tur: 'kelime_birlestirme' });
      ulasilanReferans += 2;
    } else if (o.op === OP.SPLIT) {
      const parcalar = T.slice(o.i, o.i + o.k);
      const adet = o.dogruBolme ? 1 : o.k;
      hataliKelime += adet;
      hataListesi.push({ yazilan: parcalar.join(' '), dogrusu: R[o.j], tur: 'kelime_bolme', hataAdedi: adet });
      ulasilanReferans++;
    } else if (o.op === OP.SKIP) {
      atlananKelime++;
      ulasilanReferans++;
    } else if (o.op === OP.INSERT) {
      hataliKelime++;
      hataListesi.push({ yazilan: T[o.i], dogrusu: '', tur: 'karisik' });
    }
  }

  // Eksik son kelime: süre kesildiyse ve son yazılan token, karşılık geldiği referans
  // kelimenin ön eki ise => hata sayma, doğru da sayma; bilgi olarak tut.
  let eksikSonKelime = null;
  if (secenek.kesildi && ops.length) {
    const son = ops[ops.length - 1];
    if (son.op === OP.MATCH && son.hata === 1) {
      const t = T[son.i], r = R[son.j];
      if (r.startsWith(t) && t.length < r.length) {
        // son hatayı geri al, eksik son kelime olarak işaretle
        hataliKelime--;
        if (hataListesi.length) hataListesi.pop();
        eksikSonKelime = { yazilan: t, dogrusu: r };
      }
    }
  }

  // Fazla boşluk hataları hatalı kelimeye eklenir (net'ten düşülür).
  hataliKelime += fazlaBosluk;

  const toplamYazilan = T.length; // adayın ürettiği kelime (token) sayısı
  const netKelime = Math.max(0, dogruKelime - fazlaBosluk); // net = doğru - fazla boşluk
  const hataOrani = toplamYazilan > 0 ? hataliKelime / toplamYazilan : 0;

  // Geçersizlik kapıları
  const atlamaKapisi = atlananKelime >= ayar.atlananSiniri;
  const oranKapisi = hataOrani > ayar.hataOraniSiniri;
  const hedefKapisi = ayar.netKelimeHedefi != null && netKelime < ayar.netKelimeHedefi;
  const basarili = !atlamaKapisi && !oranKapisi && !hedefKapisi;

  return {
    dogruKelime,
    hataliKelime,
    netKelime,
    atlananKelime,
    eksikSonKelime,
    fazlaBosluk,
    toplamYazilan,
    toplamReferans: R.length,
    ulasilanReferans,
    hataOrani,
    hataOraniYuzde: Math.round(hataOrani * 1000) / 10,
    basarili,
    basarisizlikNedeni: atlamaKapisi ? 'atlanan_kelime'
      : oranKapisi ? 'hata_orani'
      : hedefKapisi ? 'net_kelime_hedefi' : null,
    hataListesi,
  };
}

// Node (test) uyumluluğu — tarayıcıda `module` tanımsız olduğu için atlanır.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { degerlendir, splitWords, tokenizeTyped, trLower, hataTuru, VARSAYILAN_AYAR };
}
