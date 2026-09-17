/* ============================================================
   GALERIE-BILDER — einzige Datei, die du für neue Fotos pflegst!
   ============================================================

   Diese Liste ist die GEMEINSAME Quelle für zwei Dinge:
   1. Die Galerie-Unterseiten (galerie-teichleben.html,
      galerie-gartenleben.html, ...) — sie lesen daraus und bauen
      ihre Bilder-Wand automatisch auf (siehe gallery.js).
   2. Den Shop (produkte-bestellen.html) — der Bereich "Poster &
      Postkarten" zeigt automatisch JEDES Bild aus dieser Liste an.
      Kein zusätzlicher Eintrag im Shop nötig!

   NEUES FOTO ZUR GALERIE HINZUFÜGEN — SO GEHST DU VOR:
   1. Bilddatei in den passenden Ordner legen, z. B.
      bilder/teichleben/neuesbild.jpg
   2. Hier unten eine neue Zeile in der passenden Kategorie
      ergänzen (id, kategorie, bild-Pfad, alt-Text, beschriftung).
   3. Datei speichern, hochladen — fertig. Taucht automatisch in
      der Galerie-Unterseite UND im Shop unter Poster/Postkarten auf.

   FELDER:
   - alt: Alternativtext fürs Bild (Barrierefreiheit/SEO) — kurzer,
     sachlicher Satz.
   - beschriftung: Die kurze Bildunterschrift, die in der Galerie
     als Figcaption erscheint UND im Shop als Produktname für
     Poster/Postkarte dient. Darf HTML enthalten, z.B.
     "<b>Rotkehlchen</b> · Ast".
   - bereitsPostkarte:
     - true  → Motiv ist schon als gedruckte Postkarte auf Lager,
               bekommt im Shop ein ★ ("sofort versandfertig").
     - false → Motiv gibt's noch nicht als Postkarte gedruckt; wird
               bei Bestellung erst in Auftrag gegeben (etwas längere
               Lieferzeit).
   - bestand: die genaue Stückzahl, die du gerade als fertige
     Postkarte zu Hause liegen hast. Nur relevant, wenn
     bereitsPostkarte true ist.
     - Zahl (z. B. 8) → Shop zeigt "Noch 8 auf Lager". Da es keinen
       automatischen Checkout gibt, zählst du diese Zahl selbst
       manuell runter, wenn du eine Bestellung bestätigst.
     - null → du kennst die genaue Zahl noch nicht, Shop zeigt
       einfach "Vorrätig" ohne Zahl.
     - 0 → ist zwar als Postkarte im Sortiment, aber gerade
       ausverkauft. Shop zeigt "Wird nachbestellt · ca. 1–2 Wochen".

   - bereitsPoster / bestandPoster: exakt dasselbe Prinzip, nur für
     Poster (nur noch EIN Format: A4). Poster sind seit der
     Umstellung KEINE Einzelanfertigung mehr, sondern werden von dir
     genau wie Postkarten in Auflage vorbestellt und aus dem Lager
     verkauft.
     - bereitsPoster: true  → Motiv liegt als gedrucktes A4-Poster
       bei dir (Massendruck). Bekommt im Shop ein ★, wenn Poster
       ausgewählt ist.
     - bereitsPoster: false → Motiv gibt's noch nicht als Poster;
       Shop zeigt "Wird nachgedruckt · ca. 1–2 Wochen". Du bestellst
       es dann in der nächsten Sammelbestellung mit.
     - bestandPoster: Stückzahl wie oben (Zahl / null / 0).

     👉 Aktuell steht bei ALLEN Motiven bereitsPoster: false und
     bestandPoster: 0, weil ich nicht weiß, welche Poster du schon
     gedruckt zu Hause hast. Einmal durchgehen und die passenden
     Zeilen umstellen — das ★ und die Lager-Anzeige richten sich
     danach.

     Sonderformate (A3, A5, gerahmt, ...) gibt es bewusst nicht mehr
     im Shop — die laufen über das Anfrageformular.

   - bereitsLesezeichen / bestandLesezeichen: dasselbe Prinzip noch
     einmal, diesmal für Lesezeichen (5 × 18 cm, Peterprint).
     WICHTIGER UNTERSCHIED zu Postkarte/Poster: Ein Lesezeichen
     erscheint im Shop NUR, wenn es davon wirklich eine Auflage gibt
     (bereitsLesezeichen: true). Motive ohne Lesezeichen tauchen im
     Lesezeichen-Bereich gar nicht erst auf — es wird also nichts
     "auf Verdacht" angeboten, was es nie gab.
     - bereitsLesezeichen: true  → aus diesem Foto wurde ein
       Lesezeichen gemacht, es steht im Shop unter "Lesezeichen".
     - bereitsLesezeichen: false → kein Lesezeichen (Standard).
     - bestandLesezeichen: wie viele Lesezeichen dieses Motivs du
       gerade zu Hause hast (Zahl / null / 0, genau wie bei bestand).
       0 → Shop zeigt "Gerade vergriffen · wird nachgedruckt".

     DAS LESEZEICHEN-BILD (eigenes Foto, NICHT das Galeriebild):
     Lege es in den Ordner  bilder/lesezeichen/  und benenne die
     Datei exakt wie die id des Motivs, z. B.
         id: 'teichleben1'  →  bilder/lesezeichen/teichleben1.jpg
     Mehr musst du nicht tun — der Shop findet das Bild über die id
     automatisch. Groß-/Kleinschreibung beachten (GitHub Pages
     unterscheidet das!), Endung .jpg in Kleinbuchstaben.
     Fehlt das Bild noch, zeigt der Shop ersatzweise einen
     hochkanten Ausschnitt des Galeriefotos.

     Nur falls du eine Datei ANDERS benennen willst (z. B. .png oder
     ein sprechender Name), kannst du den Pfad optional selbst
     angeben — dann gilt dieser statt des Automatismus:
         bildLesezeichen: 'bilder/lesezeichen/entchen-lesezeichen.png'

     👉 Aktuell steht bei ALLEN Motiven bereitsLesezeichen: false und
     bestandLesezeichen: 0 — ich weiß nicht, welche 10 Motive deine
     Lesezeichen sind. Bei diesen 10 Zeilen auf true umstellen und
     die Stückzahl eintragen (bei frischer Auflage also 50), dann
     erscheinen sie im Shop automatisch unter "Lesezeichen". Solange
     noch keines auf true steht, zeigt der Bereich nur einen kurzen
     "Folgt in Kürze"-Hinweis.
   - imShop: steuert, ob dieses Motiv im Shop als Postkarte/Poster/
     Download auftaucht. Standard ist true (also automatisch drin,
     wie bisher). Auf false stellen, wenn ein Foto zwar in der
     Galerie gezeigt werden soll, aber (noch) nicht als Produkt
     verkauft werden soll — z. B. ein sehr neues oder ein bewusst
     nur redaktionell genutztes Bild. Die Galerie zeigt es trotzdem
     ganz normal, nur eben ohne den kleinen "Im Shop erhältlich"-
     Hinweis (siehe unten) und ohne Eintrag im Shop selbst.
   - geschichte: die Geschichte hinter dem Foto (ein paar Sätze,
     reiner Text — kein HTML nötig). Wird auf einer eigenen Seite
     (geschichte.html?id=...) angezeigt, die du z. B. per QR-Code
     auf einer gedruckten Postkarte verlinken kannst.
     - null → auf der Galerie erscheint trotzdem der kleine
       "Geschichte"-Button, die Seite zeigt dann nur einen
       freundlichen Hinweis, dass die Geschichte noch fehlt.
     - "Text..." → wird 1:1 auf geschichte.html angezeigt.
   - ort: der Ort, an dem das Foto entstanden ist, für die Karte
     (karte.html). null, wenn (noch) kein Ort hinterlegt ist —
     das Motiv taucht dann einfach nicht auf der Karte auf.

     ZWEI MODI:
     1. Punkt (genauer Ort):
        ort: { lat: 53.7297, lng: 9.7975, label: 'Teich in Halstenbek' }
        So findest du Koordinaten: Google Maps öffnen, gewünschte
        Stelle mit Rechtsklick anklicken → die erste Zeile im
        Kontextmenü zeigt "lat, lng" zum Kopieren an.

     2. Gebiet (ungefähre Gegend, z. B. "Hamburger Westen" oder
        "Schottische Küste" — wenn du keinen exakten Punkt setzen
        willst). Zwei Varianten:

        a) Einfacher Kreis:
           ort: { lat: 53.65, lng: 9.75, label: 'Hamburger Westen', bereich: true, radius: 6000 }
           lat/lng sind hier nur der ungefähre Mittelpunkt, radius
           in Metern bestimmt die Größe des weichen Kreises.

        b) Frei gezeichnete Fläche (z. B. entlang eines Stadtteils):
           ort: { label: 'Schenefeld', bereich: true, polygon: [[53.65,9.79],[53.66,9.81], ...] }
           Diesen Code musst du nicht von Hand schreiben — öffne
           gebiet-zeichnen.html (nicht verlinkt, nur für dich),
           zeichne dort die Fläche mit der Maus ein, und kopiere
           den fertig erzeugten Code direkt hier hinein.

   WICHTIG FÜR DICH GERADE JETZT: Du hast 26 Motive bereits als
   Postkarte auf Lager. Unten steht erstmal bei ALLEN Motiven
   "bereitsPostkarte: false" und "bestand: 0", weil ich nicht weiß,
   welche 26 der 28 Motive das genau sind. Bitte bei den passenden
   Zeilen "bereitsPostkarte" auf true umstellen und bei "bestand"
   deine echte Stückzahl eintragen (oder null, wenn du sie gerade
   nicht weißt) — dann erscheint dort automatisch das ★ im Shop.
   ============================================================= */

