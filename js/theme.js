// theme.js — Açık/Koyu tema. <head>'de erken yüklenir; FOUC olmadan uygular.
(function () {
  var KEY = 'kks_tema';
  function oku() { try { return localStorage.getItem(KEY) || 'acik'; } catch (e) { return 'acik'; } }
  function uygula(t) { document.documentElement.setAttribute('data-tema', t); }
  var tema = oku();
  uygula(tema);

  function guncelleBtn() {
    var b = document.getElementById('temaBtn');
    if (!b) return;
    b.textContent = tema === 'koyu' ? '☀' : '☾';
    b.setAttribute('aria-label', tema === 'koyu' ? 'Açık temaya geç' : 'Koyu temaya geç');
  }
  function degistir() {
    tema = tema === 'koyu' ? 'acik' : 'koyu';
    uygula(tema);
    try { localStorage.setItem(KEY, tema); } catch (e) {}
    guncelleBtn();
  }
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('temaBtn');
    if (b) b.addEventListener('click', degistir);
    guncelleBtn();
  });
})();
