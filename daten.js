/* ============================================================
   DATEN LADEN — die Brücke zwischen daten/*.json und den Seiten
   ============================================================

   Früher standen alle Inhalte direkt in JavaScript-Dateien
   (galerie-daten.js, produkte-daten.js, startseite-bilder.js) und
   im HTML (Termine). Die konnte nur bearbeiten, wer Code anfasst.

   Jetzt liegen alle Inhalte als JSON-Dateien im Ordner daten/:

     daten/motive.json       Serien + alle Fotos (inkl. Lagerbestand, Ort)
     daten/geschichten.json  Geschichten zu den Fotos (ersetzt die Google-Tabelle)
     daten/termine.json      Markttermine
     daten/startseite.json   Bühnenbilder oben auf der Startseite
     daten/shop.json         Preise, Staffeln, Versand, Druckpartner
     daten/texte.json        Seitentexte (Begrüßung, Über mich, …)

   Diese Dateien bearbeitest du bequem im Admin-Bereich
   (bg-naturfotografie.de/admin/) — der speichert sie direkt hier
   ins GitHub-Repo.

   Diese Datei hier lädt die JSON-Dateien, wählt die richtige
   Sprache (Deutsch/Englisch, siehe sprache.js) und stellt die
   Daten unter den ALTEN Namen bereit (GALERIE_BILDER, STAFFEL,
   VERSAND, …). Dadurch funktionieren Shop, Karte, Galerie und
   Geschichten ohne große Umbauten weiter.

   SO BENUTZT EINE SEITE DIESE DATEI
   ------------------------------------------------------------
     <script src="sprache.js"></script>                  (im <head>)
     <script src="daten.js" data-brauche="motive shop" defer></script>
     <script src="seiten-skript.js" defer></script>

   data-brauche listet, welche Dateien die Seite braucht
   (texte.json wird immer geladen). Im Seiten-Skript dann:

     BG.bereit(function () {
       // hier sind GALERIE_BILDER, STAFFEL usw. garantiert da
     });
   ============================================================ */
