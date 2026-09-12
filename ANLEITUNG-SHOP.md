# Anleitung: Shop-System pflegen (produkte-bestellen.html)

Diese Anleitung ist NUR für dich (Bene) — Kunden sehen das nicht.

## Das Prinzip — drei Datenquellen, eine Shop-Seite

`produkte-bestellen.html` baut die komplette Shop-Seite automatisch
zusammen. Du musst dafür nur Daten pflegen, nicht HTML anfassen:

1. **`galerie-daten.js`** — deine Fotos. Jedes Bild erscheint
   automatisch auf der Galerie-Unterseite UND im Shop unter
   "Postkarten & Poster", inklusive Auswahl (Postkarte / Poster A4 /
   Download), Mengen-Staffel und Lagerbestand — getrennt für
   Postkarte und Poster.
   Außerdem steht dort pro Motiv, ob es davon Lesezeichen gibt und
   wie viele (`bereitsLesezeichen` / `bestandLesezeichen`) — diese
   Motive erscheinen automatisch im Bereich „Lesezeichen".
2. **`produkte-daten.js`** — Sticker (Liste `STICKER`), die Preise
   (`PREISE`) und die Staffelpreise (`STAFFEL`, inkl. Lesezeichen).
   Merch gibt es hier bewusst nicht mehr, siehe unten.
3. Der Bestellweg: kein Shop-Checkout, sondern eine Anfrage — siehe
   Abschnitt "Wie eine Bestellung abläuft" unten.

## Wie eine Bestellung abläuft (aktuell: Anfrage statt Sofortkauf)

Es gibt bewusst **keinen** Shopify- oder sonstigen Kauf-Button. Bei
jedem Produkt steht stattdessen ein Button "+ Zur Anfrage
hinzufügen". Klickt jemand darauf:

- Das Produkt landet in einer kleinen Auswahl-Liste (rechts unten
  taucht ein Badge mit der Anzahl auf, verlinkt zum Formular weiter
  unten).
- Im Anfrageformular ("Kurze Anfrage") erscheint die Auswahl
  nochmal übersichtlich, mit der Möglichkeit, einzelne Produkte
  wieder zu entfernen.
- Klickt die Person auf "Anfrage senden", wird die Auswahl
  automatisch vorne in die Nachricht eingefügt und als Mail über
  Formspree an dich geschickt (technisch über das versteckte Feld
  `Ausgewählte Produkte` sowie den Nachrichtentext).
- Du meldest dich dann manuell per Mail mit Preis, Versand- bzw.
  Abholoption und Zahlungsweg zurück — genau wie bisher beim
  Anfrageformular für Marktanfragen/Bildlizenzen.

**Das gilt für alles im Shop** (Postkarten, Poster, Sticker) —
nicht nur für die Sonderfälle wie früher. Die AGB und
Datenschutzerklärung wurden entsprechend angepasst (Vertragsschluss
über Anfrage → individuelles Angebot → Bestätigung/Zahlung).

**Falls ihr später doch auf einen echten Shop mit Sofortkauf
umsteigen wollt** (Shopify, o. ä.): Das ist ein bewusst separater
Umbauschritt. Kurzfassung, falls du später danach suchst: Die
Funktion `renderKaufSlot(...)` im `<script>`-Block von
`produkte-bestellen.html` ist die einzige Stelle, die du dafür
anfassen müsstest — dort müsste statt des "Zur Anfrage
hinzufügen"-Buttons der jeweilige Shop-Checkout-Code rein.

## Postkarten & Poster pflegen → `galerie-daten.js`

**Neues Foto zur Galerie hinzufügen:**
1. Bilddatei in den passenden Ordner legen, z. B.
   `bilder/teichleben/neuesbild.jpg`.
2. In `galerie-daten.js` eine neue Zeile ergänzen: `id`, `kategorie`,
   `bild`-Pfad, `alt`-Text, `beschriftung`, `bereitsPostkarte`,
   `bestand`, `bereitsPoster`, `bestandPoster`.
3. Speichern, hochladen — taucht automatisch in der Galerie-Unterseite
   UND im Shop auf (Postkarte/Poster A4/Download).

