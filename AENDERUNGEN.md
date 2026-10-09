> **Hinweis (09.10.2026):** Inhalte wie Termine, Motive, Preise, Geschichten und Texte pflegst du inzwischen im Admin-Bereich unter `bg-naturfotografie.de/admin/`. `galerie-daten.js`, `produkte-daten.js` und `startseite-bilder.js` gibt es nicht mehr — die Daten stehen jetzt in `daten/*.json`. Alles Aktuelle steht in **ANLEITUNG-ADMIN.md**; Stellen hier, die die alten Dateien nennen, sind überholt.

# Änderungen — SEO, Vorschaubilder, Shop, Barrierefreiheit & Schriften

Stand: 14.08.2026 · zweite Lieferung, ersetzt die erste vollständig

Alle Dateien kommen ins Hauptverzeichnis des Repos. **Neu ist der
Ordner `schriften/`** — den bitte komplett mit hochladen, sonst
fällt die Seite auf Systemschriften zurück.

---

## Neu in dieser Lieferung

`styles.css` (Barrierefreiheit + Schrifteinbindung),
`schriften/` (4 Schriftdateien + Lizenz), Sprunglinks und
Fokusrahmen auf allen Seiten, angepasste Datenschutzerklärung.
Alles aus der ersten Lieferung ist enthalten — nimm einfach diesen
Satz.

---

# Teil A — Barrierefreiheit

## Zuerst die unbequeme Antwort auf deine Frage

**Deine Kontraste waren bereits in Ordnung.** Ich habe alle
Farbkombinationen nach WCAG 2.1 durchgerechnet, statt zu schätzen:

| Element | vorher | verlangt |
|---|---|---|
| Fließtext `#EDE7D6` | 15,0:1 | 4,5:1 |
| Graue Texte `#93A085` | 5,4:1 | 4,5:1 |
| Links `#E3A56B` | 7,0:1 | 4,5:1 |
| Gefüllter Knopf | 5,7:1 | 4,5:1 |
| Über-mich-Bereich | 5,3–13,3:1 | 4,5:1 |

Der schlechteste Wert lag bei 5,4:1 — über der Anforderung. Die
dunkle Palette wirkt *gedämpft*, ist aber nicht *kontrastschwach*.
Das ist ein Unterschied, den das Auge schlecht schätzt.

Ich habe `--text-muted` trotzdem von `#93A085` auf `#A5B396`
angehoben: **6,7:1 statt 5,4:1**. Nicht weil es nötig war, sondern
weil dieser Ton auf der Seite sehr viel Fließtext in kleinen Größen
trägt und du damit Richtung AAA (7:1) kommst. Optisch ist es eine
Nuance, du wirst es kaum bemerken.

## Was tatsächlich fehlte

Das waren nicht die Farben, sondern vier andere Dinge — jedes davon
ein echter Verstoß gegen WCAG 2.1 AA:

**1. Kein sichtbarer Fokusrahmen** (WCAG 2.4.7 — der gravierendste
Punkt). Nur Eingabefelder hatten einen. Wer mit der Tabulatortaste
navigiert — Menschen mit motorischen Einschränkungen, aber auch
jeder, der einfach keine Maus benutzt — sah auf deiner Seite nicht,
wo er gerade steht. Jetzt bekommt alles Bedienbare einen deutlichen
Rahmen in `#FFD9A8` mit Abstand und dunklem Gegenring, damit er auch
auf den orangen Knöpfen sichtbar bleibt. Über `:focus-visible`, also
nur bei Tastaturbedienung, nicht bei jedem Mausklick.

**2. Das Handy-Menü ließ sich per Tastatur gar nicht öffnen** (WCAG
2.1.1). Der Umschalter stand auf `display:none` und war damit für
die Tabulatortaste unerreichbar. Er liegt jetzt unsichtbar über dem
Burger-Symbol und ist erreichbar, beschriftet und zeigt Fokus.

**3. Kein Sprunglink** (WCAG 2.4.1). Auf jeder Seite mussten sich
Tastatur- und Screenreader-Nutzer durch sieben Menüpunkte arbeiten,
bevor der Inhalt kam. Jetzt liegt auf jeder Seite als erste Station
„Direkt zum Inhalt" — unsichtbar, bis er den Fokus bekommt.

**4. Rahmen von Eingabefeldern bei 1,3:1** (WCAG 1.4.11 verlangt
3:1). Die Felder waren kaum vom Hintergrund zu unterscheiden. Es
gibt jetzt zwei Linienstärken:

```css
--line:        rgba(237,231,214,0.12);  /* nur Deko: Trenner, Kartenkanten */
--line-strong: rgba(237,231,214,0.42);  /* alles Bedienbare — 3,5:1 */
```

