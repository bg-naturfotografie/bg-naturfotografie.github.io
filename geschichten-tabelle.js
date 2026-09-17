/* ============ GEMEINSAME GESCHICHTEN-TABELLE ============
   Eine einzige Stelle für die Google-Tabellen-URL und das Laden/
   Parsen der Geschichten-Texte. Wird von geschichte.js (Einzelseite
   pro Motiv) UND geschichten.js (Übersichtsseite) genutzt — so
   pflegst du die URL nur hier, nicht doppelt.

   Spalten in der Tabelle:
   - id          (Pflicht, muss zur id in galerie-daten.js passen)
   - geschichte  (Pflicht, der persönliche Text)
   - datum       (optional, z.B. "14.05.2025")
   - ort         (optional, z.B. "Schenefeld/Halstenbek")
   - tier_de     (optional, deutscher Artname, z.B. "Stockente")
   - tier_lat    (optional, lateinischer Artname, z.B. "Anas platyrhynchos")
   - gefaehrdung (optional, z.B. "Die Stockente ist nicht gefährdet.")
   Diese fünf Spalten erscheinen automatisch als sachlicher
   Fußblock unter der Geschichte auf geschichte.html — getrennt von
   der persönlichen Erzählung. Leere Spalten werden einfach ausgelassen.

   ---- NEU: Zusatzbilder ganz unten auf der Geschichte-Seite ----
   - zusatzbilder     (optional, Dateinamen mit SEMIKOLON getrennt)
   - zusatzbildtexte  (optional, Bildunterschriften, gleiche Reihenfolge,
                       ebenfalls mit SEMIKOLON getrennt)

   Beispielzeile:
     zusatzbilder      entenkueken-original.jpg; entenkueken-schnitt.jpg
     zusatzbildtexte   Die Originalaufnahme; Der gewählte Bildausschnitt

   Warum Semikolon und nicht Komma? Weil in Bildunterschriften fast
   immer Kommas vorkommen — mit Komma als Trennzeichen würdest du
   dir den Text zerschneiden.

   Alternativ kannst du Datei und Text auch in EINER Zelle mit einem
   senkrechten Strich koppeln, dann brauchst du die zweite Spalte nicht:
     zusatzbilder   entenkueken-original.jpg | Die Originalaufnahme; entenkueken-schnitt.jpg | Der gewählte Ausschnitt

   WICHTIG: Diese Bilder sind bewusst NUR hier zu sehen. Sie gehören
   nicht in galerie-daten.js, tauchen also in keiner Galerie, keiner
   Lightbox und nicht im Shop auf. Deshalb stehen Dateiname und
   Bildunterschrift auch direkt in der Tabelle und nicht als Foto-ID.

   Die Tabelle ist die EINZIGE Quelle für Geschichten-Texte.
   Das geschichte-Feld in galerie-daten.js wird nicht mehr gebraucht
   (bleibt aber als Rückfallebene erhalten, falls die Tabelle mal
   nicht erreichbar ist). */
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

  // Lädt die komplette Tabelle EINMAL pro Seitenaufruf und liefert eine
  // Map { id: { geschichte, datum, ort, tier_de, tier_lat, gefaehrdung, ... } } —
  // also ALLE Spalten deiner Tabelle, nicht nur den Geschichte-Text.
  // Weitere Aufrufe bekommen das bereits geladene Ergebnis zurück (kein
  // zweiter Netzwerk-Request nötig).
  function holeAlleGeschichten() {
    if (cachePromise) return cachePromise;

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
