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
