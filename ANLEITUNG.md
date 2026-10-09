> **Hinweis (09.10.2026):** Inhalte wie Termine, Motive, Preise, Geschichten und Texte pflegst du inzwischen im Admin-Bereich unter `bg-naturfotografie.de/admin/`. `galerie-daten.js`, `produkte-daten.js` und `startseite-bilder.js` gibt es nicht mehr — die Daten stehen jetzt in `daten/*.json`. Alles Aktuelle steht in **ANLEITUNG-ADMIN.md**; Stellen hier, die die alten Dateien nennen, sind überholt.

# Anleitung – Deine Naturfoto-Website (Portfolio-Version)

## Was sich geändert hat

Die Seite ist jetzt mehrseitig aufgebaut, um sich weniger wie ein Shop und mehr wie ein
Fotografie-Portfolio anzufühlen:

- `index.html` – Startseite: Hero, vier Galerie-Teaser (je 4 Bilder), ruhiger Bereich „Erhältlich als",
  „Über mich", „Termine", „Kontakt"
- `galerie-teichleben.html`, `galerie-gartenleben.html`, `galerie-waldleben.html`,
  `galerie-silhouetten.html` – je eine Unterseite mit der vollständigen Galerie der jeweiligen Kategorie
  (aktuell 8 Platzhalterbilder, beliebig erweiterbar)
- `styles.css` – das komplette Design, jetzt **eine einzige Datei**, die von allen Seiten gemeinsam
  genutzt wird. Änderst du z. B. eine Farbe hier, wirkt sich das automatisch auf alle Seiten aus –
  du musst nichts mehrfach pflegen.
- `impressum.html`, `datenschutz.html` – unverändert, weiterhin Pflichtseiten (siehe Hinweise dort)

**Wichtig:** Lade beim nächsten Hochladen auf GitHub unbedingt auch die neue `styles.css` und alle
vier `galerie-*.html`-Dateien mit hoch – ohne `styles.css` sieht die Seite unstyled/kaputt aus.

## Bilder einsetzen – jetzt an zwei Stellen pro Kategorie

Jedes Motiv taucht potenziell an zwei Stellen auf:
1. **Startseite** (`index.html`) – nur die 4 stärksten Bilder pro Kategorie, als „Appetithappen"
2. **Galerie-Unterseite** (z. B. `galerie-teichleben.html`) – hier dürfen es ruhig mehr sein

Du kannst (und solltest) auf der Startseite und der Unterseite **unterschiedliche oder überlappende**
Bilder zeigen – die Startseite braucht nicht alle Bilder der Unterseite zu wiederholen. Das Einsetzen
funktioniert genauso wie vorher:

```html
<div class="card">
  <img src="bilder/eichhoernchen-01.jpg" alt="Eichhörnchen frisst Haselnuss im Schnee">
  <span class="tag"><b>Eichhörnchen</b> · Garten, Winter</span>
</div>
```

## Mehr als 8 Bilder auf einer Galerie-Unterseite?

Kein Problem – einfach einen ganzen `<div class="card">...</div>`-Block in der jeweiligen
`galerie-*.html` kopieren und einfügen, dann Bild und Tag anpassen. Das Raster (`.grid`) passt sich
automatisch an, egal ob 8, 12 oder 20 Bilder drin sind.

## Der Bereich „Erhältlich als"

Bewusst zurückhaltend gehalten: keine Preise, keine einzelnen „Anfragen"-Buttons mehr, nur eine ruhige
Aufzählung der Formate plus **ein** Kontakt-Button. Willst du die Liste anpassen (z. B. weil du doch
keine Lesezeichen anbietest), einfach die passende `<li>...</li>`-Zeile in `index.html` löschen oder
ergänzen.

## Rest bleibt wie gewohnt

Werte ändern (Name, E-Mail, Termine) weiterhin per Suche nach `ERSETZEN`. Hosting, Formspree-Einrichtung
und Impressum/Datenschutz-Pflichten: siehe die vorherigen Erklärungen, daran hat sich nichts geändert.
