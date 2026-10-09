> **Hinweis (09.10.2026):** Inhalte wie Termine, Motive, Preise, Geschichten und Texte pflegst du inzwischen im Admin-Bereich unter `bg-naturfotografie.de/admin/`. `galerie-daten.js`, `produkte-daten.js` und `startseite-bilder.js` gibt es nicht mehr — die Daten stehen jetzt in `daten/*.json`. Alles Aktuelle steht in **ANLEITUNG-ADMIN.md**; Stellen hier, die die alten Dateien nennen, sind überholt.

# Umbau: Entschlackung, Fokus auf Fotos und Verkauf

Stand: 26.08.2026

**Alle QR-Adressen sind unverändert geblieben.** Dateinamen,
Parameter (`?id=`, `?motiv=`, `?anliegen=`) und Sprungmarken
(`#motive`, `#sticker`, `#merch`, `#kontakt-anfrage`, `#motiv-<id>`,
`#galerie`, `#ueber-mich`, `#termine`, `#kontakt`) stehen exakt wie
vorher. Geändert wurden Aussehen und Textmenge — nichts, was auf
einem gedruckten Code landet.

Zur Sicherheit habe ich sogar die alten Sprungmarken der
Startseiten-Galerie (`#teichleben`, `#gartenleben`, `#waldleben`,
`#reduktion`) beibehalten: Sie zeigen jetzt auf die jeweilige
Serien-Kachel.

---

## Diese Dateien hochladen

```
styles.css
index.html
startseite-bilder.js   <-- NEU
geschichte.html
geschichte.js
geschichten.html
karte.html
galerie-teichleben.html
galerie-gartenleben.html
galerie-waldleben.html
galerie-reduktion.html
produkte-bestellen.html
404.html
agb.html
datenschutz.html
impressum.html
fuer-veranstalter.html
portfolio-veranstalter.html
```

Die letzten sieben haben **nur ein neues Menü** bekommen (siehe
unten), inhaltlich ist dort nichts angefasst. `galerie-daten.js`,
`produkte-daten.js`, `gallery.js`, `geschichten.js`, `karte.js`,
`qr-werkzeug.js` und der Ordner `schriften/` bleiben unverändert —
die musst du nicht neu hochladen.

---

## Nachtrag 26.08. — deine fünf Punkte

1. **Bühnenbilder wählst du jetzt selbst** — in der neuen Datei
   `startseite-bilder.js`. Dort trägst du Motiv-IDs ein, legst die
   Reihenfolge fest und stellst pro Bild den Bildausschnitt ein.
   Alles ist in der Datei erklärt. Leere Liste = Automatik wie
   bisher.
2. **Der Text über den Bühnenbildern liegt in einem eigenen
   Kasten** (dunkel, leicht weichgezeichnet, orange Kante links).
   Er ist damit auch auf Schnee oder hellem Himmel lesbar.
3. **Die Galerie ist komplett auf deine alte Aufteilung zurück.**
   Auf der Startseite wieder die vier Kategorieblöcke mit dem hohen
   Bild links und den zwei Querformaten rechts — mit genau deiner
   ursprünglichen Bildauswahl und Beschriftung. Auf den
   Serien-Seiten wieder vier Spalten am PC, drei ab 900 px, zwei ab
   600 px, Bildunterschrift unter dem Foto.
4. **Die Bestell-Mechanik ist von der Startseite verschwunden.**
   Die Aufklapper "So läuft eine Bestellung ab" und "Staffelpreise
   & Versand" sind raus — die Preise stehen ohnehin an den
   Kacheln, alles Weitere steht im Shop.
5. **Der Schleier ist weg.** Ich hatte die Bühnenbilder mit
   `brightness(.8)` abgedunkelt, damit die Schrift lesbar bleibt.
   Durch den Textkasten aus Punkt 2 braucht es das nicht mehr —
   die Fotos laufen jetzt unbearbeitet. Auch die Serien-Kacheln
   sind von 72 % auf 92 % Helligkeit hoch.

---

## Was sich geändert hat

### Startseite

Der alte Kopf (abstrakte Farbkreise, Logo, Fließtext) ist raus.
Stattdessen ein bildschirmfüllendes Foto, das langsam durch fünf
Motive wechselt. Darunter steht eine kurze Monospace-Zeile mit
**Serie und echtem Aufnahmeort** des gerade gezeigten Bildes —
anklickbar, führt direkt zur Geschichte genau dieses Motivs.

