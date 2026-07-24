// init-tuyolar.js — Tüyolar sayfası başlatma (keyboard.js'ten sonra yüklenir).
(function () {
  function baslat() {
    const klavye = document.getElementById('klavye');
    if (!klavye) return;
    const ipucu = document.getElementById('kbIpucu');
    let duzen = 'q';

    function ipucuMetni(d) {
      return d === 'f'
        ? 'F klavye: resmî ve uzun vadede daha hızlı kabul edilir; öğrenmesi emek ister.'
        : 'Q klavye: en yaygın düzen; çoğu aday bununla çalışır.';
    }
    function ciz() { klavyeCiz(klavye, duzen); ipucu.textContent = ipucuMetni(duzen); }

    const lejant = document.getElementById('parmakLejant');
    lejant.textContent = '';
    Object.values(PARMAKLAR).forEach(p => {
      const s = document.createElement('span'); s.className = 'lej';
      const i = document.createElement('i'); i.style.background = p.renk;
      s.append(i, document.createTextNode(p.ad));
      lejant.appendChild(s);
    });

    document.querySelectorAll('.kb-btn').forEach(b =>
      b.addEventListener('click', () => {
        document.querySelectorAll('.kb-btn').forEach(x => x.classList.remove('aktif'));
        b.classList.add('aktif'); duzen = b.dataset.duzen; ciz();
      }));

    ciz();
    canliVurgu(klavye);
  }
  if (document.readyState !== 'loading') baslat();
  else document.addEventListener('DOMContentLoaded', baslat);
})();