**Das Feld `bereitsPostkarte`:**
- `true` → Motiv ist schon als gedruckte Postkarte auf Lager, bekommt
  im Shop ein ★.
- `false` → wird bei Bestellung erst gedruckt, Shop zeigt "Wird für
  dich gedruckt · ca. 1–2 Wochen".

**Das Feld `bestand`** (nur relevant, wenn `bereitsPostkarte: true`):
- Zahl (z. B. `8`) → Shop zeigt "Noch 8 auf Lager". Da es keinen
  automatischen Checkout gibt, zählst du das manuell runter, wenn du
  eine Bestellung bestätigst.
- `null` → Shop zeigt einfach "Vorrätig" ohne genaue Zahl.
- `0` → Shop zeigt "Wird nachbestellt · ca. 1–2 Wochen".

**Die Felder `bereitsPoster` und `bestandPoster`** funktionieren
exakt genauso — nur eben für Poster statt Postkarten. Das ist die
Umstellung von August 2026: Poster sind keine Einzelanfertigung mehr,
sondern werden von dir wie Postkarten in Auflage vorbestellt und aus
dem Lager verkauft.

- `bereitsPoster: true` → liegt als gedrucktes A4-Poster bei dir,
  bekommt im Shop ein ★ (wenn "Poster A4" ausgewählt ist).
- `bereitsPoster: false` → Shop zeigt "Wird nachgedruckt · ca. 1–2
  Wochen". Du nimmst das Motiv dann in die nächste Sammelbestellung
  mit auf.
- `bestandPoster`: Stückzahl wie bei `bestand` (Zahl / `null` / `0`).

Das ★ und die Lagerzeile richten sich immer nach der gerade
ausgewählten Ausführung — klickt jemand von Postkarte auf Poster,
springt die Anzeige automatisch mit.

👉 **Noch offen:** Aktuell steht bei allen Motiven `bereitsPoster:
false` und `bestandPoster: 0`, weil ich nicht weiß, welche Poster du
schon gedruckt zu Hause hast. Einmal durchgehen und bei den passenden
Zeilen umstellen. (Bei den Postkarten hast du das ja schon gemacht.)

## Preise & Staffelpreise → `produkte-daten.js`

Es gibt nur noch **ein Poster-Format: A4** (`POSTER_FORMAT`). Alles
Größere läuft über deinen Saal-Digital-Shop (siehe unten).

Die Staffel arbeitet mit **Stückpreisen**, nicht mit festen Paketen:

```
postkarte:    ab 1 → 2,50 €   ab 3 → 2,00 €   ab 5 → 1,80 €
poster:       ab 1 → 12,00 €  ab 2 → 10,00 €
lesezeichen:  2,00 € pro Stück (keine Staffel)
```

**Wo Preise zusätzlich als fester Text stehen** (bei Änderung von Hand
mitziehen): Aufklapper „Preise, Staffelrabatt & Versand“ und die
Staffel-Zeilen in `produkte-bestellen.html`, das FAQ-Schema im `<head>`
derselben Datei, die Kacheln und das Angebots-Schema (`makesOffer`) in
`index.html`, `agb.html` Punkt 4 und `portfolio-veranstalter.html`
(dort stehen die Marktpreise).

**Entscheidend ist die Gesamtmenge über alle Motive hinweg**, nicht
pro Motiv. Wer 2 Entchen- und 1 Reiher-Postkarte nimmt, hat 3 Karten
und zahlt 2,00 € auf alle drei = 6,00 €. Postkarten und Poster werden
dabei getrennt gezählt. Genau deshalb kann jeder frei kombinieren —
niemand muss 3 gleiche Karten nehmen, um den Rabatt zu bekommen.

Eine Stufe ändern oder ergänzen (z. B. `{ abMenge: 10, proStueck:
1.60 }`) reicht in der einen Zeile — Karten, Auswahl-Liste, Summe und
der Text in der Anfrage-Mail ziehen automatisch nach. Stufen bitte
aufsteigend nach `abMenge` sortiert lassen.

`MAX_MENGE` (Standard 50) begrenzt, wie viel pro Position wählbar ist.

### Was der Kunde davon sieht

