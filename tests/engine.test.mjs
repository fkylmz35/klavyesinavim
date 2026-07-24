// Puanlama motoru testleri — resmi PGM örnekleriyle doğrulama.
// Çalıştır:  node tests/engine.test.mjs
import { degerlendir, tokenizeTyped } from '../js/engine.js';

let gecti = 0, kaldi = 0;
function esit(ad, bulunan, beklenen) {
  const ok = JSON.stringify(bulunan) === JSON.stringify(beklenen);
  if (ok) { gecti++; console.log(`  ✓ ${ad}`); }
  else { kaldi++; console.log(`  ✗ ${ad}\n      beklenen: ${JSON.stringify(beklenen)}\n      bulunan : ${JSON.stringify(bulunan)}`); }
}

// Tek kelimelik hata testleri: referans "adalet", çeşitli yazımlar.
function hataAdedi(ref, yazi, secenek) {
  return degerlendir(ref, yazi, secenek).hataliKelime;
}

console.log('\n[Resmî hata türü örnekleri — referans: "adalet"]');
esit('fazla vuruş: adalett = 1', hataAdedi('adalet', 'adalett'), 1);
esit('fazla vuruş: aadalett = 1', hataAdedi('adalet', 'aadalett'), 1);
esit('eksik vuruş: adale = 1', hataAdedi('adalet', 'adale'), 1);
esit('eksik vuruş: adaet = 1', hataAdedi('adalet', 'adaet'), 1);
esit('harf yer değiştirme: adalte = 1', hataAdedi('adalet', 'adalte'), 1);
esit('karakter: .dalet = 1', hataAdedi('adalet', '.dalet'), 1);
esit('karışık: adlemt = 1', hataAdedi('adalet', 'adlemt'), 1);
esit('karışık: adalet. = 1', hataAdedi('adalet', 'adalet.'), 1);
esit('karışık: ada2let = 1', hataAdedi('adalet', 'ada2let'), 1);
esit('doğru: adalet = 0', hataAdedi('adalet', 'adalet'), 0);

console.log('\n[Kelime bölme — referans: "adalet"]');
esit('ad al et (doğru bölme) = 1', hataAdedi('adalet', 'ad al et'), 1);
esit('ada al et (yanlış bölme) = 3', hataAdedi('adalet', 'ada al et'), 3);

console.log('\n[Kelime bölme — referans: "birleştirme"]');
esit('bir leşş tir me = 4', hataAdedi('birleştirme', 'bir leşş tir me'), 4);

console.log('\n[Kelime birleştirme — referans: "adalet bakanlığı"]');
esit('adaletbakanlığı = 1', hataAdedi('adalet bakanlığı', 'adaletbakanlığı'), 1);
esit('adaltebaknlığı = 1', hataAdedi('adalet bakanlığı', 'adaltebaknlığı'), 1);
esit('adaletbaknlığı = 1', hataAdedi('adalet bakanlığı', 'adaletbaknlığı'), 1);

console.log('\n[Fazla boşluk]');
esit('"adalet  bakanlığı" (2 boşluk) = 1', hataAdedi('adalet bakanlığı', 'adalet  bakanlığı'), 1);
esit('iki blok fazla boşluk = 2',
  hataAdedi('adalet bakanlığı personel', 'adalet  bakanlığı   personel'), 2);

console.log('\n[Atlanan kelime — hata sayılmaz]');
{
  const r = degerlendir('adalet bakanlığı personel genel müdürlüğü', 'adalet bakanlığı genel müdürlüğü');
  esit('atlanan = 1', r.atlananKelime, 1);
  esit('atlanan hata değil (hatalı=0)', r.hataliKelime, 0);
}

console.log('\n[Geçersizlik kapısı: 22+ atlanan => başarısız]');
{
  const ref = Array.from({ length: 30 }, (_, i) => 'kelime' + i).join(' ');
  const yazi = ['kelime0', 'kelime1', 'kelime2', 'kelime3'].join(' '); // 26 atlanan
  const r = degerlendir(ref, yazi);
  esit('atlanan >= 22', r.atlananKelime >= 22, true);
  esit('başarısız (atlama kapısı)', r.basarili, false);
  esit('neden = atlanan_kelime', r.basarisizlikNedeni, 'atlanan_kelime');
}

console.log('\n[Geçersizlik kapısı: hata oranı > %25 => başarısız]');
{
  // 4 kelime yaz, 2 yanlış => %50 > %25
  const r = degerlendir('bir iki üç dört', 'bir iki üçx dörtx');
  esit('hata oranı > %25 => başarısız', r.basarili, false);
  esit('neden = hata_orani', r.basarisizlikNedeni, 'hata_orani');
}

console.log('\n[Eksik son kelime — kesildi=true]');
{
  const r = degerlendir('adalet bakanlığı personel', 'adalet bakanlığı perso', { kesildi: true });
  esit('eksik son kelime tespit edildi', !!r.eksikSonKelime, true);
  esit('eksik son kelime hata sayılmadı', r.hataliKelime, 0);
}

console.log('\n[Temiz cümle — hepsi doğru]');
{
  const c = 'zabıt katibi uygulamalı sınav değerlendirme kriterleri';
  const r = degerlendir(c, c);
  esit('hatasız cümle: hatalı=0', r.hataliKelime, 0);
  esit('hatasız cümle: doğru=6', r.dogruKelime, 6);
  esit('hatasız cümle: net=6', r.netKelime, 6);
  esit('hatasız cümle: başarılı', r.basarili, true);
}

console.log('\n[tokenizeTyped fazla boşluk sayımı]');
esit('tek fazla boşluk bloğu = 1', tokenizeTyped('a  b').fazlaBosluk, 1);
esit('üçlü boşluk yine 1 blok', tokenizeTyped('a   b').fazlaBosluk, 1);
esit('iki ayrı blok = 2', tokenizeTyped('a  b  c').fazlaBosluk, 2);

console.log(`\n==== SONUÇ: ${gecti} geçti, ${kaldi} kaldı ====\n`);
process.exit(kaldi === 0 ? 0 : 1);