(function (global) {
  'use strict';

  var BG = global.BG = global.BG || {};

  /* Sprache: sprache.js setzt BG.sprache schon im <head>.
     Fehlt sprache.js (z. B. interne Werkzeugseiten), gilt Deutsch. */
  var LANG = BG.sprache || 'de';

  /* ------------------------------------------------------------
     KLEINE HELFER (auch für andere Skripte nutzbar)
     ------------------------------------------------------------ */

  /* Wählt aus einem {de, en}-Objekt die aktuelle Sprache.
     Ist das englische Feld leer, wird automatisch Deutsch genommen —
     so bleibt nichts leer, wenn du eine Übersetzung mal vergisst.
     Ein einfacher Text (kein Objekt) wird unverändert zurückgegeben. */
  function tx(wert) {
    if (wert === null || wert === undefined) return '';
    if (typeof wert !== 'object') return String(wert);
    var text = wert[LANG];
    if (text === undefined || text === null || String(text).trim() === '') text = wert.de;
    return text === undefined || text === null ? '' : String(text);
  }
  BG.tx = tx;

  /* Für feste Texte direkt im Code: BG.t('Deutsch', 'English') */
  BG.t = function (de, en) { return (LANG === 'en' && en) ? en : de; };

  /* Geldbetrag: Deutsch "2,00 €", Englisch "€2.00".
     kurz = true lässt ",00" weg ("5 €" statt "5,00 €"). */
  BG.euro = function (n, kurz) {
    n = Number(n) || 0;
    var text = (kurz && n % 1 === 0) ? String(n) : n.toFixed(2);
    return LANG === 'en' ? '€' + text : text.replace('.', ',') + ' €';
  };

  /* Kleine Fassung eines Fotos (Vorschaubild, max. 800 px).
       bilder/teichleben/entchen1.jpg → bilder/klein/teichleben/entchen1.jpg
     Die kleinen Fassungen erzeugt GitHub automatisch
     (werkzeuge/vorschaubilder.py). Für Rasteransichten nehmen, in
     denen viele Fotos klein nebeneinanderstehen — immer zusammen mit
     BG.bildFallback (unten), damit beim Fehlen das große Foto kommt. */
  BG.klein = function (pfad) {
    if (!pfad) return pfad;
    var p = String(pfad).replace(/^\//, '');
    if (p.indexOf('bilder/') !== 0 || p.indexOf('bilder/klein/') === 0) return pfad;
    return 'bilder/klein/' + p.slice('bilder/'.length);
  };

  /* Fertiges onerror-Attribut: fehlt die kleine Fassung (z. B. kurz
     nach einem Upload), springt das Bild einmalig aufs große Foto. */
  BG.bildFallback = function (grossesBild) {
    return ' data-full="' + escapeHtml(grossesBild) + '" onerror="this.onerror=null;this.src=this.dataset.full;"';
  };

  /* Dasselbe für Bilder, die per Skript erzeugt werden (z. B. die
     wechselnden Kacheln oben auf der Startseite): kleines Bild laden,
     bei Fehler auf das große ausweichen. */
  BG.kleinLaden = function (img, grossesBild) {
    img.onerror = function () { img.onerror = null; img.src = grossesBild; };
    img.src = BG.klein(grossesBild);
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  BG.escapeHtml = escapeHtml;

  /* ------------------------------------------------------------
     MINI-MARKDOWN für Texte aus dem Admin-Bereich
     ------------------------------------------------------------
     Im Admin-Bereich schreibst du reinen Text. Damit trotzdem
     Hervorhebungen und Links möglich sind, gelten diese Kürzel:

       **fett**              → fett
       *kursiv*              → kursiv
       [Linktext](adresse)   → Link (z. B. [Reduktion](galerie-reduktion.html))
       eine Leerzeile        → neuer Absatz (nur bei mehrzeiligen Feldern)
       ein Zeilenumbruch     → Zeilenumbruch

     Alles andere wird als normaler Text angezeigt — eingetipptes
     HTML wird also NICHT ausgeführt. Das schützt die Seite davor,
     durch einen Tippfehler kaputtzugehen. */
  function md(text, mitAbsaetzen) {
    var sicher = escapeHtml(text || '');
    sicher = sicher
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, linkText, adresse) {
        // Nur sichere Linkziele zulassen (keine javascript:-Adressen)
        if (/^\s*javascript:/i.test(adresse)) return linkText;
        var extern = /^https?:\/\//i.test(adresse);
        return '<a href="' + adresse + '"' + (extern ? ' target="_blank" rel="noopener"' : '') + '>' + linkText + '</a>';
      });
    if (mitAbsaetzen) {
      return sicher.split(/\n\s*\n/).map(function (absatz) {
        return '<p>' + absatz.trim().replace(/\n/g, '<br>') + '</p>';
      }).join('');
    }
    return sicher.replace(/\n/g, '<br>');
  }
  BG.md = md;

  /* ------------------------------------------------------------
     WELCHE DATEIEN BRAUCHT DIESE SEITE?
     ------------------------------------------------------------ */
  var skriptTag = document.currentScript;
  var brauche = ((skriptTag && skriptTag.getAttribute('data-brauche')) || '')
    .split(/\s+/).filter(Boolean);
  if (brauche.indexOf('texte') === -1) brauche.push('texte');

  /* Pfad zum Ordner daten/ — relativ zu dieser Datei, damit es auch
     aus Unterordnern heraus funktioniert. */
  var basis = (skriptTag && skriptTag.src) ? skriptTag.src.replace(/daten\.js(\?.*)?$/, '') : '';

  /* cache: 'no-cache' = der Browser fragt jedes Mal kurz bei GitHub
     nach, ob sich die Datei geändert hat. Ist sie gleich, kommt nur
     eine winzige "unverändert"-Antwort zurück. So sind Änderungen
     aus dem Admin-Bereich sofort sichtbar, sobald GitHub die Seite
     neu veröffentlicht hat (meist nach 1–2 Minuten). */
  function ladeJson(name) {
    return fetch(basis + 'daten/' + name + '.json', { cache: 'no-cache' })
      .then(function (antwort) {
        if (!antwort.ok) throw new Error(name + '.json: ' + antwort.status);
        return antwort.json();
      })
      .catch(function (fehler) {
        // Eine fehlende Datei soll nicht die ganze Seite lahmlegen:
        // Fehler in der Konsole melden und mit leeren Daten weitermachen.
        console.warn('daten.js: ' + fehler.message);
        return null;
      });
  }

  /* ------------------------------------------------------------
     UMWANDLUNG: JSON → die alten globalen Namen
     ------------------------------------------------------------ */

  function motiveUmwandeln(json) {
    json = json || { serien: [], motive: [] };

    /* SERIEN: Reihenfolge, Namen und Beschreibungen der Galerien.
       "id" ist der feste interne Name (z. B. 'Teichleben') und darf
       sich nie ändern — angezeigt wird "name" in der Sprache. */
    global.SERIEN = (json.serien || []).map(function (s) {
      return {
        id: s.id,
        name: tx(s.name) || s.id,
        titelStartseite: tx(s.titelStartseite) || tx(s.name) || s.id,
        kurz: tx(s.kurz),
        // Eigene Seite (z. B. galerie-teichleben.html) oder — für neu
        // angelegte Serien — die allgemeine Seite galerie.html?serie=…
        seite: s.seite || ('galerie.html?serie=' + encodeURIComponent(s.id)),
        startseite: s.startseite || []
      };
    });
    var serienName = {};
    global.SERIEN.forEach(function (s) { serienName[s.id] = s.name; });

    global.GALERIE_BILDER = (json.motive || [])
      // Ein Motiv ohne Bild oder ID wäre kaputt — überspringen
      .filter(function (m) { return m && m.id && m.bild; })
      // Im Admin-Bereich ausgeblendete Motive gar nicht erst anzeigen
      .filter(function (m) { return m.versteckt !== true; })
      .map(function (m) {
        var art = tx(m.art);
        var zusatz = tx(m.zusatz);
        var pk = m.postkarte || {}, po = m.poster || {}, lz = m.lesezeichen || {};

        /* "bestand" darf im Admin-Bereich leer bleiben = Zahl
           unbekannt. Leer kommt als '' oder null an → beides null. */
        function zahl(wert) {
          if (wert === '' || wert === null || wert === undefined) return null;
          var n = Number(wert);
          return isNaN(n) ? null : n;
        }

        var motiv = {
          id: m.id,
          kategorie: m.kategorie,                         // interner Serien-Name (fest)
          kategorieName: serienName[m.kategorie] || m.kategorie, // angezeigter Name
          bild: m.bild,
          alt: tx(m.alt) || art,
          art: art,
          zusatz: zusatz,
          // Die Bildunterschrift baut sich aus Art + Zusatz zusammen,
          // genau wie früher von Hand: "<b>Rotkehlchen</b> · Ast"
          beschriftung: '<b>' + escapeHtml(art) + '</b>' + (zusatz ? ' · ' + escapeHtml(zusatz) : ''),
          bereitsPostkarte: pk.vorraetig === true,
          bestand: zahl(pk.bestand),
          bereitsPoster: po.vorraetig === true,
          bestandPoster: zahl(po.bestand),
          bereitsLesezeichen: lz.vorraetig === true,
          bestandLesezeichen: zahl(lz.bestand),
          imShop: m.imShop !== false,
          geschichte: null,
          ort: null
        };
        if (m.bildLesezeichen) motiv.bildLesezeichen = m.bildLesezeichen;

        /* ORT: drei Arten (Punkt, Kreis, Fläche) — siehe karte.js */
        var o = m.ort;
        if (o && o.art && o.art !== 'keiner') {
          var label = tx(o.label);
          var ort = {
            label: label,
            // Gruppierungs-Schlüssel für die Karte: immer der DEUTSCHE
            // Name, damit die Gruppen in beiden Sprachen gleich sind.
            schluessel: (o.label && o.label.de) || label
          };
          if (o.art === 'flaeche') {
            try {
              ort.polygon = typeof o.polygon === 'string' ? JSON.parse(o.polygon) : o.polygon;
              ort.bereich = true;
            } catch (e) {
              console.warn('daten.js: Fläche bei Motiv "' + m.id + '" ist kein gültiger Code');
            }
          } else if (o.koordinaten) {
            /* "53.61357, 9.84857" — genau das Format, das Google Maps
               beim Rechtsklick auf eine Stelle zum Kopieren anbietet */
            var teile = String(o.koordinaten).split(',');
            ort.lat = parseFloat(teile[0]);
            ort.lng = parseFloat(teile[1]);
            if (o.art === 'kreis') {
              ort.bereich = true;
              ort.radius = Number(o.radius) || 4000;
            }
          }
          // Nur übernehmen, wenn der Ort wirklich verwertbar ist
          if (ort.polygon || (typeof ort.lat === 'number' && !isNaN(ort.lat))) motiv.ort = ort;
        }
        return motiv;
      });
  }

  function shopUmwandeln(json) {
    if (!json) return;
    global.DRUCKPARTNER = json.druckpartner || {};
    global.SAAL_SHOP_URL = json.saalShopUrl || '';
    global.POSTER_FORMAT = json.posterFormat || 'A4';
    global.PREISE = { download: Number(json.preisDownload) || 0 };
    // Staffeln: Zahlen sicherstellen und nach Menge sortieren —
    // falls im Admin-Bereich mal eine Stufe in der falschen
    // Reihenfolge eingetragen wurde, rechnet der Shop trotzdem richtig.
    var staffel = {};
    Object.keys(json.staffel || {}).forEach(function (typ) {
      staffel[typ] = (json.staffel[typ] || []).map(function (s) {
        return { abMenge: Number(s.abMenge), fuer: Number(s.fuer) };
      }).sort(function (a, b) { return a.abMenge - b.abMenge; });
    });
    global.STAFFEL = staffel;
    global.STAFFEL_GRUPPEN = json.kartenMischbar ? { karten: ['postkarte', 'lesezeichen'] } : {};
    global.MAX_MENGE = Number(json.maxMenge) || 50;
    var v = json.versand || {};
    global.VERSAND = {
      kostenlosAb: (v.kostenlosAb === '' || v.kostenlosAb === null || v.kostenlosAb === undefined) ? null : Number(v.kostenlosAb),
      kleinMaxStueck: Number(v.kleinMaxStueck) || 5,
      stufen: {
        klein:  { preis: Number((v.klein || {}).preis) || 0,  label: tx((v.klein || {}).label) },
        mittel: { preis: Number((v.mittel || {}).preis) || 0, label: tx((v.mittel || {}).label) },
        gross:  { preis: Number((v.gross || {}).preis) || 0,  label: tx((v.gross || {}).label) }
      }
    };
    global.ABHOLUNG_HINWEIS = tx(json.abholungHinweis);
    global.STICKER = (json.sticker || []).map(function (s) {
      return {
        id: s.id, motiv: tx(s.motiv), kategorie: s.kategorie || null,
        preis: Number(s.preis) || 0, mockups: s.mockups || []
      };
    });
  }

  function startseiteUmwandeln(json) {
    json = json || {};
    global.STARTSEITE_BILDER = (json.buehne || []).filter(function (e) { return e && e.id; });
    global.STARTSEITE_WECHSEL_SEKUNDEN = Number(json.wechselSekunden) || 7;
  }

  /* TERMINE: vergangene fliegen automatisch raus, der Rest wird nach
     Datum sortiert. Ein Termin gilt bis zum Ende seines (letzten) Tages. */
  function termineUmwandeln(json) {
    json = json || {};
    var heute = new Date();
    heute.setHours(0, 0, 0, 0);
    var liste = (json.termine || []).filter(function (t) { return t && t.datum; }).map(function (t) {
      return {
        datum: t.datum, bisDatum: t.bisDatum || '', von: t.von || '', bis: t.bis || '',
        titel: tx(t.titel), adresse: t.adresse || '', link: t.link || '', hinweis: tx(t.hinweis)
      };
    }).filter(function (t) {
      var ende = new Date((t.bisDatum || t.datum) + 'T00:00:00');
      return !isNaN(ende) && ende >= heute;
    }).sort(function (a, b) { return a.datum < b.datum ? -1 : 1; });
    global.TERMINE = { liste: liste, hinweis: tx(json.hinweis), keinTermin: tx(json.keinTermin) };
  }

  /* Datum hübsch ausgeben: "So · 11.10.2026" bzw. "Sun · 11 Oct 2026" */
  BG.datumText = function (iso) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return iso;
    if (LANG === 'en') {
      return d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' · ' +
        d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '') + ' · ' +
      d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  /* Ein Termin als Text: "So · 11.10.2026 · 10:00–17:00 Uhr" */
  BG.terminZeit = function (t) {
    var text = BG.datumText(t.datum);
    if (t.bisDatum && t.bisDatum !== t.datum) text += ' – ' + BG.datumText(t.bisDatum).split(' · ')[1];
    if (t.von) {
      text += ' · ' + t.von + (t.bis ? '–' + t.bis : '');
      if (LANG === 'de') text += ' Uhr';
    }
    return text;
  };

  /* TEXTE aus texte.json in die Seite einsetzen.
     Jedes Element mit data-txt="bereich.schluessel" bekommt den
     passenden Text. Das HTML enthält den deutschen Text als
     Notfall-Stand, falls die Datei mal nicht lädt. */
  function texteEinsetzen(json) {
    BG.texte = json || {};
    document.querySelectorAll('[data-txt]').forEach(function (el) {
      var pfad = el.getAttribute('data-txt').split('.');
      var wert = BG.texte;
      for (var i = 0; i < pfad.length && wert; i++) wert = wert[pfad[i]];
      var text = tx(wert);
      if (text) el.innerHTML = md(text, el.hasAttribute('data-absaetze'));
    });
    document.documentElement.classList.remove('texte-laden');
  }

  /* ------------------------------------------------------------
     ALLES LADEN, DANN DIE WARTENDEN SKRIPTE STARTEN
     ------------------------------------------------------------ */
  // Was sich schon vorher angemeldet hat (siehe sprache.js), übernehmen
  var wartende = BG._warteschlange || [];
  var fertig = false;

  BG.bereit = function (fn) {
    if (fertig) { try { fn(); } catch (e) { console.error(e); } return; }
    wartende.push(fn);
  };

  var ladeplan = {
    motive: motiveUmwandeln,
    shop: shopUmwandeln,
    startseite: startseiteUmwandeln,
    termine: termineUmwandeln,
    texte: null,           // wird erst nach dem DOM eingesetzt
    geschichten: null      // holt sich geschichten-tabelle.js selbst
  };

  var domFertig = new Promise(function (ok) {
    if (document.readyState !== 'loading') ok();
    else document.addEventListener('DOMContentLoaded', ok);
  });

  var geladen = {};
  Promise.all(brauche.map(function (name) {
    return ladeJson(name).then(function (json) { geladen[name] = json; });
  })).then(function () {
    Object.keys(ladeplan).forEach(function (name) {
      if (ladeplan[name] && brauche.indexOf(name) !== -1) ladeplan[name](geladen[name]);
    });
    BG.rohdaten = geladen;
    return domFertig;
  }).then(function () {
    texteEinsetzen(geladen.texte);
    fertig = true;
    wartende.forEach(function (fn) {
      // Ein Fehler in einem Skript soll die anderen nicht aufhalten
      try { fn(); } catch (e) { console.error(e); }
    });
    wartende = [];
    document.dispatchEvent(new CustomEvent('bg:daten-bereit'));
  });
})(window);