- Unter jedem Bild ein **Mengen-Stepper** (− 1 +), frei einstellbar.
- Die Preiszeile rechnet live mit: erreicht die Gesamtmenge eine
  Stufe, erscheint der Hinweis „Staffelpreis" und der Stückpreis
  sinkt — auch auf allen anderen Karten gleichzeitig.
- In der Auswahl unten steht eine Zusammenfassung je Typ mit
  Stückpreis, eine Zwischensumme und ggf. der Hinweis „Noch 2
  Postkarten mehr und du zahlst je 1,80 €".
- Die Zwischensumme ist ausdrücklich als **Richtwert ohne Versand**
  gekennzeichnet — verbindlich wird erst deine Antwort.

## Lesezeichen pflegen → `galerie-daten.js` + Ordner `bilder/lesezeichen/`

Lesezeichen haben **keine eigene Liste** — sie hängen am Motiv in
`galerie-daten.js`. Zwei Felder pro Zeile:

- `bereitsLesezeichen: true` → aus diesem Foto gibt es Lesezeichen,
  es erscheint im Shop unter „Lesezeichen". `false` → taucht dort
  nicht auf (anders als bei Postkarten wird nichts „auf Bestellung"
  angeboten).
- `bestandLesezeichen` → Stückzahl zu Hause (Zahl / `null` / `0`,
  wie bei `bestand`). `0` zeigt „Gerade vergriffen · wird
  nachgedruckt".

**Das Produktbild** kommt in den Ordner `bilder/lesezeichen/` und
heißt genau wie die id: `teichleben1` → `bilder/lesezeichen/teichleben1.jpg`.
Keine weitere Verknüpfung nötig. Fehlt die Datei, zeigt der Shop einen
Ausschnitt des Galeriefotos mit „Beispielansicht". Anderer Dateiname?
Optional `bildLesezeichen: 'bilder/lesezeichen/xyz.png'` in die Zeile.
Details stehen in `bilder/lesezeichen/LIESMICH.md`.

**Preis:** `STAFFEL.lesezeichen` in `produkte-daten.js` — online fest
2,00 € pro Stück, ohne Mengenrabatt. „3 für 5 €“ gilt nur am Marktstand
(geht als Stückpreis nicht glatt auf) und steht so auch im Shop, auf der
Startseiten-Kachel und in AGB Punkt 4.

**Direktlink** auf ein einzelnes Lesezeichen (z. B. für einen QR-Code):
`produkte-bestellen.html#lz-teichleben1`.

## Druckereien & Saal-Digital-Shop → `produkte-daten.js`

**Wer druckt was** steht offen im Shop-Kopf (Kasten „Wer druckt was?“)
und auf jeder Produktkarte („Gedruckt bei … · aus Halstenbek
versendet“):

- Postkarten → WIRmachenDRUCK
- Poster A4 → Saal Digital (Fotoabzug)
- Lesezeichen → Peterprint

Die Namen auf den **Produktkarten** kommen aus `DRUCKPARTNER` in
`produkte-daten.js`. An diesen Stellen stehen sie zusätzlich als
fester Text und müssen bei einem Druckereiwechsel von Hand mit:
Shop-Kopf in `produkte-bestellen.html` (inkl. FAQ-Schema oben im
`<head>`), Zeile unter den Mitnehmen-Kacheln in `index.html`,
`agb.html` Punkt 3, `datenschutz.html` (Abschnitt Bestellanfragen),
`fuer-veranstalter.html`, `portfolio-veranstalter.html`.

**Saal-Digital-Shop (größer als A4):** Den Link trägst du einmal in
`SAAL_SHOP_URL` ein. Dann erscheint automatisch

- im Shop-Bereich „Größer als A4“ der Button zu deinem Shop,
- auf jeder Motivkarte bei „Poster A4“ der Link „Größer als A4? Zum
  Saal-Digital-Shop ↗“.

Solange die URL leer ist, steht im Bereich nur ein Hinweis aufs
Anfrageformular. Rechtlich wichtig: Bei Bestellungen dort ist
**Saal Digital Vertragspartner** (steht so in AGB Punkt 3.1 und in
der Datenschutzerklärung) — deine AGB gelten dafür nicht.

