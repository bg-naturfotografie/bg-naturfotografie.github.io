# Admin-Bereich & Englisch — so funktioniert's

Stand: 09.10.2026

Seit diesem Umbau musst du für Termine, Texte, Motive, Lagerbestände,
Geschichten und Preise **keinen Code mehr anfassen**. Alles geht über
Formulare unter:

**https://bg-naturfotografie.de/admin/**

Die Adresse ist nirgends verlinkt und für Suchmaschinen gesperrt.
Geschützt wird der Bereich aber durch die **Anmeldung**: Speichern kann
nur, wer Schreibrecht auf das GitHub-Repo hat — also du.

---

## 1. Anmelden

Auf der Admin-Seite gibt es zwei Wege. Beide laufen über dein
GitHub-Konto.

### a) Sofort: mit Zugangsschlüssel („Sign In Using Access Token“)

Einmalig einen Schlüssel bei GitHub erzeugen:

1. Auf GitHub oben rechts auf dein Bild → **Settings** →
   ganz unten **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. Name: z. B. `Admin bg-naturfotografie`.
   Ablaufdatum: am besten 1 Jahr (danach einfach einen neuen erzeugen).
3. **Resource owner:** `bg-naturfotografie` (die Organisation, nicht dein
   persönliches Konto).
4. **Repository access:** *Only select repositories* →
   `bg-naturfotografie.github.io`.
5. **Permissions → Repository permissions → Contents:** *Read and write*.
6. **Generate token**, den Schlüssel kopieren (er wird nur einmal angezeigt).
7. Auf `bg-naturfotografie.de/admin/` → **Sign In Using Access Token** →
   einfügen. Der Browser merkt sich die Anmeldung.

> Falls GitHub meldet, dass die Organisation solche Schlüssel nicht
> erlaubt: In der Organisation unter **Settings → Personal access tokens**
> „Allow access via fine-grained personal access tokens“ einschalten.

Den Schlüssel wie ein Passwort behandeln: nicht weitergeben, nicht in
Dateien speichern.

### b) Bequemer, auf Dauer: Knopf „Sign In with GitHub“

Dafür braucht es einen kleinen, kostenlosen Anmelde-Dienst (GitHub
erlaubt die Anmeldung nicht direkt von einer statischen Seite aus).
Einmalige Einrichtung, ca. 15 Minuten:

1. Kostenloses Konto bei **Cloudflare** anlegen (dash.cloudflare.com).
2. Auf **github.com/sveltia/sveltia-cms-auth** den Knopf
   **„Deploy to Cloudflare“** drücken und den Schritten folgen.
   Am Ende hast du eine Adresse wie
   `https://sveltia-cms-auth.DEIN-NAME.workers.dev`.
3. Auf GitHub: Organisation `bg-naturfotografie` → **Settings** →
   **Developer settings** → **OAuth Apps** → **New OAuth App**:
   - Application name: `BG Naturfotografie Admin`
   - Homepage URL: `https://bg-naturfotografie.de`
   - Authorization callback URL:
     `https://sveltia-cms-auth.DEIN-NAME.workers.dev/callback`
   - Danach **Client ID** kopieren und ein **Client secret** erzeugen.
4. Bei Cloudflare im Worker unter **Settings → Variables** eintragen:
   - `GITHUB_CLIENT_ID` = die Client ID
   - `GITHUB_CLIENT_SECRET` = das Client secret (als „Secret“)
   - `ALLOWED_DOMAINS` = `bg-naturfotografie.de`
5. In `admin/config.yml` die Zeile `# base_url: …` aktivieren (die `#`
   entfernen) und deine Worker-Adresse eintragen — oder mir die Adresse
   schicken, dann mache ich das.

Danach reicht ein Klick auf **Sign In with GitHub**.

---

## 2. Was du wo bearbeitest

| Im Admin-Bereich | Datei | Was |
|---|---|---|
| **Termine** | `daten/termine.json` | Märkte mit Datum, Uhrzeit, Ort. Vergangene Termine verschwinden **automatisch** von der Seite. Der nächste Termin steht zusätzlich oben auf der Startseite. |
| **Motive & Serien** | `daten/motive.json` | Alle Fotos: Bild, Name, Alt-Text, Lagerbestand (Postkarte/Poster/Lesezeichen), Aufnahmeort für die Karte. Darunter die Serien mit Namen, Beschreibung, Reihenfolge und den drei Startseiten-Bildern. |
| **Geschichten** | `daten/geschichten.json` | Die Texte hinter den Fotos inkl. Infokasten und Zusatzbildern (ersetzt die Google-Tabelle, siehe unten). |
| **Startseite: Bilder oben** | `daten/startseite.json` | Welche Motive in der Collage oben wechseln, Bildausschnitt, Wechseltempo. |
| **Shop: Preise & Versand** | `daten/shop.json` | Staffelpreise, Download-Preis, Versandkosten, Druckpartner, Saal-Digital-Link, Sticker. Preise ändern sich automatisch überall (Shop, Startseite, Warenkorb). |
| **Seitentexte** | `daten/texte.json` | Begrüßung, Über mich, Kontakt, Shop-Einleitung usw. |

