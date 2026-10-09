/* ============ GESCHICHTEN LADEN ============
   Eine gemeinsame Stelle für das Laden der Geschichten-Texte. Wird
   von geschichte.js (Einzelseite pro Motiv) UND geschichten.js
   (Übersichtsseite) genutzt.

   QUELLE 1 (neu): daten/geschichten.json
   ------------------------------------------------------------
   Die Geschichten pflegst du jetzt im Admin-Bereich unter
   "Geschichten" — auf Deutsch und Englisch. Pro Geschichte:
   - id           (Pflicht, muss zur id eines Motivs passen)
   - geschichte   (Pflicht, der persönliche Text, de + en)
   - datum, ort, tier (de + en), tier_lat, gefaehrdung (de + en)
     → erscheinen als sachlicher Fußblock unter der Geschichte
   - zusatzbilder (Liste aus Bild + Bildunterschrift de/en)
     → erscheinen ganz unten auf der Geschichte-Seite. Diese Bilder
       sind bewusst NICHT in der Galerie und nicht im Shop.

   QUELLE 2 (Übergang): die alte Google-Tabelle
   ------------------------------------------------------------
   Solange daten/geschichten.json noch leer ist, liest die Seite
   weiter aus der Google-Tabelle (nur Deutsch). Sobald dort die
   erste Geschichte steht, wird die Tabelle nicht mehr benutzt.

   Beide Quellen liefern dasselbe Format, damit geschichte.js und
   geschichten.js nicht wissen müssen, woher die Texte kommen. */