## So ist der Shop aufgebaut

Es gibt **einen** Motivbereich, nicht mehrere untereinander. Links
steht die Filterleiste, rechts das Raster:

- **Produkt** — Postkarten, Poster A4, Lesezeichen, Downloads.
  Immer genau eines ist aktiv. Die Formatknöpfe auf den einzelnen
  Karten gibt es nicht mehr.
- **Serie** — Teichleben, Gartenleben, Waldleben, Reduktion. Die
  Serien stehen also nicht mehr als eigene Blöcke untereinander;
  stattdessen mischen sich alle Serien im Raster und jede Karte
  trägt ihren Seriennamen klein unter dem Motivtitel.
- **Nur was auf Lager liegt** — blendet Nachdrucke aus. Bei
  Downloads ist das Häkchen automatisch weg.
- Die Zahl hinter jedem Filter sagt, wie viele Motive dahinter
  stecken. Ist sie 0, ist der Eintrag ausgegraut.

Angezeigt werden **12 Motive**, der Rest kommt über „Weitere Motive
anzeigen“ nach. Ändern: `MOTIVE_PRO_SEITE` oben im Script von
`produkte-bestellen.html`. 12 geht in 2, 3 und 4 Spalten glatt auf —
bei 10 bleibt in der letzten Zeile eine Lücke.

Auf dem Handy wird aus der Seitenleiste eine waagerechte Reihe zum
Wischen, und das Raster zeigt zwei Karten nebeneinander.

### Eine Produktart ändern oder ergänzen

Alles steckt in der Liste `PRODUKTARTEN` im Script. Ein Eintrag
sagt, wie das Produkt heißt (`label`), wie die Position im
Warenkorb und in deiner Mail heißt (`bezeichnung`), welcher
Infotext unter der Überschrift steht (`info`), welche Motive
überhaupt in Frage kommen (`filter`), woher die Lagerzeile kommt
(`lager`) und welches Foto die Karte zeigt (`bild`). Der Preis
kommt aus `STAFFEL`/`PREISE` in `produkte-daten.js` und muss
denselben `id` benutzen.

### Direktlinks

- `produkte-bestellen.html#motiv-teichleben1` — Motiv in der
  gerade eingestellten Produktart, standardmäßig als Postkarte.
- `produkte-bestellen.html#lz-teichleben1` — dasselbe Motiv als
  Lesezeichen; die Produktart wird automatisch umgestellt.
- `produkte-bestellen.html#lesezeichen` — schlägt gleich die
  Lesezeichen auf (so verlinkt die Startseite).

Liegt das Motiv weiter hinten, lädt die Seite selbstständig so weit
nach, bis die Karte wirklich da ist, und hebt sie kurz hervor. Steht
ein Serienfilter im Weg, wird er dafür aufgehoben.

## Sticker pflegen → `produkte-daten.js` → `STICKER`

Jeder Eintrag: `id`, `motiv`, `kategorie` (optional), `preis`,
`mockups` (Bildliste). Ein auskommentiertes Beispiel steht direkt in
der Datei zum Kopieren.

**Solange `STICKER` leer ist, ist der Sticker-Bereich komplett
unsichtbar** — auch der Sprunglink oben im Shop. Alte Links auf
`#sticker` schlagen dann die Lesezeichen auf. Mit dem ersten Eintrag
erscheint alles automatisch. Auf der Startseite gibt es aktuell nur
die Lesezeichen-Kachel; für Sticker später eine vierte Kachel nach
demselben Muster ergänzen (Kommentar steht in `index.html`).

## Nach dem Absenden → `danke.html`

Früher landete man nach dem Absenden auf einer fremden
Formspree-Seite. Jetzt geht es auf **`danke.html`**.

**Wie das technisch läuft:** Im Formular steckt ein verstecktes Feld
`_next`. Beim Absenden schreibt `dankeSeiteVorbereiten()` dort die
Adresse der Danke-Seite hinein, samt einer kurzen Zusammenfassung als
Parameter (`art`, `liefer`, `zahl`, `ware`, `versand`, `pos`).
Formspree leitet dann dorthin weiter, und `danke.html` baut daraus die
Bestellübersicht.

