// storage.js — localStorage sarmalayıcı (deneme geçmişi + ayarlar)
const GECMIS_ANAHTAR = 'kks_gecmis_v1';
const AYAR_ANAHTAR = 'kks_ayarlar_v1';

const varsayilanAyarlar = {
  klavye: 'q',            // 'f' | 'q'
  tema: 'acik',           // 'acik' | 'koyu'
  renklendirme: false,    // gerçek sınav modunda kapalı
  ses: true,
  yapistirmaEngeli: true,
};

function ayarlariOku() {
  try {
    const ham = localStorage.getItem(AYAR_ANAHTAR);
    return ham ? { ...varsayilanAyarlar, ...JSON.parse(ham) } : { ...varsayilanAyarlar };
  } catch { return { ...varsayilanAyarlar }; }
}

function ayarlariYaz(ayarlar) {
  try { localStorage.setItem(AYAR_ANAHTAR, JSON.stringify(ayarlar)); } catch {}
}

// Deneme kaydını güvenli/temiz biçime getir: sayısal alanlar Number'a zorlanır,
// metinler kısaltılır. Kurcalanmış localStorage verisinin arayüze sızmasını önler.
function sayi(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function kayitTemizle(k) {
  if (!k || typeof k !== 'object') return null;
  return {
    tarih: typeof k.tarih === 'string' ? k.tarih.slice(0, 40) : '',
    metinId: typeof k.metinId === 'string' ? k.metinId.slice(0, 60) : '',
    sure: sayi(k.sure), net: sayi(k.net), dogru: sayi(k.dogru), hatali: sayi(k.hatali),
    atlanan: sayi(k.atlanan), oran: sayi(k.oran), kpm: sayi(k.kpm), basarili: !!k.basarili,
  };
}

function gecmisOku() {
  try {
    const ham = localStorage.getItem(GECMIS_ANAHTAR);
    const dizi = ham ? JSON.parse(ham) : [];
    return Array.isArray(dizi) ? dizi.map(kayitTemizle).filter(Boolean) : [];
  } catch { return []; }
}

function denemeEkle(kayit) {
  const gecmis = gecmisOku();
  gecmis.push(kayit);
  // Son 200 denemeyi tut
  const kirpik = gecmis.slice(-200);
  try { localStorage.setItem(GECMIS_ANAHTAR, JSON.stringify(kirpik)); } catch {}
  return kirpik;
}

function gecmisiTemizle() {
  try { localStorage.removeItem(GECMIS_ANAHTAR); } catch {}
}
