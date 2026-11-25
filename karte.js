/* ============ KARTE AUS daten/motive.json AUFBAUEN ============
   Liest alle Motive mit hinterlegtem "ort" aus GALERIE_BILDER und
   setzt dafür Punkte bzw. Gebiete auf eine Leaflet-Karte (kostenlos,
   kein API-Key nötig).

   MEHRERE MOTIVE AN EINEM ORT:
   Motive, die sich denselben Ort teilen (gleicher Punkt, gleicher
   Kreis oder dieselbe Fläche), werden zu EINER Markierung zusammen-
   gefasst. Ein Klick darauf öffnet ein Fenster mit allen Bildern
   dieses Ortes — es bleibt offen, bis man daneben klickt. Erst ein
   Klick auf ein einzelnes Bild führt zu dessen Geschichte.

   DREI ARTEN VON ORTEN (siehe daten/motive.json):
   - Punkt:           kein "bereich"        → schlichter kleiner Punkt
   - Gebiet (Kreis):  bereich:true + radius → weicher, unscharfer Kreis
   - Gebiet (Form):   bereich:true + polygon → frei gezeichnete Fläche
                       (z. B. ein Stadtteil-Umriss, erzeugt mit
                       gebiet-zeichnen.html) */
/* Läuft erst, wenn daten.js alles geladen hat (BG.bereit) */
BG.bereit(function () {
  var kartenElement = document.getElementById('foto-karte');
  if (!kartenElement || typeof L === 'undefined' || typeof GALERIE_BILDER === 'undefined') return;

  function escapeAttr(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function titelVon(motiv) {
    return motiv.beschriftung ? motiv.beschriftung.replace(/<[^>]+>/g, '') : motiv.id;
  }

  function hatOrt(b) {
    if (!b.ort) return false;
    if (b.ort.polygon && b.ort.polygon.length >= 3) return true;
    return typeof b.ort.lat === 'number' && typeof b.ort.lng === 'number';
  }

  var motiveMitOrt = GALERIE_BILDER.filter(hatOrt);

  var startZentrum = [53.7297, 9.7975]; // Halstenbek / Kreis Pinneberg
  var startZoom = 10;

  var karte = L.map(kartenElement, {
    scrollWheelZoom: false,
    zoomControl: false // eigene, ruhigere Zoom-Buttons unten
  }).setView(startZentrum, startZoom);

  L.control.zoom({ position: 'bottomright' }).addTo(karte);

  /* ---- Kartenkacheln ----
     Bis August 2026 kamen die Kacheln von CARTO. CARTO verlangt
     dafür inzwischen einen API-Schlüssel und legt unangemeldeten
     Anfragen ein "API KEY REQUIRED" quer über die Karte — deshalb
     laufen sie jetzt direkt über OpenStreetMap: kein Schlüssel,
     kein Konto, keine Kosten.

     Die Farbgebung macht ohnehin die CSS-Klasse "karte-kacheln"
     (siehe styles.css) — dort stellst du Sättigung und Helligkeit
     ein, nicht hier.

     Falls die Karte irgendwann sehr viel besucht wird: OpenStreetMap
     bittet bei hoher Last darum, einen eigenen Kachel-Dienst zu
     nutzen. Bei deinen Zahlen ist das weit entfernt. */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' + BG.t('-Mitwirkende', ' contributors'),
    maxZoom: 19,
    className: 'karte-kacheln'
  }).addTo(karte);

  karte.on('focus', function () { karte.scrollWheelZoom.enable(); });
  karte.on('blur', function () { karte.scrollWheelZoom.disable(); });

  if (motiveMitOrt.length === 0) {
    document.getElementById('karte-leer-hinweis').style.display = '';
    return;
  }

  /* ---- Motive nach Ort gruppieren ------------------------------
     Entscheidend ist der ORTSNAME (label): Alle Motive mit demselben
     label landen unter EINER Markierung — so bestimmst du die
     Gruppierung einfach über den Text, ohne auf exakt gleiche
     Koordinaten achten zu müssen. (Drei Fotos "Teich in Halstenbek"
     mit minimal verschiedenen Koordinaten ergeben also einen Punkt.)
     Nur wenn kein label gesetzt ist, wird auf die Koordinaten
     zurückgegriffen. */
  function ortSchluessel(ort) {
    // "schluessel" = deutscher Ortsname (von daten.js gesetzt), damit
    // die Gruppen auf Deutsch und Englisch gleich aussehen
    var name = ort.schluessel || ort.label;
    if (name && name.trim()) {
      return 'name:' + name.trim().toLowerCase();
    }
    if (ort.polygon && ort.polygon.length >= 3) {
      return 'flaeche:' + ort.polygon.map(function (p) {
        return p[0].toFixed(5) + ',' + p[1].toFixed(5);
      }).join('|');
    }
    var basis = ort.lat.toFixed(5) + ',' + ort.lng.toFixed(5);
    if (ort.bereich) return 'kreis:' + basis + ':' + (ort.radius || 4000);
    return 'punkt:' + basis;
  }

  var gruppen = {};
  motiveMitOrt.forEach(function (motiv) {
    var schluessel = ortSchluessel(motiv.ort);
    if (!gruppen[schluessel]) {
      gruppen[schluessel] = { ort: motiv.ort, motive: [] };
    }
    gruppen[schluessel].motive.push(motiv);
  });

  /* ---- In welchem ORT liegt ein Punkt? ---------------------------
     Für die Ortsknöpfe über der Karte und die Bilderleiste darunter
     („Halstenbek · Spielplatz Krupunder“).
     1. Im Admin-Bereich unter „Ort für die Kartenliste“ eingetragen
        → das gilt immer.
     2. Sonst: Liegt der Punkt in einem der Umrisse aus
        daten/orte-gebiete.js (Halstenbek, Schenefeld, Hamburg …)?
     3. Sonst: grobe Rechtecke für weiter weg (WEITERE_REGIONEN).
     4. Sonst: „Weitere Orte“.
     Alles passiert im Browser — kein fremder Dienst, keine Kosten. */
  var WEITERE_REGIONEN = [
    // [Name, Süden, Westen, Norden, Osten]
    ['Schottland', 54.6, -8.7, 61.0, -0.7]
  ];
  var REGION_ENGLISCH = { 'Schottland': 'Scotland', 'Rund um Barmstedt': 'Around Barmstedt', 'Weitere Orte': 'Other places' };
  function regionAnzeige(name) { return BG.t(name, REGION_ENGLISCH[name] || name); }

  function imRing(lat, lng, ring) {
    var drin = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var yi = ring[i][0], xi = ring[i][1], yj = ring[j][0], xj = ring[j][1];
      if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) drin = !drin;
    }
    return drin;
  }
  function mittelpunktVon(ort) {
    if (ort.polygon && ort.polygon.length >= 3) {
      var la = 0, ln = 0;
      ort.polygon.forEach(function (p) { la += p[0]; ln += p[1]; });
      return [la / ort.polygon.length, ln / ort.polygon.length];
    }
    return [ort.lat, ort.lng];
  }
  function regionVon(ort) {
    if (ort.region) return ort.region;
    var p = mittelpunktVon(ort);
    var gebiete = window.ORTE_GEBIETE || [];
    for (var g = 0; g < gebiete.length; g++) {
      var treffer = 0;   // gerade/ungerade über alle Ringe = Löcher werden richtig behandelt
      gebiete[g].ringe.forEach(function (r) { if (imRing(p[0], p[1], r)) treffer++; });
      if (treffer % 2) return gebiete[g].name;
    }
    for (var w = 0; w < WEITERE_REGIONEN.length; w++) {
      var b = WEITERE_REGIONEN[w];
      if (p[0] >= b[1] && p[0] <= b[3] && p[1] >= b[2] && p[1] <= b[4]) return b[0];
    }
    return 'Weitere Orte';
  }

  function normal(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  }
  // „Halstenbek · Trampelpfad“ — aber nicht „Halstenbek · Halstenbek, Trampelpfad“
  function ortsZeile(gruppe) {
    var region = regionAnzeige(gruppe.region);
    var label = gruppe.ort.label;
    if (!label) return region;
    if (normal(label).indexOf(normal(gruppe.region)) !== -1) return label;
    return region + ' \u00b7 ' + label;
  }

  Object.keys(gruppen).forEach(function (schluessel) {
    var gruppe = gruppen[schluessel];
    gruppe.region = regionVon(gruppe.ort);
    gruppe.motive.forEach(function (m) { m._gruppe = gruppe; });
  });

  /* ---- Inhalt des Hover-Vorschaufensters ----
     Ein Motiv → kleines Bild mit Titel.
     Mehrere    → Ortsname und Anzahl, damit klar ist, dass ein
                  Klick mehrere Bilder zeigt. */
  function tooltipHtml(gruppe) {
    if (gruppe.motive.length === 1) {
      var m = gruppe.motive[0];
      return '<img class="karte-marker-thumb" src="' + escapeAttr(BG.klein(m.bild)) + '"' + BG.bildFallback(m.bild) + ' alt="' + escapeAttr(m.alt || titelVon(m)) + '">' +
        '<div class="karte-marker-label">' + escapeAttr(titelVon(m)) + '</div>';
    }
    return '<div class="karte-marker-label karte-marker-sammel">' +
      escapeAttr(gruppe.ort.label || BG.t('Mehrere Motive', 'Several motifs')) +
      '<br><span>' + gruppe.motive.length + BG.t(' Motive &middot; klicken', ' motifs &middot; click') + '</span></div>';
  }

  /* ---- Inhalt des Klick-Fensters: alle Bilder dieses Ortes ----
     Jedes Bild ist ein Link zu seiner Geschichte. Das Fenster bleibt
     offen, bis man daneben auf die Karte klickt (Leaflet-Standard). */
  function popupHtml(gruppe) {
    var kopf = '<div class="karte-popup-kopf">' +
      escapeAttr(ortsZeile(gruppe)) +
      (gruppe.motive.length > 1 ? ' <span>&middot; ' + gruppe.motive.length + BG.t(' Motive', ' motifs') + '</span>' : '') +
      '</div>';

    var eintraege = gruppe.motive.map(function (m) {
      return '<a class="karte-popup-eintrag" href="geschichte.html?id=' + escapeAttr(m.id) + '">' +
        '<img src="' + escapeAttr(BG.klein(m.bild)) + '"' + BG.bildFallback(m.bild) + ' alt="' + escapeAttr(m.alt || titelVon(m)) + '">' +
        '<span>' + escapeAttr(titelVon(m)) + '</span>' +
        '</a>';
    }).join('');

    return kopf + '<div class="karte-popup-raster">' + eintraege + '</div>';
  }

  var grenzen = [];

  Object.keys(gruppen).forEach(function (schluessel) {
    var gruppe = gruppen[schluessel];
    var ort = gruppe.ort;
    var element;
    var versatz;

    if (ort.polygon && ort.polygon.length >= 3) {
      // ---- Gebiet als frei gezeichnete Fläche ----
      element = L.polygon(ort.polygon, {
        className: 'karte-gebiet',
        stroke: false,
        fillOpacity: 1
      }).addTo(karte);
      ort.polygon.forEach(function (p) { grenzen.push(p); });
      versatz = [0, 0];
    } else if (ort.bereich) {
      // ---- Gebiet als weicher Kreis ----
      var mittelpunkt = [ort.lat, ort.lng];
      element = L.circle(mittelpunkt, {
        radius: ort.radius || 4000,
        className: 'karte-gebiet',
        stroke: false,
        fillOpacity: 1
      }).addTo(karte);
      grenzen.push(mittelpunkt);
      versatz = [0, -10];
    } else {
      // ---- Punkt: schlichter kleiner Kreis ----
      var punkt = [ort.lat, ort.lng];
      element = L.circleMarker(punkt, {
        radius: gruppe.motive.length > 1 ? 7 : 5, // Sammelpunkte etwas größer
        className: 'karte-punkt'
      }).addTo(karte);
      grenzen.push(punkt);
      versatz = [0, -8];
    }

    element.bindTooltip(tooltipHtml(gruppe), {
      direction: 'top',
      offset: versatz,
      className: 'karte-tooltip',
      opacity: 1,
      sticky: true
    });

    element.bindPopup(popupHtml(gruppe), {
      className: 'karte-popup',
      maxWidth: 340,
      minWidth: 300,
      autoPan: true,
      closeButton: true
    });

    // Beim Öffnen des Fensters die Hover-Vorschau ausblenden,
    // damit sich beides nicht überlagert.
    element.on('popupopen', function () {
      element.closeTooltip();
      leisteMarkieren(gruppe);
    });
    gruppe.element = element;
  });

  // ---- STARTANSICHT: nah an Halstenbek ----
  // Früher hat die Karte so weit herausgezoomt, dass ALLE Punkte
  // drauf waren — wegen der Motive aus Schottland war dann ganz
  // Nordeuropa zu sehen und Halstenbek nur ein Klecks.
  //
  // Jetzt startet sie auf dem Rechteck HALSTENBEK_BEREICH. Darin
  // liegen die meisten Punkte (Blocksberger Moor, Ahornweg,
  // Friedrichshulder See). fitBounds passt den Zoom automatisch an
  // die Bildschirmbreite an — auf dem Handy wie am Monitor ist
  // dasselbe Gebiet zu sehen, ohne dass etwas abgeschnitten wird.
  //
  // ANPASSEN:
  //   - Mehr Umgebung zeigen → die Zahlen weiter auseinanderziehen
  //     (z. B. 9.80 statt 9.815 als linke Grenze nimmt die LSE mit)
  //   - Näher ran → maxZoom erhöhen (15 = einzelne Häuser, 13 = Ortsteile)
  //   [ [Süden, Westen], [Norden, Osten] ]
  var HALSTENBEK_BEREICH = [[53.6045, 9.815], [53.6175, 9.858]];

  function zeigeHalstenbek() {
    karte.fitBounds(HALSTENBEK_BEREICH, { padding: [30, 30], maxZoom: 15 });
  }
  function zeigeAlleOrte() {
    if (grenzen.length > 1) {
      karte.fitBounds(grenzen, { padding: [50, 50], maxZoom: 12 });
    } else if (grenzen.length === 1) {
      karte.setView(grenzen[0], 12);
    }
  }
  zeigeHalstenbek();

  // ---- Startansicht ERZWINGEN ----
  // Leaflet berechnet den Zoom aus der Größe des Kartenkastens.
  // Ist die Seite beim ersten Aufruf noch nicht fertig aufgebaut
  // (Schriften, CSS), kann der Kasten kurz eine falsche Größe
  // haben — dann stimmt der Ausschnitt nicht. Deshalb wird er nach
  // dem vollständigen Laden noch einmal gesetzt.
  // Ausnahme: Wer schon selbst gezoomt/verschoben hat oder über
  // einen QR-Link (?motiv=…) kommt, wird nicht zurückgeworfen.
  var nutzerHatBewegt = false;
  karte.on('dragstart zoomstart', function (e) {
    // zoomstart feuert auch bei unseren eigenen fitBounds-Aufrufen;
    // nur echte Bedienung mit Maus/Finger hat ein originalEvent.
    if (e.originalEvent) nutzerHatBewegt = true;
  });
  function erzwingeStart() {
    if (nutzerHatBewegt || new URLSearchParams(window.location.search).get('motiv')) return;
    karte.invalidateSize();   // Kartengröße neu messen
    zeigeHalstenbek();
  }
  window.addEventListener('load', erzwingeStart);
  setTimeout(erzwingeStart, 600); // Sicherheitsnetz, falls "load" schon vorbei war

  // ---- Knöpfe "Halstenbek" / "Alle Orte" oben rechts ----
  // Damit man die Motive weiter weg (Himmelmoor, Klövensteen,
  // Schottland) trotzdem mit einem Klick findet.
  var AnsichtKnoepfe = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      var box = L.DomUtil.create('div', 'leaflet-bar karte-ansicht');
      // Klicks und Scrollen auf den Knöpfen nicht an die Karte durchreichen
      L.DomEvent.disableClickPropagation(box);
      [['Halstenbek', zeigeHalstenbek], [BG.t('Alle Orte', 'All places'), zeigeAlleOrte]].forEach(function (k) {
        var knopf = L.DomUtil.create('a', '', box);
        knopf.href = '#';
        knopf.setAttribute('role', 'button');
        knopf.textContent = k[0];
        L.DomEvent.on(knopf, 'click', function (e) {
          L.DomEvent.preventDefault(e);
          k[1]();
        });
      });
      return box;
    }
  });
  karte.addControl(new AnsichtKnoepfe());

  // ---- Falls über die URL ein bestimmtes Motiv verlinkt wurde (?motiv=id), dorthin zentrieren ----
  var params = new URLSearchParams(window.location.search);
  var zielId = params.get('motiv');
  if (zielId) {
    var zielMotiv = motiveMitOrt.filter(function (m) { return m.id === zielId; })[0];
    if (zielMotiv) {
      if (zielMotiv.ort.polygon) {
        karte.fitBounds(zielMotiv.ort.polygon, { padding: [60, 60], maxZoom: 14 });
      } else {
        karte.setView([zielMotiv.ort.lat, zielMotiv.ort.lng], 13);
      }
    }
  }

  /* ============================================================
     SUCHE, ORTSKNÖPFE und BILDERLEISTE
     ============================================================
     - Suchfeld: filtert nach Tier, Zusatz, Ortsname, Ort und Serie.
     - Ortsknöpfe („Halstenbek 25“, „Schenefeld 19“ …): zeigt nur
       die Motive dieses Ortes und zoomt dorthin. Nochmal klicken
       = wieder alle.
     - Bilderleiste unter der Karte: alle passenden Motive, auf dem
       Desktop 5 pro Seite (Pfeile oder wischen). Klick auf ein
       Bild → Karte springt zum Punkt und öffnet ihn.
     Punkte, die nicht passen, werden blass statt zu verschwinden. */
  var suchFeld = document.getElementById('karte-suche');
  var ortKnoepfe = document.getElementById('karte-orte');
  var leiste = document.getElementById('karte-leiste');
  var spur = document.getElementById('karte-leiste-spur');
  var leisteInfo = document.getElementById('karte-leiste-info');
  var knopfZurueck = document.getElementById('karte-leiste-zurueck');
  var knopfWeiter = document.getElementById('karte-leiste-weiter');
  if (!spur || !ortKnoepfe) return;

  var filter = { region: null, suche: '' };

  // Orte nach Anzahl der Motive sortiert (Halstenbek zuerst)
  var regionAnzahl = {};
  motiveMitOrt.forEach(function (m) { regionAnzahl[m._gruppe.region] = (regionAnzahl[m._gruppe.region] || 0) + 1; });
  var regionen = Object.keys(regionAnzahl).sort(function (a, b) {
    if (a === 'Weitere Orte') return 1;
    if (b === 'Weitere Orte') return -1;
    return regionAnzahl[b] - regionAnzahl[a] || a.localeCompare(b, 'de');
  });

  // Leiste: erst nach Ort, dann nach Ortsname, dann Reihenfolge der Daten
  var leistenMotive = motiveMitOrt.slice().sort(function (a, b) {
    return regionen.indexOf(a._gruppe.region) - regionen.indexOf(b._gruppe.region) ||
      String(a.ort.label || '').localeCompare(String(b.ort.label || ''), 'de');
  });

  function knoepfeZeichnen() {
    var html = '<button type="button" class="karte-ort" data-region="" aria-pressed="' + (!filter.region) + '">' +
      BG.t('Alle Orte', 'All places') + '<span>' + motiveMitOrt.length + '</span></button>';
    regionen.forEach(function (r) {
      html += '<button type="button" class="karte-ort" data-region="' + escapeAttr(r) + '" aria-pressed="' + (filter.region === r) + '">' +
        escapeAttr(regionAnzeige(r)) + '<span>' + regionAnzahl[r] + '</span></button>';
    });
    ortKnoepfe.innerHTML = html;
  }

  function passt(m) {
    if (filter.region && m._gruppe.region !== filter.region) return false;
    if (!filter.suche) return true;
    var heu = normal([m.art, m.zusatz, m.ort.label, m._gruppe.region, regionAnzeige(m._gruppe.region), m.kategorieName].join(' '));
    return filter.suche.split(/\s+/).every(function (wort) { return heu.indexOf(wort) !== -1; });
  }

  function leisteZeichnen() {
    var liste = leistenMotive.filter(passt);
    leiste.hidden = false;
    if (!liste.length) {
      spur.innerHTML = '<p class="karte-leiste-leer">' + BG.t('Nichts gefunden — versuch einen anderen Begriff.', 'Nothing found — try another word.') + '</p>';
    } else {
      spur.innerHTML = liste.map(function (m) {
        return '<button type="button" class="karte-leiste-bild" data-id="' + escapeAttr(m.id) + '" title="' + escapeAttr(titelVon(m)) + '">' +
          '<img loading="lazy" src="' + escapeAttr(BG.klein(m.bild)) + '"' + BG.bildFallback(m.bild) + ' alt="' + escapeAttr(m.alt || titelVon(m)) + '">' +
          '<b>' + escapeAttr(m.art || titelVon(m)) + '</b>' +
          '<small>' + escapeAttr(ortsZeile(m._gruppe)) + '</small>' +
          '</button>';
      }).join('');
    }
    spur.scrollTo({ left: 0, behavior: 'instant' });
    seitenInfo();

    // Punkte auf der Karte abblenden, die nichts Passendes enthalten
    var gefiltert = !!(filter.region || filter.suche);
    Object.keys(gruppen).forEach(function (k) {
      var g = gruppen[k];
      var el = g.element && g.element.getElement && g.element.getElement();
      if (!el) return;
      var treffer = !gefiltert || g.motive.some(passt);
      el.classList.toggle('karte-gedimmt', !treffer);
    });
    return liste;
  }

  /* Bereich der Karte, der alle passenden Motive zeigt */
  function zuTreffernZoomen(liste) {
    var punkte = [];
    liste.forEach(function (m) {
      if (m.ort.polygon) m.ort.polygon.forEach(function (p) { punkte.push(p); });
      else punkte.push([m.ort.lat, m.ort.lng]);
    });
    if (!punkte.length) return;
    karte.closePopup();
    if (punkte.length === 1) karte.setView(punkte[0], 14);
    else karte.fitBounds(punkte, { padding: [40, 40], maxZoom: 15 });
  }

  /* „Bilder 1–5 von 54“ und Pfeile an/aus */
  function seitenInfo() {
    var karten = spur.querySelectorAll('.karte-leiste-bild');
    var n = karten.length;
    if (!n) { leisteInfo.textContent = ''; knopfZurueck.disabled = knopfWeiter.disabled = true; return; }
    var abstand = parseFloat(getComputedStyle(spur).columnGap) || 0;
    var breite = karten[0].getBoundingClientRect().width + abstand;
    var erstes = Math.min(n - 1, Math.round(spur.scrollLeft / breite));
    var sichtbar = Math.max(1, Math.floor((spur.clientWidth + abstand + 2) / breite));
    var letztes = Math.min(n, erstes + sichtbar);
    leisteInfo.textContent = (n === 1 ? BG.t('1 Bild', '1 photo')
      : BG.t('Bilder ', 'Photos ') + (erstes + 1) + '–' + letztes + BG.t(' von ', ' of ') + n);
    knopfZurueck.disabled = spur.scrollLeft <= 2;
    knopfWeiter.disabled = spur.scrollLeft + spur.clientWidth >= spur.scrollWidth - 2;
  }
  var infoTimer;
  spur.addEventListener('scroll', function () { clearTimeout(infoTimer); infoTimer = setTimeout(seitenInfo, 60); });
  window.addEventListener('resize', seitenInfo);
  knopfZurueck.addEventListener('click', function () { spur.scrollBy({ left: -spur.clientWidth, behavior: 'smooth' }); });
  knopfWeiter.addEventListener('click', function () { spur.scrollBy({ left: spur.clientWidth, behavior: 'smooth' }); });

  /* Klick auf ein Bild der Leiste → zum Punkt springen und öffnen */
  spur.addEventListener('click', function (e) {
    var b = e.target.closest('.karte-leiste-bild');
    if (!b) return;
    var m = motiveMitOrt.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    if (!m) return;
    var g = m._gruppe;
    var oben = kartenElement.getBoundingClientRect().top;
    if (oben < 0 || oben > window.innerHeight * 0.5) kartenElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    karte.closePopup();
    if (g.ort.polygon && g.element.getBounds) karte.fitBounds(g.element.getBounds(), { padding: [40, 40], maxZoom: 15 });
    else if (g.ort.bereich && g.element.getBounds) karte.fitBounds(g.element.getBounds(), { padding: [20, 20], maxZoom: 14 });
    else karte.setView([g.ort.lat, g.ort.lng], Math.max(karte.getZoom(), 16));
    karte.once('moveend', function () { g.element.openPopup(); });
    // Falls die Karte schon an der Stelle war, gibt es kein moveend
    setTimeout(function () { if (!g.element.isPopupOpen()) g.element.openPopup(); }, 700);
  });

  /* Beim Öffnen eines Punktes dessen Bilder in der Leiste hervorheben */
  function leisteMarkieren(gruppe) {
    if (!spur) return;
    var ids = gruppe.motive.map(function (m) { return m.id; });
    var erstes = null;
    spur.querySelectorAll('.karte-leiste-bild').forEach(function (el) {
      var an = ids.indexOf(el.getAttribute('data-id')) !== -1;
      el.classList.toggle('aktiv', an);
      if (an && !erstes) erstes = el;
    });
    if (erstes) {
      var links = erstes.offsetLeft - spur.offsetLeft;
      if (links < spur.scrollLeft || links > spur.scrollLeft + spur.clientWidth - erstes.offsetWidth) {
        spur.scrollTo({ left: links, behavior: 'smooth' });
      }
    }
  }
  karte.on('popupclose', function () {
    spur.querySelectorAll('.karte-leiste-bild.aktiv').forEach(function (el) { el.classList.remove('aktiv'); });
  });

  ortKnoepfe.addEventListener('click', function (e) {
    var b = e.target.closest('.karte-ort');
    if (!b) return;
    var r = b.getAttribute('data-region') || null;
    filter.region = (r && filter.region !== r) ? r : null;
    knoepfeZeichnen();
    var liste = leisteZeichnen();
    if (filter.region || filter.suche) zuTreffernZoomen(liste);
    else zeigeHalstenbek();
  });

  var suchTimer;
  if (suchFeld) {
    suchFeld.addEventListener('input', function () {
      clearTimeout(suchTimer);
      suchTimer = setTimeout(function () {
        filter.suche = normal(suchFeld.value).trim();
        var liste = leisteZeichnen();
        if (liste.length && (filter.suche || filter.region)) zuTreffernZoomen(liste);
      }, 250);
    });
  }

  knoepfeZeichnen();
  leisteZeichnen();
  if (zielId) {
    var ziel = motiveMitOrt.filter(function (m) { return m.id === zielId; })[0];
    if (ziel) leisteMarkieren(ziel._gruppe);
  }
}); // Ende BG.bereit