Bilder, Orte und Ziel kommen live aus `galerie-daten.js`. Du
pflegst also weiterhin nur diese eine Datei. Bevorzugt gezeigt
werden Motive mit `bereitsPostkarte: true` — die Startseite zeigt
damit von selbst das, was du auch wirklich verkaufen kannst.

Weiter unten:

- **Die vier Einstiegs-Textkarten sind ersatzlos gestrichen.** Sie
  haben erklärt, was die Seite auch ohne Erklärung zeigt.
- **Galerie**: unverändert gegenüber vorher — deine vier
  Kategorieblöcke. Nur der große zentrierte Abschnittskopf ist
  einer schmalen Rubrikzeile gewichen.
- **Mitnehmen**: drei Kacheln mit **echten Preisen direkt am Bild**
  (2,50 € / 15,00 €) statt Preisen zwei Klicks später.
- **Über mich**: von einem langen Absatz plus Infokarten auf drei
  Sätze gekürzt. Tierschutz-Haltung und Schwerpunkte stecken in
  Aufklappern.
- **Termine**: Liste statt Karten, Veranstalter-Infos aufklappbar.
- **Menü**: von sieben auf fünf Punkte (Galerie, Shop, Geschichten,
  Karte, Über mich). Termine und Kontakt stehen weiterhin auf der
  Seite und im Fußbereich.

### Geschichte-Seite (`geschichte.html`)

Das ist die Seite, auf der jeder QR-Scan landet — sie hat deshalb
am meisten bekommen:

**Neu: eine Kaufbox unter dem Text.** `geschichte.js` setzt deren
Link auf genau das gescannte Motiv im Shop
(`produkte-bestellen.html#motiv-<id>`). Wer die Postkarte in der
Hand hält, ist damit einen Klick vom A4-Poster entfernt. Ist ein
Motiv nicht im Shop (`imShop: false`), verschwindet die Box
automatisch.

### Serien-Seiten

Engere Bildwand (6 px Fuge statt 8 px, drei Spalten), Bild­unter­schrift
erscheint erst beim Darüberfahren — auf dem Handy bleibt sie
sichtbar. Der Hinweis zu Vorschaubildern und den beiden Symbolen
ist in einen Aufklapper gewandert. Neu am Seitenende: Weiterleitung
zur nächsten Serie.

### Shop (`produkte-bestellen.html`)

Rund 2.600 Zeichen Text weniger. Die Merch-Textwand ist ein
Aufklapper geworden, die Staffelpreis-Zeile und die
Herkunfts-Legende sind zu einer ruhigen Zeile zusammengezogen.

**Funktion, Auswahl-Logik, Staffelpreise, Formular und alle
Sprungmarken laufen unverändert.** Die doppelten Aufklapper-Stile,
die vorher nur in dieser Datei standen, liegen jetzt zentral in
`styles.css` — sie werden auch auf der Startseite und den
Serien-Seiten benutzt.

### Gestaltung allgemein

- Fotos ohne runde Ecken und ohne Rahmen — wie Abzüge.
- Hintergrund eine Spur tiefer und neutraler (`#0E110C` statt
  `#11140F`), damit die matten Bilder mehr Farbe bekommen.
- Markenfarben unverändert: Waldgrün, Eichhorn-Rost, Raureif.
- Große, zentrierte Sektionsköpfe sind durch schmale Rubrik-Zeilen
  ersetzt (Haarlinie, links die Rubrik, rechts ein Kurzlink).
- Wiederkehrendes Mittel: die "Feldnotiz" in JetBrains Mono —
  überall dort, wo etwas benannt statt erzählt wird.

---

## Was du weiterhin selbst pflegst

Nichts Neues. Wie vorher:

- **Neue Fotos** → nur `galerie-daten.js`. Sie erscheinen dann
  automatisch in der Serie, im Shop, auf der Karte, im QR-Werkzeug
  **und jetzt zusätzlich in der Bühne und den Serien-Kacheln der
  Startseite**.
- **Geschichten-Texte** → Google-Tabelle, unverändert.
- **Termine** → in `index.html` im Abschnitt `id="termine"` ein
  `<li>` nach demselben Muster ergänzen, vergangene löschen.
