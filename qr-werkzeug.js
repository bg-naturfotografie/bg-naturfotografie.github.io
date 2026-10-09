/* ============ QR-WERKZEUG (intern) ============
   Baut für jedes Motiv aus GALERIE_BILDER einen QR-Code, der zur
   Geschichte des Motivs führt (geschichte.html?id=...). Gedacht
   zum Herunterladen und Platzieren auf der Postkarten-Rückseite —
   NICHT für Besucher der Webseite.

   DRUCK-EINSTELLUNGEN (nicht an die Markenfarben anpassen!):
   - Schwarz auf Reinweiss. In CMYK wird daraus K100 auf 0/0/0/0,
     also ein sauberer Einfarbdruck ohne Passerprobleme.
   - 600 px Kantenlaenge = ca. 760 dpi bei 20 mm Druckgroesse.
     Die Anzeige im Browser bleibt klein, der Download ist gross. */
/* Läuft erst, wenn daten.js die Motive geladen hat */
BG.bereit(function () {
  var raster = document.getElementById('qr-raster');
  if (!raster || typeof GALERIE_BILDER === 'undefined') return;

  // Aufloesung fuer den Download bzw. fuer die Darstellung auf dieser Seite
  var DRUCK_PX = 600;
  var ANZEIGE_PX = 180;

  // Haelt die hochaufloesenden Codes auf dieser Seite klein
  var stil = document.createElement('style');
  stil.textContent =
    '.qr-karte-code img, .qr-karte-code canvas {' +
    'width:' + ANZEIGE_PX + 'px; height:' + ANZEIGE_PX + 'px; max-width:100%; }';
  document.head.appendChild(stil);

  // Basis-URL: automatisch die aktuelle Domain, damit es lokal UND live funktioniert
  var basisUrl = window.location.origin + window.location.pathname.replace('qr-werkzeug.html', 'geschichte.html');

  function baueKarten(motive) {
    raster.innerHTML = '';

    motive.forEach(function (motiv) {
      var titel = motiv.beschriftung ? motiv.beschriftung.replace(/<[^>]+>/g, '') : motiv.id;
      var url = basisUrl + '?id=' + encodeURIComponent(motiv.id);

      var karte = document.createElement('div');
      karte.className = 'qr-karte';
      karte.innerHTML =
        '<div class="qr-karte-code"></div>' +
        '<p class="qr-karte-titel">' + titel + '</p>' +
        '<p class="qr-karte-id">' + motiv.id + '</p>' +
        '<button class="btn btn-fill qr-karte-btn" style="font-size:.75rem; padding:.5em 1em; cursor:pointer;">Herunterladen</button>';

      raster.appendChild(karte);

      var codeContainer = karte.querySelector('.qr-karte-code');
      new QRCode(codeContainer, {
        text: url,
        width: DRUCK_PX,
        height: DRUCK_PX,
        colorDark: '#000000',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });

      karte.querySelector('.qr-karte-btn').addEventListener('click', function () {
        var canvas = codeContainer.querySelector('canvas');
        if (!canvas) return;
        var link = document.createElement('a');
        link.download = 'qr-' + motiv.id + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  }

  baueKarten(GALERIE_BILDER);

  document.getElementById('filter-alle').addEventListener('click', function () {
    baueKarten(GALERIE_BILDER);
  });
  document.getElementById('filter-postkarte').addEventListener('click', function () {
    baueKarten(GALERIE_BILDER.filter(function (b) { return b.bereitsPostkarte === true; }));
  });
});
