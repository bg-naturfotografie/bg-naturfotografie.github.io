/* ============================================================
   ÜBERSETZUNGS-WÄCHTER für den Admin-Bereich
   ============================================================
   Zeigt unten links im Admin-Bereich einen kleinen Hinweis:

     ⚠ 3 Übersetzungen fehlen     → anklicken = Liste, was fehlt
     ✓ Englisch vollständig       → alles da

   Geprüft wird jedes Feld, das eine deutsche und eine englische
   Fassung hat: Steht Deutsch drin, aber English ist leer, fehlt
   die Übersetzung. (Auf der englischen Webseite steht bis dahin
   automatisch der deutsche Text — es geht also nichts kaputt.)

   WOHER DIE DATEN KOMMEN
   Gelesen werden die Dateien in daten/, so wie sie gerade auf der
   Webseite liegen. Nach dem Speichern dauert es 1–2 Minuten, bis
   GitHub die Seite neu veröffentlicht hat — so lange kann der
   Hinweis noch den alten Stand zeigen. Er prüft jede Minute neu;
   mit „Neu prüfen“ geht es sofort.

   Dieses Skript ändert nichts an deinen Daten, es liest nur.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Die Dateien und unter welchem Namen sie im Admin-Bereich stehen ---- */
  var DATEIEN = [
    { datei: 'termine',     titel: 'Termine' },
    { datei: 'motive',      titel: 'Motive & Serien' },
    { datei: 'geschichten', titel: 'Geschichten' },
    { datei: 'shop',        titel: 'Shop: Preise & Versand' },
    { datei: 'texte',       titel: 'Seitentexte' }
  ];

  /* ---- Lesbare Namen für die Felder (wie im Admin-Formular) ---- */
  var FELDNAMEN = {
    // Termine
    titel: 'Name des Markts', hinweis: 'Hinweis / Zusatzinfo', keinTermin: 'Text, wenn kein Termin ansteht',
    // Motive & Serien
    art: 'Tierart / Titel', zusatz: 'Zusatz hinter dem Punkt', alt: 'Bildbeschreibung (Alt-Text)',
    label: 'Ortsname', name: 'Anzeigename', titelStartseite: 'Überschrift auf der Startseite', kurz: 'Kurzbeschreibung',
    // Geschichten
    geschichte: 'Die Geschichte', ort: 'Ort', tier: 'Artname', gefaehrdung: 'Gefährdung', text: 'Bildunterschrift',
    // Shop
    abholungHinweis: 'Hinweis bei Abholung', motiv: 'Name',
    // Seitentexte
    eyebrow: 'Kleine Zeile über der Überschrift', titel1: 'Überschrift, Teil 1', titel2: 'Überschrift, Teil 2',
    gruss: 'Begrüßung', bandTitel: 'Geschichten-Band: Überschrift', bandText: 'Geschichten-Band: Text',
    ueberTitel: 'Über mich: Überschrift', ueberLead: 'Über mich: erster Satz', ueberText: 'Über mich: Text',
    wieIchFotografiere: 'Wie ich fotografiere', karteHinweis: 'Hinweis zur Karte', schwerpunkte: 'Schwerpunkte & Orte',
    termineTitel: 'Termine: Überschrift', kontaktTitel: 'Kontakt: Überschrift', kontaktText: 'Kontakt: Text',
    intro: 'Einleitung', startseite: 'Startseite', shop: 'Shop', geschichten: 'Geschichten-Übersicht',
    klein: 'Kleine Versandstufe', mittel: 'Mittlere Versandstufe', gross: 'Große Versandstufe', versand: 'Versand',
    termine: 'Termin', motive: 'Motiv', serien: 'Serie', zusatzbilder: 'Zusatzbild', sticker: 'Sticker'
  };

  /* Wie ein Listeneintrag in der Liste heißen soll (Motiv-ID, Datum …) */
  function eintragName(listenName, eintrag, nummer) {
    if (!eintrag || typeof eintrag !== 'object') return '#' + nummer;
    if (listenName === 'termine') return (eintrag.datum || '') + ' ' + ((eintrag.titel && eintrag.titel.de) || '');
    if (listenName === 'serien') return (eintrag.name && eintrag.name.de) || eintrag.id || '#' + nummer;
    if (eintrag.id) return eintrag.id;
    return (FELDNAMEN[listenName] || 'Eintrag') + ' ' + nummer;
  }

  function istSprachfeld(wert) {
    return wert && typeof wert === 'object' && !Array.isArray(wert) &&
      typeof wert.de === 'string' && Object.keys(wert).every(function (k) { return k === 'de' || k === 'en'; });
  }

  /* Geht die Daten durch und sammelt alle Felder mit Deutsch, aber ohne Englisch */
  function suche(knoten, pfad, ergebnis) {
    if (Array.isArray(knoten)) {
      var listenName = pfad.length ? pfad[pfad.length - 1].schluessel : '';
      knoten.forEach(function (eintrag, i) {
        // Listenname durch den Namen des Eintrags ersetzen ("Motiv" → "gartenleben26")
        var neuerPfad = pfad.slice(0, -1).concat([{ schluessel: listenName, anzeige: eintragName(listenName, eintrag, i + 1) }]);
        suche(eintrag, neuerPfad, ergebnis);
      });
    } else if (istSprachfeld(knoten)) {
      var de = (knoten.de || '').trim();
      var en = (knoten.en || '').trim();
      if (de && !en) ergebnis.push({ pfad: pfad.map(function (p) { return p.anzeige; }), de: de });
    } else if (knoten && typeof knoten === 'object') {
      if (knoten.versteckt === true) return;   // ausgeblendete Motive sind nicht auf der Seite
      Object.keys(knoten).forEach(function (k) {
        suche(knoten[k], pfad.concat([{ schluessel: k, anzeige: FELDNAMEN[k] || k }]), ergebnis);
      });
    }
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* ---- Aussehen: bewusst eigenständig, damit es mit dem Admin-Programm nicht kollidiert ---- */
  var stil = document.createElement('style');
  stil.textContent = [
    '#bg-uebers{position:fixed;left:14px;bottom:14px;z-index:2147483000;font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;}',
    '#bg-uebers .knopf{border:0;border-radius:999px;padding:7px 13px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);font:inherit;font-weight:600;}',
    '#bg-uebers .knopf.warn{background:#C97C3D;color:#fff;}',
    '#bg-uebers .knopf.ok{background:#2f6b3a;color:#fff;opacity:.85;}',
    '#bg-uebers .knopf.leise{background:#666;color:#fff;opacity:.8;}',
    '#bg-uebers .tafel{position:absolute;left:0;bottom:44px;width:min(440px,calc(100vw - 28px));max-height:60vh;overflow:auto;',
    'background:#fff;color:#222;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.3);padding:14px 16px;}',
    '#bg-uebers .tafel[hidden]{display:none;}',
    '#bg-uebers h3{margin:0 0 4px;font-size:15px;}',
    '#bg-uebers p.info{margin:0 0 10px;color:#555;font-size:12px;}',
    '#bg-uebers h4{margin:12px 0 4px;font-size:13px;display:flex;justify-content:space-between;gap:8px;}',
    '#bg-uebers h4 a{font-weight:500;color:#9a5a24;text-decoration:none;white-space:nowrap;}',
    '#bg-uebers ul{margin:0;padding-left:18px;}',
    '#bg-uebers li{margin:3px 0;}',
    '#bg-uebers li small{display:block;color:#777;}',
    '#bg-uebers .leiste{display:flex;gap:8px;margin-top:12px;}',
    '#bg-uebers .leiste button{border:1px solid #ccc;background:#f6f6f6;border-radius:6px;padding:4px 10px;cursor:pointer;font:inherit;}'
  ].join('');
  document.head.appendChild(stil);

  var box = document.createElement('div');
  box.id = 'bg-uebers';
  box.innerHTML = '<div class="tafel" hidden></div><button class="knopf leise" type="button">Übersetzungen werden geprüft …</button>';
  var knopf = box.querySelector('.knopf');
  var tafel = box.querySelector('.tafel');
  knopf.addEventListener('click', function () { tafel.hidden = !tafel.hidden; });

  function zeige(gruppen, anzahl, fehler) {
    if (fehler) {
      knopf.className = 'knopf leise';
      knopf.textContent = 'Übersetzungs-Prüfung gerade nicht möglich';
    } else if (anzahl === 0) {
      knopf.className = 'knopf ok';
      knopf.textContent = '✓ Englisch vollständig';
    } else {
      knopf.className = 'knopf warn';
      knopf.textContent = '⚠ ' + anzahl + (anzahl === 1 ? ' Übersetzung fehlt' : ' Übersetzungen fehlen');
    }

    var html = '<h3>' + (anzahl ? 'Hier fehlt noch das Englisch' : 'Alles übersetzt') + '</h3>' +
      '<p class="info">Bis du es einträgst, steht auf der englischen Seite der deutsche Text. ' +
      'Neu Gespeichertes erscheint hier nach 1–2 Minuten.</p>';
    gruppen.forEach(function (g) {
      if (!g.liste.length) return;
      html += '<h4><span>' + esc(g.titel) + ' (' + g.liste.length + ')</span>' +
        '<a href="#/collections/_singletons/entries/' + g.datei + '">bearbeiten →</a></h4><ul>' +
        g.liste.map(function (e) {
          var vorschau = e.de.length > 70 ? e.de.slice(0, 70) + ' …' : e.de;
          return '<li>' + esc(e.pfad.join(' › ')) + '<small>„' + esc(vorschau) + '“</small></li>';
        }).join('') + '</ul>';
    });
    html += '<div class="leiste"><button type="button" data-aktion="neu">Neu prüfen</button>' +
      '<button type="button" data-aktion="zu">Schließen</button></div>';
    tafel.innerHTML = html;
    tafel.querySelector('[data-aktion="neu"]').addEventListener('click', pruefen);
    tafel.querySelector('[data-aktion="zu"]').addEventListener('click', function () { tafel.hidden = true; });
    // Beim Klick auf "bearbeiten" die Liste schließen, damit das Formular frei ist
    tafel.querySelectorAll('h4 a').forEach(function (a) {
      a.addEventListener('click', function () { tafel.hidden = true; });
    });
  }

  function pruefen() {
    Promise.all(DATEIEN.map(function (d) {
      // cache: 'no-cache' = immer den aktuellen Stand der Webseite holen
      return fetch('../daten/' + d.datei + '.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(d.datei); return r.json(); })
        .then(function (json) {
          var liste = [];
          suche(json, [], liste);
          return { datei: d.datei, titel: d.titel, liste: liste };
        });
    })).then(function (gruppen) {
      var anzahl = gruppen.reduce(function (n, g) { return n + g.liste.length; }, 0);
      zeige(gruppen, anzahl, false);
    }).catch(function () {
      zeige([], 0, true);
    });
  }

  function start() {
    document.body.appendChild(box);
    pruefen();
    setInterval(pruefen, 60000);   // jede Minute neu prüfen
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
