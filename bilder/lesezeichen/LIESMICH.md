# Lesezeichen-Bilder

In diesen Ordner kommen die Produktfotos der Lesezeichen für den Shop.
(Diese Datei sorgt nur dafür, dass es den Ordner auf GitHub gibt —
leere Ordner speichert Git nicht. Einfach liegen lassen.)

## So verknüpfst du ein Bild mit dem richtigen Motiv

Die Datei heißt **genau wie die `id` des Motivs** in `galerie-daten.js`:

| Motiv in galerie-daten.js | Bilddatei hier             |
|---------------------------|----------------------------|
| `id: 'teichleben1'`       | `teichleben1.jpg`          |
| `id: 'gartenleben8'`      | `gartenleben8.jpg`         |
| `id: 'reduktion3'`        | `reduktion3.jpg`           |

Dann in derselben Zeile in `galerie-daten.js`:
`bereitsLesezeichen: true, bestandLesezeichen: 50` — fertig.

## Worauf achten

- **Kleinschreibung, Endung `.jpg`** (nicht `.JPG`, nicht `.jpeg`) —
  GitHub Pages unterscheidet Groß/Klein, `Teichleben1.JPG` wird nicht
  gefunden.
- **Format ist egal** (hochkant, quer, freigestellt, im Buch liegend) —
  der Shop zeigt das ganze Bild ohne Beschnitt.
- **Größe:** ca. 1000–1400 px an der langen Seite, als JPG mit ~80 %
  Qualität exportiert, reicht völlig. Ziel unter 300 KB pro Bild.
- **sRGB**, nicht die CMYK-Druckdatei von Peterprint.
- Fehlt ein Bild noch, zeigt der Shop einen hochkanten Ausschnitt des
  Galeriefotos mit dem Hinweis „Beispielansicht" — nichts geht kaputt.

## Andere Dateinamen (optional)

Willst du eine Datei anders nennen (z. B. `.png`), gib den Pfad in der
Motivzeile in `galerie-daten.js` selbst an:
`bildLesezeichen: 'bilder/lesezeichen/mein-name.png'`

## Übersichtsbild für die Startseite

Die Kachel „Lesezeichen" auf der Startseite nutzt ein eigenes Bild:
**`bilder/lesezeichen.jpg`** (also eine Ebene höher, direkt in
`bilder/`, nicht in diesem Ordner). Am besten ein Foto mit mehreren
Lesezeichen nebeneinander. Solange es fehlt, wird `bilder/sticker.jpg`
angezeigt.
