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

function gecmisOku() {
  try {
    const ham = localStorage.getItem(GECMIS_ANAHTAR);
    return ham ? JSON.parse(ham) : [];
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
