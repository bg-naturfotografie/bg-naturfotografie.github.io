/* ============ GESCHICHTE-SEITE BEFÜLLEN ============
   Bild, Titel, Ort etc. kommen weiter aus daten/motive.json (?id=...).
   Der Geschichte-TEXT kommt aus der Google-Tabelle (Spalten: id,
   geschichte) über das gemeinsame Modul geschichten-tabelle.js —
   damit du Texte bequem in einer Tabelle schreibst statt in einer
   einzigen HTML/JS-Zeile auf GitHub. Falls die Tabelle mal nicht
   erreichbar ist oder für ein Motiv noch keine Zeile hat, greift
   ersatzweise motiv.geschichte aus daten/motive.json (falls dort noch
   etwas steht), sonst der Platzhaltertext.

   Ganz unten kann jede Geschichte zusätzliche Bilder haben (Spalten
   "zusatzbilder" / "zusatzbildtexte" in der Tabelle). Diese Bilder
   gehören absichtlich NICHT zur Galerie — sie existieren nur auf
   dieser Seite. Siehe zeigeZusatzbilder() weiter unten. */

/* Läuft erst, wenn daten.js alles geladen hat (BG.bereit) */
BG.bereit(function () {
  // ---- Zuordnung Serie -> Galerie-Unterseite (für den "Zurück"-Link) ----
  // kommt aus daten/motive.json (Serien)
  var KATEGORIE_ZU_SEITE = {};
  (window.SERIEN || []).forEach(function (s) { KATEGORIE_ZU_SEITE[s.id] = s.seite; });

  function stripHtml(str) {
    var div = document.createElement('div');
    div.innerHTML = str || '';
    return div.textContent || div.innerText || '';
  }

  function zeigeFehler(text) {
    var hinweis = document.getElementById('geschichte-lade-hinweis');
    hinweis.innerHTML = '<div class="wrap">' +
      '<p style="color:var(--text-muted);">' + text + '</p>' +
      '<a href="index.html#galerie" class="btn btn-outline" style="margin-top:1rem; display:inline-block;">' + BG.t('&larr; Zur Galerie', '&larr; To the gallery') + '</a>' +
      '</div>';
  }

  function holeZeileAusTabelle(id) {
    if (!window.GeschichtenTabelle) return Promise.resolve(null);
    return window.GeschichtenTabelle.holeGeschichteAusTabelle(id);
  }

  if (typeof GALERIE_BILDER === 'undefined') {
    zeigeFehler(BG.t('Die Bilddaten konnten nicht geladen werden.', 'The image data could not be loaded.'));
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  if (!id) {
    zeigeFehler(BG.t('Zu diesem Aufruf fehlt die Motiv-Angabe (?id=...).', 'This link is missing the motif (?id=...).'));
    return;
  }

  var motiv = GALERIE_BILDER.filter(function (b) { return b.id === id; })[0];

  if (!motiv) {
    zeigeFehler(BG.t('Zu diesem Motiv wurde leider keine Geschichte gefunden.', 'Sorry, no story was found for this motif.'));
    return;
  }

  // ---- Ladehinweis ausblenden, Inhalt einblenden ----
  document.getElementById('geschichte-lade-hinweis').style.display = 'none';
  document.getElementById('geschichte-inhalt').style.display = '';

  // ---- Titel & Seitentitel ----
  var titelText = stripHtml(motiv.beschriftung) || motiv.id;
  document.title = titelText + BG.t(' — Die Geschichte — BG Naturfotografie', ' — The story — BG Naturfotografie');
  document.getElementById('geschichte-titel').innerHTML = motiv.beschriftung || titelText;
  document.getElementById('geschichte-kategorie').textContent = motiv.kategorieName || motiv.kategorie;

  // ---- Bild ----
  var img = document.getElementById('geschichte-img');
  img.src = motiv.bild;
  img.alt = motiv.alt || titelText;

  // ---- Zurück-Link ----
  var zurueckSeite = KATEGORIE_ZU_SEITE[motiv.kategorie] || 'index.html#galerie';
  document.getElementById('zurueck-link').href = zurueckSeite;

  // ---- Verkaufshinweis: direkt zu DIESEM Motiv im Shop ----
  // Der Shop legt für jedes Motiv einen Anker "motiv-<id>" an
  // (siehe produkte-bestellen.html). Wer den QR-Code auf einer
  // Postkarte scannt, landet damit einen Klick später genau bei
  // dem Bild, das er gerade in der Hand hält.
  // Ist das Motiv nicht im Shop (imShop: false), verschwindet die
  // ganze Box, damit niemand ins Leere klickt.
  var kaufLink = document.getElementById('geschichte-shop-link');
  var kaufBox = kaufLink ? kaufLink.closest('.geschichte-kaufbox') : null;
  if (kaufLink) {
    if (motiv.imShop === false) {
      if (kaufBox) kaufBox.style.display = 'none';
    } else {
      kaufLink.href = 'produkte-bestellen.html#motiv-' + encodeURIComponent(motiv.id);
    }
  }

  // ---- Geschichte-Text + Fußblock: erst Tabelle versuchen, sonst daten/motive.json, sonst Platzhalter ----
  var textEl = document.getElementById('geschichte-text-inhalt');
  textEl.innerHTML = '<em>' + BG.t('Lädt …', 'Loading …') + '</em>';

  function zeigeGeschichte(text) {
    if (text) {
      textEl.textContent = text; // textContent erhält Zeilenumbrüche via CSS white-space
    } else {
      textEl.innerHTML = '<em>' + BG.t('Zu diesem Foto schreibe ich die Geschichte noch auf — schau bald wieder vorbei.', 'I haven\u2019t written the story for this photo yet — check back soon.') + '</em>';
    }
  }

  function zeigeFussblock(eintrag) {
    var box = document.getElementById('geschichte-fussblock');
    if (!eintrag) { box.style.display = 'none'; return; }

    var zeilen = [];
    if (eintrag.datum) zeilen.push([BG.t('Datum', 'Date'), eintrag.datum]);
    if (eintrag.ort) zeilen.push([BG.t('Ort', 'Place'), eintrag.ort]);
    if (eintrag.tier_de || eintrag.tier_lat) {
      var tier = [eintrag.tier_de, eintrag.tier_lat ? '(' + eintrag.tier_lat + ')' : '']
        .filter(Boolean).join(' ');
      zeilen.push([BG.t('Tier', 'Species'), tier]);
    }
    if (eintrag.gefaehrdung) zeilen.push([BG.t('Gefährdung', 'Conservation status'), eintrag.gefaehrdung]);

    if (!zeilen.length) { box.style.display = 'none'; return; }

    box.innerHTML = zeilen.map(function (z) {
      return '<div class="fussblock-zeile"><span class="fussblock-label">' + z[0] + '</span>' + z[1] + '</div>';
    }).join('');
    box.style.display = '';
  }

  /* ---- Zusatzbilder ganz unten auf der Seite ----
     Das sind bewusst EXTRA-Aufnahmen, die es sonst nirgends gibt:
     Originalaufnahmen vor der Bearbeitung, Bildvarianten, Situations-
     fotos. Sie stehen NUR in der Google-Tabelle (Spalten "zusatzbilder"
     und "zusatzbildtexte") und NICHT in daten/motive.json — tauchen
     also in keiner Galerie, keiner Lightbox und nicht im Shop auf.

     Ist die Spalte leer, bleibt der ganze Abschnitt unsichtbar. Für
     alle bestehenden Geschichten ändert sich dadurch nichts. */
  function zeigeZusatzbilder(eintrag) {
    var abschnitt = document.getElementById('geschichte-zusatzbilder');
    if (!abschnitt) return; // Seite ohne den Abschnitt — einfach nichts tun

    var galerie = document.getElementById('zusatzbilder-galerie');
    var bilder = (window.GeschichtenTabelle && window.GeschichtenTabelle.holeZusatzbilder)
      ? window.GeschichtenTabelle.holeZusatzbilder(eintrag)
      : [];

    if (!bilder.length) { abschnitt.style.display = 'none'; return; }

    galerie.innerHTML = '';

    bilder.forEach(function (bild) {
      var figure = document.createElement('figure');
      figure.className = 'zusatzbild';

      var img = document.createElement('img');
      img.src = bild.quelle;
      // Alt-Text: die Bildunterschrift, falls vorhanden — sonst ein
      // sinnvoller Ersatz, damit Screenreader nicht ins Leere laufen.
      img.alt = bild.text || (BG.t('Weitere Aufnahme zum Motiv ', 'Another picture of the motif ') + titelText);
      img.loading = 'lazy';      // lädt erst, wenn man hinunterscrollt
      img.decoding = 'async';

      // Tippfehler im Dateinamen sollen keine kaputten Bildsymbole
      // hinterlassen: das betroffene Bild verschwindet dann still.
      img.addEventListener('error', function () {
        figure.style.display = 'none';
        // Bleibt kein einziges Bild übrig, verschwindet auch die Überschrift.
        if (!galerie.querySelector('figure:not([style*="none"])')) {
          abschnitt.style.display = 'none';
        }
      });

      figure.appendChild(img);

      if (bild.text) {
        var caption = document.createElement('figcaption');
        caption.textContent = bild.text;
        figure.appendChild(caption);
      }

      galerie.appendChild(figure);
    });

    // Bei nur einem Bild nicht auf halbe Breite quetschen.
    galerie.classList.toggle('ist-einzeln', bilder.length === 1);
    abschnitt.style.display = '';
  }

  holeZeileAusTabelle(motiv.id).then(function (ausTabelle) {
    zeigeGeschichte((ausTabelle && ausTabelle.geschichte) || motiv.geschichte);
    zeigeFussblock(ausTabelle);
    zeigeZusatzbilder(ausTabelle);
  });

  // ---- Ort (nur anzeigen, wenn hinterlegt) ----
  if (motiv.ort && (motiv.ort.polygon || (motiv.ort.lat && motiv.ort.lng))) {
    document.getElementById('geschichte-ort-box').style.display = '';
    document.getElementById('geschichte-ort-text').textContent = motiv.ort.label || BG.t('Ort hinterlegt', 'Location on file');
    document.getElementById('geschichte-karte-link').href = 'karte.html?motiv=' + encodeURIComponent(motiv.id);
  }

  // ---- Teilen-Button: nutzt das native Teilen-Menü (Handy), sonst Link kopieren ----
  var teilenBtn = document.getElementById('teilen-btn');
  var teilenBtnText = document.getElementById('teilen-btn-text');
  var seitenUrl = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(motiv.id);

  teilenBtn.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({
        title: titelText + ' — BG Naturfotografie',
        text: BG.t('Die Geschichte hinter diesem Foto:', 'The story behind this photo:'),
        url: seitenUrl
      }).catch(function () { /* Abbruch durch Nutzer:in — kein Fehler */ });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(seitenUrl).then(function () {
        var original = teilenBtnText.textContent;
        teilenBtnText.textContent = BG.t('Link kopiert!', 'Link copied!');
        setTimeout(function () { teilenBtnText.textContent = original; }, 2000);
      });
    }
  });
}); // Ende BG.bereit