(function (global) {
  // ---- HIER die veröffentlichte CSV-URL deiner Google-Tabelle eintragen ----
  var GESCHICHTEN_TABELLE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX6NJb2qa-jyx29imIn47l7sjM1130W_PxaNiNhdv206vnv3DbPOgvTIZx8ORVW1hXaxAEuC0W3R39/pub?gid=0&single=true&output=csv';

  // ---- Ordner, in dem die Zusatzbilder liegen ----
  // Steht hier fest, damit du in der Tabelle nur den Dateinamen
  // tippen musst. Enthält ein Eintrag in der Tabelle selbst einen
  // Schrägstrich (z.B. "bilder/teichleben/entenkueken1.jpg"), wird
  // er als vollständiger Pfad ab Seitenwurzel genommen und dieser
  // Ordner NICHT davorgesetzt.
  var ZUSATZBILDER_ORDNER = 'bilder/geschichten/';

  // ---- Sehr einfacher CSV-Parser: kommt mit Kommas/Zeilenumbrüchen
  // innerhalb von "..."-Feldern klar, wie Google Sheets sie exportiert.
  function parseCsv(text) {
    var zeilen = [];
    var feld = '', zeile = [], inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i], next = text[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') { feld += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { feld += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',') { zeile.push(feld); feld = ''; }
        else if (c === '\r') { /* ignorieren */ }
        else if (c === '\n') { zeile.push(feld); zeilen.push(zeile); zeile = []; feld = ''; }
        else { feld += c; }
      }
    }
    if (feld.length || zeile.length) { zeile.push(feld); zeilen.push(zeile); }
    return zeilen.filter(function (z) { return z.length && z.some(function (f) { return f.trim() !== ''; }); });
  }

  var cachePromise = null;

  /* ---- Quelle 1: daten/geschichten.json (über daten.js geladen) ----
     Liefert dieselbe Map wie die Tabelle: { id: { geschichte, datum,
     ort, tier_de, tier_lat, gefaehrdung, zusatzbilderListe } } — alle
     Texte bereits in der gewählten Sprache. "tier_de" heißt aus
     Kompatibilitätsgründen weiter so, enthält aber bei Englisch den
     englischen Artnamen. */
  function ausJson() {
    var BG = global.BG || {};
    var json = BG.rohdaten && BG.rohdaten.geschichten;
    var liste = (json && json.geschichten) || [];
    if (!liste.length) return null;   // → Tabelle als Übergang
    var tx = BG.tx || function (w) { return (w && w.de) || w || ''; };
    var map = {};
    liste.forEach(function (g) {
      if (!g || !g.id) return;
      var text = tx(g.geschichte);
      if (!text) return;
      map[g.id] = {
        geschichte: text,
        datum: g.datum || '',
        ort: tx(g.ort),
        tier_de: tx(g.tier),
        tier_lat: g.tier_lat || '',
        gefaehrdung: tx(g.gefaehrdung),
        zusatzbilderListe: (g.zusatzbilder || []).filter(function (z) { return z && z.bild; })
          .map(function (z) { return { datei: z.bild, text: tx(z.text) }; })
      };
    });
    return map;
  }

  // Lädt die komplette Tabelle EINMAL pro Seitenaufruf und liefert eine
  // Map { id: { geschichte, datum, ort, tier_de, tier_lat, gefaehrdung, ... } } —
  // also ALLE Spalten deiner Tabelle, nicht nur den Geschichte-Text.
  // Weitere Aufrufe bekommen das bereits geladene Ergebnis zurück (kein
  // zweiter Netzwerk-Request nötig).
  function holeAlleGeschichten() {
    if (cachePromise) return cachePromise;

    var json = ausJson();
    if (json) {
      cachePromise = Promise.resolve(json);
      return cachePromise;
    }

    if (!GESCHICHTEN_TABELLE_URL || GESCHICHTEN_TABELLE_URL.indexOf('HIER_DEINE') === 0) {
      cachePromise = Promise.resolve({});
      return cachePromise;
    }

    cachePromise = fetch(GESCHICHTEN_TABELLE_URL)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (csvText) {
        var zeilen = parseCsv(csvText);
        var map = {};
        if (!zeilen.length) return map;
        var kopf = zeilen[0].map(function (h) { return h.trim().toLowerCase(); });
        var idxId = kopf.indexOf('id');
        if (idxId === -1) return map;
        for (var i = 1; i < zeilen.length; i++) {
          var id = (zeilen[i][idxId] || '').trim();
          if (!id) continue;
          var eintrag = {};
          kopf.forEach(function (spalte, idx) {
            eintrag[spalte] = (zeilen[i][idx] || '').trim();
          });
          if (eintrag.geschichte) map[id] = eintrag;
        }
        return map;
      })
      .catch(function () { return {}; }); // still, kein Absturz — Fallback greift

    return cachePromise;
  }

  // Bequemer Einzel-Abruf für die Geschichte-Seite (?id=...).
  // Liefert das GANZE Tabellen-Objekt für diese Zeile (nicht nur den Text).
  function holeGeschichteAusTabelle(id) {
    return holeAlleGeschichten().then(function (map) {
      return map[id] || null;
    });
  }

  // ---- Hilfsfunktion: eine Semikolon-Liste in saubere Einzelteile zerlegen ----
  // Leere Stücke fliegen raus, damit ein versehentliches Semikolon am
  // Ende ("bild1.jpg; bild2.jpg;") kein leeres drittes Bild erzeugt.
  function zerlegeListe(wert) {
    if (!wert) return [];
    return wert.split(';')
      .map(function (teil) { return teil.trim(); })
      .filter(function (teil) { return teil !== ''; });
  }

  /* ---- Zusatzbilder einer Tabellenzeile aufbereiten ----
     Nimmt das komplette Zeilen-Objekt und liefert ein Array:
       [ { quelle: 'bilder/geschichten/original.jpg', text: 'Die Originalaufnahme' }, ... ]
     Ist die Spalte leer oder gar nicht vorhanden, kommt ein leeres
     Array zurück — die aufrufende Seite blendet den Block dann aus.

     Unterstützt beide Schreibweisen:
       a) zwei Spalten: zusatzbilder + zusatzbildtexte (gleiche Reihenfolge)
       b) eine Spalte:  "datei.jpg | Bildunterschrift; datei2.jpg | Text2"
     Steht zu einem Bild kein Text, bleibt der Text leer — das Bild
     erscheint dann schlicht ohne Unterschrift. */
  function holeZusatzbilder(eintrag) {
    if (!eintrag) return [];

    // Neue Quelle (geschichten.json): fertige Liste aus Bild + Text
    if (eintrag.zusatzbilderListe) {
      return eintrag.zusatzbilderListe.map(function (z) {
        var datei = String(z.datei).replace(/^\//, ''); // führenden "/" vom Admin-Upload entfernen
        return { quelle: datei.indexOf('/') !== -1 ? datei : ZUSATZBILDER_ORDNER + datei, text: z.text };
      });
    }

    var dateien = zerlegeListe(eintrag.zusatzbilder);
    if (!dateien.length) return [];

    var texte = zerlegeListe(eintrag.zusatzbildtexte);

    return dateien.map(function (rohEintrag, index) {
      var datei = rohEintrag;
      var text = texte[index] || '';

      // Variante b): Datei und Text in einer Zelle, getrennt durch "|"
      var strichPos = rohEintrag.indexOf('|');
      if (strichPos !== -1) {
        datei = rohEintrag.slice(0, strichPos).trim();
        var inlineText = rohEintrag.slice(strichPos + 1).trim();
        if (inlineText) text = inlineText;
      }

      // Enthält der Eintrag bereits einen Pfad, so übernehmen —
      // sonst den Standardordner davorsetzen.
      var quelle = (datei.indexOf('/') !== -1)
        ? datei
        : ZUSATZBILDER_ORDNER + datei;

      return { quelle: quelle, text: text };
    }).filter(function (bild) {
      // Sicherheitsnetz: ein Eintrag wie "| nur Text" ohne Dateiname
      // würde sonst ein kaputtes Bild erzeugen.
      return bild.quelle && bild.quelle !== ZUSATZBILDER_ORDNER;
    });
  }

  global.GeschichtenTabelle = {
    holeAlleGeschichten: holeAlleGeschichten,
    holeGeschichteAusTabelle: holeGeschichteAusTabelle,
    holeZusatzbilder: holeZusatzbilder,
    ZUSATZBILDER_ORDNER: ZUSATZBILDER_ORDNER
  };
})(window);
