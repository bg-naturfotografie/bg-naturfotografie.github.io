/* ============ GALERIE AUS daten/motive.json AUFBAUEN ============
   Sucht eine .masonry mit data-galerie-kategorie und füllt sie mit
   allen passenden Bildern aus GALERIE_BILDER (bereitgestellt von
   daten.js). Neue Fotos trägst du im Admin-Bereich unter "Motive"
   ein — sie tauchen automatisch hier UND im Shop auf.

   Alles läuft in BG.bereit(…): erst wenn die Daten geladen sind. */
BG.bereit(function () {

/* ---- Name, Beschreibung und "Weiter zu …" aus den Serien ---- */
(function serienTexte() {
  var masonry = document.querySelector('.masonry[data-galerie-kategorie]');
  if (!masonry || typeof SERIEN === 'undefined' || !SERIEN.length) return;
  var id = masonry.getAttribute('data-galerie-kategorie');
  var index = -1;
  SERIEN.forEach(function (s, i) { if (s.id === id) index = i; });
  if (index === -1) return;
  var serie = SERIEN[index];

  var h1 = document.getElementById('serie-name');
  var kurz = document.getElementById('serie-kurz');
  if (h1) h1.textContent = serie.name;
  if (kurz) kurz.textContent = serie.kurz;

  // Nächste Serie in der Reihenfolge des Admin-Bereichs (nach der letzten wieder die erste)
  var naechste = SERIEN[(index + 1) % SERIEN.length];
  var titel = document.getElementById('naechste-titel');
  var text = document.getElementById('naechste-kurz');
  var link = document.getElementById('naechste-link');
  if (naechste && naechste !== serie && naechste.seite) {
    if (titel) titel.textContent = BG.t('Weiter zu ', 'On to ') + naechste.name;
    if (text) text.textContent = naechste.kurz;
    if (link) {
      link.textContent = BG.t(naechste.name + ' ansehen', 'View ' + naechste.name);
      link.href = naechste.seite + (BG.sprache === 'en' ? '?lang=en' : '');
    }
  }
})();

(function renderGalerieAusDaten() {
  var masonry = document.querySelector('.masonry[data-galerie-kategorie]');
  if (!masonry || typeof GALERIE_BILDER === 'undefined') return;

  var kategorie = masonry.getAttribute('data-galerie-kategorie');
  var bilder = GALERIE_BILDER.filter(function (b) { return b.kategorie === kategorie; });

  function escapeAttr(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  masonry.innerHTML = bilder.map(function (b) {
    var cap = b.beschriftung ? '<figcaption>' + b.beschriftung + '</figcaption>' : '';
    var imShop = b.imShop !== false; // Standard: true, außer explizit auf false gesetzt
    var badge = imShop
      ? '<a class="shop-badge" href="produkte-bestellen.html#motiv-' + escapeAttr(b.id) + '" title="' + BG.t('Im Shop erhältlich', 'Available in the shop') + '" aria-label="' + BG.t('Im Shop erhältlich — springt zum Motiv im Shop', 'Available in the shop — jumps to this motif in the shop') + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8h12l-1 12H7L6 8z"></path><path d="M9 8a3 3 0 0 1 6 0"></path></svg>' +
        '</a>'
      : '';
    var story = '<a class="story-badge" href="geschichte.html?id=' + escapeAttr(b.id) + '" title="' + BG.t('Geschichte lesen', 'Read the story') + '" aria-label="' + BG.t('Geschichte zu diesem Foto lesen', 'Read the story behind this photo') + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' +
      '</a>';
    return '<figure class="m-item">' + badge + story + '<img src="' + escapeAttr(BG.klein(b.bild)) + '"' + BG.bildFallback(b.bild) + ' alt="' + escapeAttr(b.alt) + '" loading="lazy">' + cap + '</figure>';
  }).join('');
})();

/* ============ ZUFÄLLIGE REIHENFOLGE BEI JEDEM AUFRUF ============ */
(function shuffleMasonry() {
  var masonry = document.querySelector('.masonry');
  if (!masonry) return;

  var items = Array.prototype.slice.call(masonry.children);

  // Fisher-Yates-Shuffle: jede Reihenfolge gleich wahrscheinlich
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }

  // Elemente in neuer Reihenfolge wieder einsetzen
  items.forEach(function (item) {
    masonry.appendChild(item);
  });
})();

/* ============ LIGHTBOX FÜR MASONRY-GALERIEN ============
   Wird auf jeder Unterseite eingebunden, die eine .masonry-Galerie
   und das zugehörige .lightbox-Markup enthält. Keine Abhängigkeiten. */
(function () {
  var lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  var lbImg = lightbox.querySelector('img');
  var lbCap = lightbox.querySelector('figcaption');
  var closeBtn = lightbox.querySelector('.lightbox-close');

  function openLightbox(img) {
    var item = img.closest('.m-item');
    var cap = item ? item.querySelector('figcaption') : null;

    // data-full erlaubt optional eine höher aufgelöste Version fürs Lightbox-Bild,
    // z. B. <img src="bilder/foo-klein.jpg" data-full="bilder/foo-groß.jpg">
    lbImg.src = img.dataset.full || img.currentSrc || img.src;
    lbImg.alt = img.alt || '';

    if (lbCap) {
      lbCap.innerHTML = cap ? cap.innerHTML : '';
      lbCap.style.display = cap ? '' : 'none';
    }

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('.masonry img').forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  // Klick auf den Hintergrund (nicht auf das Bild) schließt das Lightbox
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // ESC schließt das Lightbox
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
})();

}); // Ende BG.bereit
