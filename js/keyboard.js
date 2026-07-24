// keyboard.js — İnteraktif Türkçe Q/F klavye (parmak bölgeleri + canlı tuş vurgusu)
// Her fiziksel tuş, dokunma yöntemine göre bir parmağa atanır. event.code fiziksel
// konumu verdiği için Q veya F seçili olması fark etmez; basılan tuş doğru yanar.

// Parmak kodları ve renkleri
const PARMAKLAR = {
  ssol: { ad: 'Sol serçe',  renk: '#6b8cae' },
  ysol: { ad: 'Sol yüzük',  renk: '#5fa8a0' },
  osol: { ad: 'Sol orta',   renk: '#86b06a' },
  isol: { ad: 'Sol işaret', renk: '#c9a94e' },
  isag: { ad: 'Sağ işaret', renk: '#d08a5a' },
  osag: { ad: 'Sağ orta',   renk: '#cf7b6b' },
  ysag: { ad: 'Sağ yüzük',  renk: '#b06a9e' },
  ssag: { ad: 'Sağ serçe',  renk: '#8a72c0' },
  bas:  { ad: 'Baş parmak', renk: '#9aa4b2' },
};

// Her tuş: [code, qHarf, fHarf, parmak]
const SIRALAR = [
  [
    ['KeyQ','q','f','ssol'], ['KeyW','w','g','ysol'], ['KeyE','e','ğ','osol'],
    ['KeyR','r','ı','isol'], ['KeyT','t','o','isol'], ['KeyY','y','d','isag'],
    ['KeyU','u','r','isag'], ['KeyI','ı','n','osag'], ['KeyO','o','h','ysag'],
    ['KeyP','p','p','ssag'], ['BracketLeft','ğ','q','ssag'], ['BracketRight','ü','w','ssag'],
  ],
  [
    ['KeyA','a','u','ssol'], ['KeyS','s','i','ysol'], ['KeyD','d','e','osol'],
    ['KeyF','f','a','isol'], ['KeyG','g','ü','isol'], ['KeyH','h','t','isag'],
    ['KeyJ','j','k','isag'], ['KeyK','k','m','osag'], ['KeyL','l','l','ysag'],
    ['Semicolon','ş','y','ssag'], ['Quote','i','ş','ssag'],
  ],
  [
    ['KeyZ','z','j','ssol'], ['KeyX','x','ö','ysol'], ['KeyC','c','v','osol'],
    ['KeyV','v','c','isol'], ['KeyB','b','ç','isol'], ['KeyN','n','z','isag'],
    ['KeyM','m','s','isag'], ['Comma','ö','b','osag'], ['Period','ç','.','ysag'],
    ['Slash','.',',','ssag'],
  ],
];

// Home row (parmakların dinlendiği tuşlar) — kılavuz çıkıntısı için
const DINLENME = { q: ['KeyA','KeyS','KeyD','KeyF','KeyJ','KeyK','KeyL','Semicolon'],
                   f: ['KeyA','KeyS','KeyD','KeyF','KeyJ','KeyK','KeyL','Semicolon'] };

function klavyeCiz(kapsayici, duzen = 'q') {
  kapsayici.innerHTML = '';
  kapsayici.dataset.duzen = duzen;
  SIRALAR.forEach((sira, si) => {
    const satir = document.createElement('div');
    satir.className = 'kb-sira kb-sira-' + si;
    sira.forEach(([code, q, f, parmak]) => {
      const harf = duzen === 'f' ? f : q;
      const tus = document.createElement('div');
      tus.className = 'kb-tus';
      tus.dataset.code = code;
      tus.style.setProperty('--pf', PARMAKLAR[parmak].renk);
      if (DINLENME[duzen].includes(code)) tus.classList.add('kb-dinlenme');
      tus.textContent = harf;
      satir.appendChild(tus);
    });
    kapsayici.appendChild(satir);
  });
  // Boşluk çubuğu
  const bosSatir = document.createElement('div');
  bosSatir.className = 'kb-sira kb-sira-bos';
  const bos = document.createElement('div');
  bos.className = 'kb-tus kb-bosluk';
  bos.dataset.code = 'Space';
  bos.style.setProperty('--pf', PARMAKLAR.bas.renk);
  bos.textContent = 'boşluk';
  bosSatir.appendChild(bos);
  kapsayici.appendChild(bosSatir);
}

// Canlı vurgu: fiziksel tuşa basınca ekranda yak
function canliVurgu(kapsayici) {
  const yak = (code, on) => {
    const t = kapsayici.querySelector(`.kb-tus[data-code="${CSS.escape(code)}"]`);
    if (t) t.classList.toggle('kb-aktif', on);
  };
  window.addEventListener('keydown', (e) => yak(e.code, true));
  window.addEventListener('keyup', (e) => yak(e.code, false));
}