const GALERIE_BILDER = [

  // ---- Teichleben ----
  { id: 'teichleben1', kategorie: 'Teichleben', bild: 'bilder/teichleben/entchen1.jpg', alt: 'Entchen Nahaufnahme frontal', beschriftung: '<b>Entenküken</b> · Nahaufnahme', bestand: 49, bereitsPostkarte: true, bestandPoster: 20, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61357354805459, lng: 9.848578922235502, label: 'im Wasser schwimmend' } },
  { id: 'teichleben2', kategorie: 'Teichleben', bild: 'bilder/teichleben/entchen2.jpg', alt: 'schlafendes Gänseküken neben Gänseblümchen', beschriftung: '<b>Gänseküken</b> · schlafend bei Gänseblümchen', bestand: 49, bereitsPostkarte: true, bestandPoster: 20, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { label: 'Hamburger Westen', bereich: true, polygon: [[53.56588, 9.73595], [53.57465, 9.73869], [53.58199, 9.7514], [53.58791, 9.77337], [53.5873, 9.80049], [53.5873, 9.82967], [53.58872, 9.84135], [53.60034, 9.85886], [53.61053, 9.87259], [53.61502, 9.8925], [53.61828, 9.91997], [53.61481, 9.94228], [53.60749, 9.967], [53.59546, 9.98245], [53.57547, 9.99069], [53.55221, 9.97833], [53.54465, 9.96563], [53.5414, 9.92443], [53.54201, 9.87568], [53.54487, 9.85062], [53.5514, 9.80839], [53.55854, 9.77509], [53.56548, 9.73595]] } },
  { id: 'teichleben3', kategorie: 'Teichleben', bild: 'bilder/teichleben/entchen3.jpg', alt: 'zwei Entenküken am Ufer eines Teichs', beschriftung: '<b>Entenküken</b> · Sonnenbaden', bestand: 29, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.609464, lng: 9.823733, label: 'Friedrichshulder See' } },
  { id: 'teichleben4', kategorie: 'Teichleben', bild: 'bilder/teichleben/ente1.jpg', alt: 'Stockente breitet die Flügel auf dem Wasser aus', beschriftung: '<b>Stockente</b> · Flügelzauber', bestand: 30, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.609383, lng: 9.822356, label: 'Friedrichshulder See' } },
  { id: 'teichleben5', kategorie: 'Teichleben', bild: 'bilder/teichleben/reiher1.jpg', alt: 'Reiher im Winter im Wasser stehend', beschriftung: '<b>Reiher</b> · Winterkälte', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.613876, lng: 9.848697, label: 'Teich in Halstenbek im Winter' } },
  { id: 'teichleben6', kategorie: 'Teichleben', bild: 'bilder/teichleben/reiher.jpg', alt: 'Reiher im Wasser stehend mit Grünschimmer', beschriftung: '<b>Reiher</b> · Frühlingsgrün', bestand: null, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.613800, lng: 9.848238, label: 'Teich in Halstenbek im Sommer' } },
  { id: 'teichleben7', kategorie: 'Teichleben', bild: 'bilder/teichleben/blaesshuhn1.jpg', alt: 'Blässhuhn frontal schwimmend', beschriftung: '<b>Blässhuhn</b> · schwimmend', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.609430, lng: 9.822364, label: 'Friedrichshulder See' } },
  { id: 'teichleben8', kategorie: 'Teichleben', bild: 'bilder/teichleben/puffin.jpg', alt: 'Papageientaucher auf Felsvorsprung', beschriftung: '<b>Papageientaucher</b> · Brutkolonie Schottland', bestand: 30, bereitsPostkarte: true, bestandPoster: 8, bereitsPoster: true, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 58.640829, lng: -3.026797, label: 'Schottische Küste', bereich: true, radius: 2500 } },
  { id: 'teichleben9', kategorie: 'Teichleben', bild: 'bilder/teichleben/reiher3.jpg', alt: 'Reiher im Baum', beschriftung: '<b>Reiher</b> · im Baum', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.609430, lng: 9.822364, label: 'Friedrichshulder See' } },
  { id: 'teichleben10', kategorie: 'Teichleben', bild: 'bilder/teichleben/ente2.jpg', alt: 'Stockente schüttelnd und Flügelschlagend auf einem See', beschriftung: '<b>Stockente</b> · flügelschlagend im Moor', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.74068, lng: 9.86683, label: 'Himmelmoor' } },
  
   // ---- Gartenleben ----
  { id: 'gartenleben1', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/rotkehlchen1.jpg', alt: 'Rotkehlchen sitzt ruhig auf einem Ast im Garten', beschriftung: '<b>Rotkehlchen</b> · Ast', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte:  null, ort: { lat: 53.61409, lng: 9.84706, label: 'Am Bocksberger Moor' } },
  { id: 'gartenleben2', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/kohlmeise1.jpg', alt: 'Kohlmeise zwischen grünen Blättern im Garten', beschriftung: '<b>Kohlmeise</b> · im Grünen', bestand: 30, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61304, lng: 9.8486, label: 'Halstenbek und Schenefeld Grenze' } },
  { id: 'gartenleben3', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/blaumeise1.jpg', alt: 'Blaumeise sitzt als Ausguck auf einem Zweig', beschriftung: '<b>Blaumeise</b> · Ausguck', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61286, lng: 9.84956, label: 'Halstenbek, Trampelpfad' } },
  { id: 'gartenleben4', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/blaumeise2.jpg', alt: 'Blaumeise zwischen Frühlingsknospen', beschriftung: '<b>Blaumeise</b> · Frühlingsknospen', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61286, lng: 9.84956, label: 'Halstenbek, Trampelpfad' } },
  { id: 'gartenleben5', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/eichelhaeher1.jpg', alt: 'Eichelhäher im Porträt beim Knacken einer Eichel', beschriftung: '<b>Eichelhäher</b> · Fressen knacken', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61457, lng: 9.84683, label: 'Wiese beim Blocksberger Moor' } },
  { id: 'gartenleben6', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/schwanzmeise1.jpg', alt: 'Schwanzmeise sucht auf einem Zweig nach Nahrung', beschriftung: '<b>Schwanzmeise</b> · auf Nahrungsjagd', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.60933, lng: 9.82227, label: 'vor dem Friedrichshulder See' } },
  { id: 'gartenleben7', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/schwanzmeise2.jpg', alt: 'Schwanzmeise zwischen dichten Zweigen', beschriftung: '<b>Schwanzmeise</b> · in Zweigen', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.61482, lng: 9.84667, label: 'vor Baumschulen, Halstenbek' } },
  { id: 'gartenleben8', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/schwanzmeise3.jpg', alt: 'Neugierig blickende Schwanzmeise auf einem Zweig', beschriftung: '<b>Schwanzmeise</b> · neugierig', bestand: 31, bereitsPostkarte: true, bestandPoster: 8, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61101, lng: 9.80525, label: 'An der LSE' } },
  { id: 'gartenleben9', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/zaunkoenig1.jpg', alt: 'Zaunkönig im Spagat zwischen zwei Zweigen im Gebüsch', beschriftung: '<b>Zaunkönig</b> · Höhen-Spagat', bestand: 31, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61243, lng: 9.85308, label: 'Am Ahornweg Halstenbek1' } },
  { id: 'gartenleben10', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/sumpfmeise1.jpg', alt: 'Sumpfmeise im Wurzelwerk am Boden', beschriftung: '<b>Sumpfmeise</b> · Wurzelwerk', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61022, lng: 9.82328, label: 'Am Friedrichshulder See2' } },
  { id: 'gartenleben11', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/schmetterling1.jpg', alt: 'Tagpfauenauge saugt mit ausgebreiteten Flügeln Nektar', beschriftung: '<b>Tagpfauenauge</b> · ruhiger Snack', bestand: 30, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.612, lng: 9.8533, label: 'versteckter Pfad' } },
  { id: 'gartenleben12', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/schmetterling2.jpg', alt: 'Tagpfauenauge mit leuchtender Flügelzeichnung', beschriftung: '<b>Tagpfauenauge</b> · Farbenspiel', bestand: 31, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.612, lng: 9.8533, label: 'versteckter Pfad' } },
  { id: 'gartenleben13', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/rotkehlchen2.jpg', alt: 'Rotkehlchen zwischen grünen Blättern', beschriftung: '<b>Rotkehlchen</b> · Blattgesang', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.6086, lng: 9.82483, label: 'Am Pferdehof' } },
  { id: 'gartenleben14', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/rotkehlchen3.jpg', alt: 'Junges Rotkehlchen mit aufgeplustertem Gefieder', beschriftung: '<b>Rotkehlchen</b> · unschuldig', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.59253, lng: 9.84181, label: 'Am Schack-See' } },
  { id: 'gartenleben15', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/katze1.jpg', alt: 'Schwarze Katze im Halbschatten zwischen Gartenpflanzen', beschriftung: '<b>schwarze Katze</b> · dunkles Versteck', bestand: 31, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.60864, lng: 9.80956, label: 'Voßbargweide' } },
  { id: 'gartenleben16', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/goldammer1.jpg', alt: 'Singende Goldammer mit gelbem Kopfgefieder auf einem Zweig', beschriftung: '<b>Goldammer</b> · Solo Gesang', bestand: 31, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.59815, lng: 9.74716, label: 'Nahe des Wildgeheges Klövensteen' } },
  { id: 'gartenleben17', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/dorngrasmuecke1.jpg', alt: 'Singende Dorngrasmücke in einem Strauch', beschriftung: '<b>Dorngrasmücke</b> · singend', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.60881, lng: 9.80292, label: 'Zwischen Wiesen und Feldern Schenefeld' } },
  { id: 'gartenleben18', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/schwanzmeise4.jpg', alt: 'Schwanzmeise im Flug frontal in Kamera schauend', beschriftung: '<b>Schwanzmeise</b> · Moment im Flug', bestand: null, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.60933, lng: 9.82227, label: 'vor dem Friedrichshulder See' } },
  { id: 'gartenleben19', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/gimpel3.jpg', alt: 'Gimpel auf einem Zweig im Winter', beschriftung: '<b>Gimpel</b> · Winterstimmung', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61256, lng: 9.85278, label: 'In der Ahornwegkurve' } },
  { id: 'gartenleben20', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/gimpel2.jpg', alt: 'Gimpel auf einem Zweig im Winter, aussehnd wie Elvis', beschriftung: '<b>Gimpel</b> · Elvis Look', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61256, lng: 9.85278, label: 'In der Ahornwegkurve' } },
  { id: 'gartenleben21', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/singdrossel1.jpg', alt: 'singende Singdrossel auf Tannengrün', beschriftung: '<b>Singdrossel</b> · grüner Gesang', bestand: 30, bereitsPostkarte: true, bestandPoster: 8, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61518, lng: 9.84667, label: 'Am Weg bei den Baumschulen' } },
  { id: 'gartenleben22', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/buchfink.jpg', alt: 'Buchfink im Wiesengras, aufgenommen in Schottland', beschriftung: '<b>schottischer Buchfink</b> · natürlicher Look', bestand: 31, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 58.640829, lng: -3.026797, label: 'Schottische Küste', bereich: true, radius: 2500 }  },
  { id: 'gartenleben23', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/kornblume.jpg', alt: 'Blaue Kornblume als Farbakzent im Getreidefeld', beschriftung: '<b>Kornblume</b> · farblicher Akzent', bestand: 30, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.78366, lng: 9.79648, label: 'Am Feldrand in Heede' } },
  { id: 'gartenleben24', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/junger_moench.jpg', alt: 'junge Mönchgrasmücke in grünen Zweigen mit roten Früchten', beschriftung: '<b>Mönchgrasmücke</b> · mit rotem Snack', bestand: 40, bereitsPostkarte: true, bestandPoster: 15, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61263, lng: 9.85239, label: 'Auf dem Spielplatz' } },
  { id: 'gartenleben25', kategorie: 'Gartenleben', bild: 'bilder/gartenleben/junger_moench2.jpg', alt: 'junge Mönchgrasmücke in grünen Zweigen', beschriftung: '<b>Mönchgrasmücke</b> · junge Zuversicht', bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.61263, lng: 9.85239, label: 'Auf dem Spielplatz' } },
   
  // ---- Waldleben ---- (noch keine Fotos — Unterseite galerie-waldleben.html ist technisch bereit)
{ id: 'waldleben1', kategorie: 'Waldleben', bild: 'bilder/waldleben/mission_impossible.jpg', alt: 'Eichhörnchen hängend vom Baum', beschriftung: '<b>Eichhörnchen</b> · Mission Impossible', bestand: 29, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { label: 'Hamburger Westen', bereich: true, polygon: [[53.56588, 9.73595], [53.57465, 9.73869], [53.58199, 9.7514], [53.58791, 9.77337], [53.5873, 9.80049], [53.5873, 9.82967], [53.58872, 9.84135], [53.60034, 9.85886], [53.61053, 9.87259], [53.61502, 9.8925], [53.61828, 9.91997], [53.61481, 9.94228], [53.60749, 9.967], [53.59546, 9.98245], [53.57547, 9.99069], [53.55221, 9.97833], [53.54465, 9.96563], [53.5414, 9.92443], [53.54201, 9.87568], [53.54487, 9.85062], [53.5514, 9.80839], [53.55854, 9.77509], [53.56548, 9.73595]] } },
{ id: 'waldleben2', kategorie: 'Waldleben', bild: 'bilder/waldleben/planning_squirrel.jpg', alt: 'Eichhörnchen mysteriös auf Baum schauend', beschriftung: '<b>Eichhörnchen</b> · plant es etwas?', bestand: 39, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.61393, lng: 9.84892, label: 'Im Waldstück am See' } },    
{ id: 'waldleben3', kategorie: 'Waldleben', bild: 'bilder/waldleben/sleepy_squirrel.jpg', alt: 'Eichhörnchen müde auf Baum sitzend', beschriftung: '<b>Eichhörnchen</b> · entspannt und müde', bestand: 40, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61308, lng: 9.84817, label: 'Blocksberger Moor Kreuzung' } },
{ id: 'waldleben4', kategorie: 'Waldleben', bild: 'bilder/waldleben/specht.jpg', alt: 'Buntspecht schaut aus seiner Baumhöhle heraus', beschriftung: '<b>Specht</b> · Hausbesichtigung', bestand: 31, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61393, lng: 9.84892, label: 'Im Waldstück am See' } },
{ id: 'waldleben5', kategorie: 'Waldleben', bild: 'bilder/waldleben/baum.jpg', alt: 'Einzelne Birke im Moor bei Halstenbek', beschriftung: '<b>Birke</b> · kräftig im Moor', bestand: 28, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.6051, lng: 9.75957, label: 'Im Schnaakenmoor' } },
{ id: 'waldleben6', kategorie: 'Waldleben', bild: 'bilder/waldleben/specht2.jpg', alt: 'Buntspecht klettert an einem verschneiten Stamm', beschriftung: '<b>Buntspecht</b> · Winterstimmung', bestand: 42, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.61295, lng: 9.85151, label: 'Am Fußballfeld' } },
{ id: 'waldleben8', kategorie: 'Waldleben', bild: 'bilder/waldleben/rotkehlchengruen.jpg', alt: 'Rotkehlchen auf einem Ast vor grün leuchtendem Hintergrund', beschriftung: '<b>Rotkehlchen</b> · heldenhafte Pose', bestand: 39, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.60763, lng: 9.79896, label: 'Parkplatz im Klövensteen' } },
    
// ---- Reduktion ---- (noch keine Fotos — Unterseite galerie-reduktion.html ist technisch bereit)
{ id: 'reduktion1', kategorie: 'Reduktion', bild: 'bilder/Reduktion/silhouette_robin.jpg', alt: 'schwarz-weiß Silhouette eines Rotkehlchens', beschriftung: '<b>Rotkehlchen</b> · Michael Jackson', bestand: 31, bereitsPostkarte: true, bestandPoster: 8, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.60878, lng: 9.80491, label: 'Am Feldesrand' } },
{ id: 'reduktion2', kategorie: 'Reduktion', bild: 'bilder/Reduktion/silhouette_singdrossel.jpg', alt: 'schwarz-weiß Silhouette einer Singdrossel', beschriftung: '<b>Singdrossel</b> · Blick nach rechts', bestand: 31, bereitsPostkarte: true, bestandPoster: 8, bereitsPoster: true, bereitsLesezeichen: true, bestandLesezeichen: 49, imShop: true, geschichte: null, ort: { lat: 53.45539, lng: 9.84195, label: 'Fischbeker Heide', bereich: true, radius: 1554 } },
{ id: 'reduktion3', kategorie: 'Reduktion', bild: 'bilder/Reduktion/silhouette_stare.jpg', alt: 'schwarz-weiß Silhouette zweier Stare auf einem Ast', beschriftung: '<b>Stare</b> · minimalistischer Ast-Kampf', bestand: 31, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61229, lng: 9.85326, label: 'Ahornweg' } },
{ id: 'reduktion4', kategorie: 'Reduktion', bild: 'bilder/Reduktion/silhouette_zaunkönig.jpg', alt: 'schwarz-weiß Silhouette eines flügelschlagenden Zaunkönigs', beschriftung: '<b>Zaunkönig</b> · kraftvolle Silhouette', bestand: 31, bereitsPostkarte: true, bestandPoster: 27, bereitsPoster: true, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.61304, lng: 9.8486, label: 'Halstenbek und Schenefeld Grenze' } },
{ id: 'reduktion5', kategorie: 'Reduktion', bild: 'bilder/Reduktion/singdrossel_art.jpg', alt: 'Singdrossel im Apfelbaum mit verdortem Apfel', beschriftung: '<b>Singdrossel</b> · Apfel Dilemma', bestand: 31, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.6069, lng: 9.80855, label: 'Am Islandpferdehof' } },
{ id: 'reduktion6', kategorie: 'Reduktion', bild: 'bilder/Reduktion/Blaesshuhn.jpg', alt: 'Blässhuhn auf dunklem See, reduzierte Aufnahme', beschriftung: '<b>Blässhuhn</b> · dunkle Aura', bestand: 30, bereitsPostkarte: true, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true, geschichte: null, ort: { lat: 53.60933, lng: 9.82227, label: 'vor dem Friedrichshulder See' } },
  // Sobald du diese beiden Galerien mit echten Fotos aufbaust, hier nach
  // demselben Muster ergänzen: { id: ..., kategorie: 'Waldleben', bild: ...,
  // alt: ..., beschriftung: ..., bestand: 0, bereitsPostkarte: false, bestandPoster: 0, bereitsPoster: false, bereitsLesezeichen: false, bestandLesezeichen: 0, imShop: true }

];