## Außerdem

- **Schriftgrößen unter 12px angehoben.** Es gab Text bei 0,65rem
  (10,4px) — Lagerhinweise, Bildunterschriften, Preiszeilen.
  Untergrenze ist jetzt 0,75rem (12px). Kein WCAG-Verstoß, aber
  deine Zielgruppe ist im Schnitt nicht zwanzig.
- **Bewegung reduzieren.** Es gab schon Regeln für die Bokeh-Kreise
  und den Termin-Punkt, aber nicht für Übergänge, das weiche Scrollen
  und die Hover-Effekte. Jetzt ein umfassender Block für
  `prefers-reduced-motion` (WCAG 2.3.3) — relevant für Menschen, die
  auf Bewegung mit Schwindel oder Migräne reagieren.
- **Menü als solches benannt** (`aria-label="Hauptmenü"`), Burger-
  Symbol vor Screenreadern verborgen, damit es nicht doppelt
  vorgelesen wird.

## Was ich nicht behauptet habe

Die Seite erfüllt jetzt die **prüfbaren** Kriterien von WCAG 2.1 AA,
soweit sich das maschinell und durch Codeprüfung feststellen lässt.
Eine vollständige Konformitätserklärung ist etwas anderes — dafür
bräuchte es einen Test mit echten Screenreadern (NVDA, VoiceOver)
und Menschen, die sie täglich benutzen. Für einen Kleinbetrieb ohne
gesetzliche Verpflichtung ist das üblicherweise nicht nötig.

**Zur Rechtslage:** Das Barrierefreiheitsstärkungsgesetz (BFSG) gilt
seit 28.06.2025 für Dienstleistungen im elektronischen
Geschäftsverkehr. **Kleinstunternehmen sind ausgenommen** — unter
10 Beschäftigten und unter 2 Mio. € Jahresumsatz. Das trifft auf dich
zu. Du machst das also freiwillig, was ich gut finde: Es sind
mehrheitlich Menschen mit eingeschränktem Sehvermögen, die sich für
Vogelstimmen und Naturbeobachtung begeistern.

---

# Teil B — Schriften selbst hosten

## Kurz: ja, das war die richtige Entscheidung

Google Fonts war der einzige Punkt auf deiner Seite, der
datenschutzrechtlich wirklich wackelte. Beim Laden ging die
IP-Adresse jedes Besuchers an Google — ohne Einwilligung. Das LG
München hat dafür 2022 Schadensersatz zugesprochen
(Az. 3 O 17493/20), und es gibt seither Abmahnwellen genau in
diesem Punkt. Für eine Seite mit Impressum und Gewerbe ist das
vermeidbares Risiko.

## Erledigt, du musst nichts herunterladen

Ich habe die Schriften direkt aus dem offiziellen Google-Fonts-
Repository geholt, aufbereitet und liegen im Ordner `schriften/`:

| Datei | Größe |
|---|---|
| `worksans-var.woff2` | 86 KB |
| `fraunces-var.woff2` | 76 KB |
| `fraunces-italic-var.woff2` | 76 KB |
| `jetbrainsmono-var.woff2` | 42 KB |
| **zusammen** | **288 KB** |

**Lizenz:** Alle drei stehen unter der SIL Open Font License 1.1 —
selbst hosten und mitliefern ist ausdrücklich erlaubt. `OFL.txt`
liegt im Ordner und muss dort bleiben. In `HERKUNFT.md` steht, woher
jede Datei stammt.

**Was ich damit gemacht habe:**

- **Variable Schriften.** Eine Datei deckt alle Strichstärken von
  100 bis 900 ab — deshalb vier Dateien statt zehn. Fraunces behält
  zusätzlich die Achse für optische Größe, damit deine großen
  Überschriften feiner gesetzt werden.
- **Auf die gebrauchten Zeichen eingedampft:** Deutsch mit Umlauten
  und ß, osteuropäische Zeichen für Namen, typografische
  Anführungszeichen, €, ×, Pfeile. Kein Kyrillisch, kein Griechisch,
  kein Vietnamesisch. Das drückte 1,3 MB auf 288 KB.
- **`font-display:swap`** — der Text ist sofort lesbar und wird
  nachträglich ausgetauscht, statt dass die Seite kurz leer bleibt.
- **Vorladen** der zwei wichtigsten Schriften in jeder Seite.

**Nebenwirkung:** Die Seite lädt jetzt spürbar schneller. Vorher
brauchte es zwei zusätzliche Serververbindungen (`fonts.googleapis.com`
und `fonts.gstatic.com`), bevor überhaupt eine Schrift angefordert
wurde. Das fällt weg.

