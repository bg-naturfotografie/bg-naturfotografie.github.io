/* ============================================================
   ZUSATZ-KNÖPFE im Admin-Bereich (unten links, über dem
   Übersetzungs-Hinweis)
   ============================================================
     📋 Bestand & Nummern      → admin/uebersicht.html
     📖 3 ohne Geschichte      → admin/uebersicht.html#geschichten

   Die Zahl „ohne Geschichte“ zählt Motive, die im Shop als Druck
   vorrätig sind (Lesezeichen, Postkarte, Klappkarte oder Poster mit
   Stückzahl über 0), aber noch keine Geschichte haben.
   Gelesen wird der Stand der Webseite (nach dem Speichern 1–2
   Minuten Verzögerung). Dieses Skript ändert nichts.
   ============================================================ */
(function () {
  'use strict';
  var ARTEN = ['lesezeichen', 'postkarte', 'klappkarte', 'poster'];

  var stil = document.createElement('style');
  stil.textContent =
    '#bg-zusatz{position:fixed;left:14px;bottom:58px;z-index:2147483000;display:flex;flex-direction:column;gap:6px;align-items:flex-start;' +
    'font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;}' +
    '#bg-zusatz a{display:inline-block;border-radius:999px;padding:7px 13px;box-shadow:0 2px 8px rgba(0,0,0,.25);' +
    'font-weight:600;text-decoration:none;background:#2f4a2a;color:#fff;}' +
    '#bg-zusatz a.warn{background:#C97C3D;}' +
    '#bg-zusatz a:hover{filter:brightness(1.1);}';
  document.head.appendChild(stil);

  var box = document.createElement('div');
  box.id = 'bg-zusatz';
  box.innerHTML = '<a href="uebersicht.html#bestand">📋 Bestand &amp; Nummern</a>' +
    '<a href="uebersicht.html#geschichten" class="geschichten">📖 Geschichten prüfen …</a>';
  var link = box.querySelector('.geschichten');

  function zaehlen() {
    Promise.all(['motive', 'geschichten'].map(function (d) {
      return fetch('../daten/' + d + '.json', { cache: 'no-cache' }).then(function (r) { return r.json(); });
    })).then(function (r) {
      var mitText = {};
      (r[1].geschichten || []).forEach(function (g) {
        if (g && g.id && g.geschichte && String(g.geschichte.de || '').trim()) mitText[g.id] = true;
      });
      var n = (r[0].motive || []).filter(function (m) {
        if (m.versteckt === true || m.imShop === false || mitText[m.id]) return false;
        return ARTEN.some(function (a) { var o = m[a] || {}; return o.vorraetig === true && Number(o.bestand) > 0; });
      }).length;
      link.className = 'geschichten' + (n ? ' warn' : '');
      link.textContent = n ? '📖 ' + n + (n === 1 ? ' Shop-Foto' : ' Shop-Fotos') + ' ohne Geschichte' : '📖 Alle Shop-Fotos haben eine Geschichte';
    }).catch(function () { link.textContent = '📖 Fotos ohne Geschichte'; });
  }

  function start() {
    document.body.appendChild(box);
    zaehlen();
    setInterval(zaehlen, 120000);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