Bei jedem Text gibt es ein Feld **Deutsch** und eins **English**. Lässt
du English leer, steht auf der englischen Seite einfach der deutsche Text.

**Formatierung in Texten:** `**fett**`, `*kursiv*`,
`[Linktext](adresse)`. HTML wird bewusst nicht ausgeführt.

### Wichtig bei Motiven

- Die **ID** (z. B. `gartenleben21`) steht in den gedruckten QR-Codes.
  Niemals ändern, sobald etwas gedruckt ist. Neue Motive bekommen eine
  neue ID (z. B. `gartenleben26`).
- **Aufnahmeort:** Bei „Punkt“ oder „Kreis“ die Koordinaten aus Google
  Maps einfügen (Rechtsklick auf die Stelle → erste Zeile anklicken =
  kopiert). Für Flächen: `bg-naturfotografie.de/gebiet-zeichnen.html`.
  Brut- und Ruheplätze bitte nur als Kreis oder Fläche.
- **Vorübergehend ausblenden** nimmt ein Motiv von der Seite, ohne es
  zu löschen.

### Bilder hochladen

Im Feld „Foto“ einfach ein Bild hineinziehen. Es wird beim Hochladen
**automatisch verkleinert** (max. 1600 px, WebP) und landet in
`bilder/fotos/`. Für Drucke nimmst du weiter deine Originaldateien —
die gehören nicht auf die Webseite.

### Wann ist eine Änderung live?

Nach dem Speichern baut GitHub die Seite neu — meist **1–2 Minuten**.
Danach einmal neu laden.

### Etwas kaputt gemacht?

Jede Speicherung ist eine eigene Version auf GitHub (Einträge
„Admin: …“ in der Commit-Liste). Jede ältere Version lässt sich
wiederherstellen — notfalls einfach melden.

---

## 3. Geschichten: Umzug aus der Google-Tabelle

Solange `daten/geschichten.json` leer ist, liest die Seite die
Geschichten weiter aus der Google-Tabelle. Sobald dort die erste
Geschichte steht, wird nur noch der Admin-Bereich benutzt.

Für den Umzug: Tabelle als CSV herunterladen (Datei → Herunterladen →
CSV) und mir schicken — ich übernehme alle Geschichten samt
englischer Übersetzung.

---

## 4. Englisch

- Oben rechts im Menü sitzt der Umschalter **DE | EN**. Die Wahl wird
  im Browser gemerkt.
- Ein Link direkt auf die englische Fassung, z. B. für die
  Instagram-Bio: **https://bg-naturfotografie.de/?lang=en**
- Die Seite stellt sich **nicht** automatisch nach Browsersprache um —
  sonst würde Google die englische Fassung in die deutsche Suche
  übernehmen.
- **Rechtstexte** (Impressum, Datenschutz, AGB) bleiben deutsch. Auf
  Englisch steht oben ein Hinweis, dass die deutsche Fassung gilt.
  Rechtstexte bitte nur von einer Fachperson übersetzen lassen.
- Das **Aussteller-Portfolio** für Veranstalter ist bewusst nur deutsch.
- Im Kontakt- und Bestellformular kommt ein Feld „Sprache“ mit, damit
  du siehst, ob du auf Englisch antworten solltest.

Feste Texte (Knöpfe, Menü, Formulare) stehen direkt im HTML: der
deutsche Text im Element, die englische Fassung im Attribut `data-en`.

---

## 5. Was weiterhin im Code steht

- Rechtstexte (`impressum.html`, `datenschutz.html`, `agb.html`).
  **Achtung:** Wechselst du eine Druckerei, stehen die Namen dort
  zusätzlich als fester Text.
- Gestaltung (`styles.css`) und Seitenaufbau.
- Das Aussteller-Portfolio (`portfolio-veranstalter.html`).

---

## 6. Technik in Kürze

- `daten.js` lädt die JSON-Dateien und stellt sie den Seiten bereit.
- `sprache.js` regelt Deutsch/Englisch und baut den Umschalter ein.
- `admin/` enthält den Admin-Bereich (Sveltia CMS, kostenlos, Open
  Source); die Formulare stehen in `admin/config.yml`.
- Lokal (Doppelklick auf eine HTML-Datei) laden die Daten nicht — der
  Browser erlaubt das bei `file://` nicht. Zum Testen am Rechner im
  Ordner `python -m http.server` starten und `localhost:8000` öffnen.