**Eine kleine Einschränkung:** Das ★ (im Shop bei „vorrätig") ist in
keiner der drei Schriften enthalten — das war bei Google genauso.
Der Browser nimmt dafür automatisch eine Systemschrift. Sieht
unverändert aus.

## Datenschutzerklärung angepasst

Der Abschnitt „Google Fonts" ist ersetzt durch „Schriftarten (lokal
eingebunden)" mit der ausdrücklichen Feststellung, dass keine
Verbindung zu Dritten stattfindet.

Außerdem ergänzt: die **freiwillige Lieferanschrift** im
Anfrageformular. Das musste rein — es stand dort bisher wörtlich,
dass keine Anschrift abgefragt wird, und das stimmte nach der
Formularänderung nicht mehr.

---

# Teil C — alles aus der ersten Lieferung

## Shop — Anfrageformular

Optionale Lieferadresse (eingeklappt, vier Felder), alle Pflichtfelder
mit Sternchen, `* Pflichtangaben` oben und unten, eigene deutsche
Fehlermeldungen unter jedem Feld plus Sammelmeldung, Datenschutz-Haken.

**Datenschutz-Haken entfernen:** den `<div class="feld-check" …>`-Block
löschen, die Prüfung überspringt ihn dann automatisch.

## Shop — Blättern pro Kategorie

Vier eigene Blöcke statt einer Wand aus 46 Motiven. Je Block:
Motivzahl, „Motiv 1–20 von 24", Auswahlmenü `10 / 20 / 40 / alle`,
eigene Seiten-Navigation. Voreinstellung 20.

Einstellen ganz oben im Script von `produkte-bestellen.html`:

```js
var STANDARD_PRO_SEITE = 20;
var PRO_SEITE_OPTIONEN = [10, 20, 40, 'alle'];
```

Format und Auswahl überleben das Blättern; Links aus der Galerie
schlagen die richtige Seite auf.

## Vorschaubild & SEO

Vollständiger `og:`/`twitter:`-Satz auf allen Seiten, eigene Titel
und Beschreibungen, JSON-LD (Betrieb, Person, FAQ, ImageGallery,
Brotkrumen), `robots.txt`, `sitemap.xml`, `404.html`.

## Neue Seiten

`fuer-veranstalter.html` (dein Portfolio als Webseite),
Einstiegs-Bereich auf der Startseite, „Postkarte gescannt?"-Kasten
auf `geschichten.html`.

## Mitkorrigierte Fehler

19 alt-Texte in `galerie-daten.js` — vier beschrieben die falsche
Art (`gartenleben3`/`4` als Buntspecht bzw. Gimpel statt Blaumeise,
`gartenleben10` als Amsel statt Sumpfmeise, beide Tagpfauenaugen als
Schwanzmeise). Dazu „Blsshuhn"-Tippfehler, zwei namensgleiche
Buntspecht-Motive, fehlende `</div>` in drei Galerieseiten, doppeltes
Foto auf der Startseite, zwei `<h1>` in `datenschutz.html`, leere
`src=""` in Lightbox-Platzhaltern.

---

# Nach dem Hochladen

1. **Ordner `schriften/` mit hochladen.** Fehlt er, greifen
   Systemschriften — die Seite bleibt lesbar, sieht aber anders aus.
2. **Einmal mit der Tabulatortaste durch die Startseite gehen.** Du
   solltest zuerst „Direkt zum Inhalt" sehen und danach bei jedem
   Element einen hellen Rahmen. Das ist der beste Selbsttest.
3. **Search Console:** `sitemap.xml` einreichen.
4. **Vorschaubild testen:** Startseiten-Link per WhatsApp an dich
   selbst.
5. **Shop durchklicken:** Gartenleben Seite 2, „alle", Motiv zur
   Anfrage, blättern, prüfen ob es noch drin ist.
6. **`fuer-veranstalter.html` gegenlesen** — Standgröße 3 × 3 m,
   „kein Strom nötig", Zahlung bar + PayPal habe ich abgeleitet,
   nicht von dir bekommen.

# Offen geblieben

**`geschichte.html` steht weiter auf `noindex`.** Texte kommen per
JavaScript aus dem Google Sheet, Adressen laufen über `?id=`. Für
deine QR-Besucher ändert das nichts. Umstellen wäre eine Zeile, dann
sollte `geschichte.js` aber einen `canonical` je Motiv setzen.

**Keine `Product`-Auszeichnung im JSON-LD.** Google erwartet dabei
einen echten Kaufweg; dein Shop ist ein Anfrageformular. Sobald
Shopify steht, lohnt es sich.