Bewusst **nicht** übertragen werden Name, Anschrift und Nachricht —
die stünden sonst in der Adresszeile und im Browserverlauf. Und
bewusst kein `localStorage`: die Seite soll ohne Zustimmungsbanner
auskommen, ein Adressparameter ist kein Speicherzugriff. Ist die
Positionsliste zu lang für eine Adresse, steht dort nur die Anzahl
und der Verweis auf die E-Mail.

**Die Seite zeigt zwei Fassungen:**

- *Verbindliche Bestellung* — mit dem Hinweis, dass Seite und
  automatische Mail nur eine **Eingangsbestätigung** sind und der
  Vertrag erst mit deiner Auftragsbestätigung zustande kommt. Dieser
  Text muss zu **AGB Punkt 2.4** passen; änderst du eines, zieh das
  andere mit.
- *Unverbindliche Anfrage* — ohne diesen Hinweis, dafür mit „vorher
  ist nichts verbindlich“.

Die Schritte unter „Wie es weitergeht“ und der Widerrufstext
wechseln zusätzlich je nach Versand, Abholung, Barzahlung oder
Download. Ruft jemand `danke.html` ohne Parameter auf (Lesezeichen,
Zurück-Taste), erscheint eine neutrale Fassung ohne Übersicht.

**Zum Testen** kannst du die Seite direkt mit Parametern aufrufen:

```
danke.html?art=bestellung&liefer=versand&zahl=vorab&ware=14.50&versand=4.50&pos=1~Entenk%C3%BCken~Postkarte~2.50
```

Die Seite steht auf `noindex`, ist nicht in `sitemap.xml` und in
`robots.txt` ausgeschlossen — eine Bestätigungsseite gehört nicht in
die Google-Suche.

## Shop-Kopf: aufklappbare Infos

Der Erklärtext oben auf der Shop-Seite steckt in drei
`<details>`-Blöcken („So läuft eine Bestellung ab" / „Preise,
Staffelrabatt & Versand" / „Herstellung, Rückgabe & Widerruf"). Alle
sind beim Laden zu, damit die Seite ruhig startet und man sofort bei
den Motiven ist. Wer es wissen will, klappt auf.

Willst du einen Block standardmäßig offen haben, im HTML einfach
`<details class="info-fold" open>` schreiben.

Die Staffelpreise stehen zusätzlich als eine Zeile über dem
Motivraster — die baut sich automatisch aus `STAFFEL` und kann
deshalb nicht mehr von den echten Preisen abweichen.

## Merch — bewusst raus aus dem Sortiment

Es gibt keine Merch-Produktliste mehr und nichts mehr zu pflegen. An
der Stelle steht im Shop nur noch ein Hinweisblock unter der
Überschrift "Tassen & Co.": Tassen, Caps, Beutel & Co. sind auf
Anfrage möglich, **Kleidung nicht** (zu viel Retoure). Der Wunsch
landet über das Anfrageformular bei dir, du holst dann ein Angebot
ein.

Auf der Startseite ist die vierte Produktkachel entsprechend weg und
durch eine Textzeile ersetzt. Der Anker `#merch` funktioniert weiter,
damit alte Links und QR-Codes nicht ins Leere laufen.

Falls du Merch später doch wieder fest ins Sortiment nimmst, sag
Bescheid — die alte Listen-Logik lässt sich zurückholen.

## Das Anfrageformular (jetzt: alles läuft hier zusammen)

Ein einziges Formular für zwei Fälle:
1. **Produktauswahl** — Person hat Produkte über "Zur Anfrage
   hinzufügen" gesammelt, sendet sie mit Name/E-Mail/Nachricht ab.
2. **Reine Anfrage ohne Produkt** — über die Chips Marktanfrage /
   Bildlizenz / Motivwunsch / Sonstiges, wie bisher.

Es fragt bewusst nur Name, E-Mail und Nachricht ab — keine Adresse,
keine Zahlungsdaten. Die kommen erst ins Spiel, wenn du der Person
nach deiner Rückmeldung ein Angebot machst.

Der Betreff der Formspree-Mail passt sich automatisch an, je
nachdem welcher Chip (Bestellanfrage/Marktanfrage/Bildlizenz/
Motivwunsch/Sonstiges) angeklickt wurde — bei vorhandener
Produktauswahl ohne manuelle Chip-Wahl wird automatisch
"Bestellanfrage" gesetzt. Über einen Link mit `?anliegen=markt`
(oder `lizenz`, `motivwunsch`, `sonstiges`) am Ende der URL kannst du
den passenden Chip auch automatisch vorauswählen lassen — genau das
nutzt z. B. der "Termin anfragen"-Button im Termine-Bereich der
Startseite.

**Formspree:** Die Endpoint-ID in `produkte-bestellen.html`
(`<form action="https://formspree.io/f/xvzejbje">`) ist die richtige
und aktive — Bestellanfragen kommen darüber zuverlässig an. Nicht
versehentlich ersetzen.

## Persona-Startseiten (optional, Vorschau)

`persona-startseiten-vorschau.html` ist eine eigenständige Demo-Datei
— zeigt, wie drei unterschiedliche Hero-Texte für Instagram-Besucher,
Postkarten/QR-Besucher und Marktbesucher aussehen könnten. Sie ist
NICHT live verdrahtet, nur zur Ansicht/Diskussion. Wenn dir eine der
Varianten gefällt, sag Bescheid — dann bauen wir das echt in
`index.html` ein (per URL-Parameter, ähnlich wie beim
Anfrageformular).

## Offene Punkte, die dir noch auffallen sollten

- **AGB/Datenschutz:** inhaltlich an das Anfrage-Modell angepasst,
  aber nicht anwaltlich geprüft — vor dem Live-Gang einmal von
  jemandem mit Rechtskenntnis gegenlesen lassen.
- **Widerrufsrecht bei Postern (wichtig, geändert):** Solange Poster
  individuell im Wunschformat gedruckt wurden, war das Widerrufsrecht
  nach § 312g Abs. 2 Nr. 1 BGB ausgeschlossen. Seit der Umstellung auf
  A4-Auflagenware gilt das nicht mehr: Ein Motiv aus dem festen
  Katalog in einem festen Standardformat auszuwählen ist keine
  individuelle Anfertigung — auch dann nicht, wenn das Motiv gerade
  vergriffen ist und nachgedruckt wird. **Poster haben deshalb jetzt
  ganz normal 14 Tage Widerrufsrecht**, genau wie Postkarten.
  Ausgeschlossen bleibt es nur bei echten Sonderanfertigungen:
  Sonderformate, Motive außerhalb des Katalogs, Merch auf Anfrage.
  AGB Punkt 7.1/7.2 sind entsprechend umgeschrieben.
- **Overlays auf den Produktbildern:** Stern („vorrätig") und
  Zoom-Button lagen früher beide oben und haben sich auf schmalen
  Karten überlappt. Jetzt sitzt der Stern oben links, der Zoom unten
  rechts — und der Zoom ist nur noch eine Lupe, die Beschriftung
  fährt beim Drüberfahren aus. Auf Touch-Geräten bleibt es beim Icon.
- **Rechtsseiten:** Impressum, Datenschutz und AGB benutzen jetzt
  `styles.css` statt eigener Inline-Styles und haben Navigation und
  Fußzeile wie alle anderen Seiten. Die Formatierung steckt in der
  Klasse `.legal` am Ende von `styles.css`.
- **Karteileichen:** `galerie-silhouetten.html` und
  `galerie-gartenleben(alt).html` sind von keiner Seite verlinkt.
  Entweder löschen oder bewusst liegenlassen.
- **Alt-Texte prüfen:** In ein paar Gartenleben-Motiven (z. B. Katze,
  Goldammer, Dorngrasmücke) steht als `alt`-Text noch versehentlich
  "Rotkehlchen auf einem Ast" (Copy-Paste-Rest).
- **Bildpfade vereinheitlichen:** Die Startseite nutzt weiterhin flache
  Pfade wie `bilder/teichleben-01.jpg`, die Galerien nutzen Unterordner
  (`bilder/teichleben/entchen1.jpg`).
