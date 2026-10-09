# Admin-Bereich & Englisch — so funktioniert's

Stand: 09.10.2026 (ergänzt: Übersetzungs-Hinweis, Anmelde-Knopf, Geschichten)

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

GitHub erlaubt die Anmeldung nicht direkt von einer reinen Webseite aus.
Dazwischen braucht es einen winzigen Vermittler (den „Anmelde-Dienst“),
der kostenlos bei Cloudflare läuft. Einmalig ca. 15 Minuten:

**Teil A — Anmelde-Dienst bei Cloudflare anlegen**

1. Auf **dash.cloudflare.com** ein kostenloses Konto anlegen
   (E-Mail bestätigen).
2. Die Seite **github.com/sveltia/sveltia-cms-auth** öffnen und im
   Text auf den Knopf **„Deploy to Cloudflare“** klicken.
3. Auf der Seite „Set up your application“: bei **Git account** auf
   **New GitHub connection** klicken und Zugriff erlauben (dein
   persönliches Konto reicht), Haken bei **Create private Git repository**
   setzen, **Project name** `sveltia-cms-auth` lassen, **Build command**
   und **Deploy command** leer lassen → **Deploy**.
4. Am Ende zeigt Cloudflare eine Adresse wie
   `https://sveltia-cms-auth.DEIN-NAME.workers.dev`. **Diese Adresse
   notieren.**

**Teil B — GitHub den Anmelde-Dienst bekannt machen**

5. Auf GitHub: **github.com/organizations/bg-naturfotografie/settings/applications**
   öffnen (Organisation → Settings → Developer settings → **OAuth Apps**)
   → **New OAuth App**.
6. Ausfüllen:
   - Application name: `BG Naturfotografie Admin`
   - Homepage URL: `https://bg-naturfotografie.de`
   - Authorization callback URL:
     `https://sveltia-cms-auth.DEIN-NAME.workers.dev/callback`
     (deine Adresse aus Schritt 4 **plus `/callback`**)
   - → **Register application**
7. Auf der nächsten Seite die **Client ID** kopieren, dann
   **Generate a new client secret** klicken und das **Secret** kopieren
   (wird nur einmal angezeigt).

**Teil C — die beiden Werte bei Cloudflare eintragen**

8. Bei Cloudflare: **Workers & Pages** → `sveltia-cms-auth` →
   **Settings** → **Variables and Secrets** → **Add**:
   - `GITHUB_CLIENT_ID` = die Client ID (Typ: Text)
   - `GITHUB_CLIENT_SECRET` = das Secret (Typ: **Secret**)
   - `ALLOWED_DOMAINS` = `bg-naturfotografie.de` (Typ: Text)
   → **Deploy** / speichern.

**Teil D — Adresse in den Admin-Bereich eintragen**

9. Schick mir die Adresse aus Schritt 4 — ich trage sie ein.
   (Oder selbst: auf GitHub die Datei `admin/config.yml` öffnen → Stift-Symbol
   → bei `# base_url: …` die `# ` am Anfang löschen und deine Adresse
   einsetzen → **Commit changes**.)
10. Fertig: Auf `bg-naturfotografie.de/admin/` erscheint jetzt der Knopf
    **Sign In with GitHub**. Beim ersten Mal fragt GitHub einmal, ob du
    der App vertraust — bestätigen.

### Wer kann sich anmelden? Nur du.

- Sehen kann den Anmelde-Knopf jeder, der die Adresse kennt. Entscheidend
  ist aber, was danach passiert: Der Admin-Bereich speichert jede Änderung
  **mit deinem GitHub-Konto direkt ins Repo**. GitHub lässt das nur zu,
  wenn das Konto **Schreibrecht** auf `bg-naturfotografie.github.io` hat.
  Ein fremdes Konto kann also nichts speichern — es könnte höchstens die
  Inhalte ansehen, die ohnehin öffentlich auf deiner Webseite stehen.
- `ALLOWED_DOMAINS` sorgt zusätzlich dafür, dass dein Anmelde-Dienst nur
  für deine eigene Webseite arbeitet.
- **Einmal prüfen, wer Schreibrecht hat:** GitHub → Repo
  `bg-naturfotografie.github.io` → **Settings** → **Collaborators and teams**
  bzw. Organisation → **People**. Dort sollte nur dein Konto mit
  „Write“/„Admin“/„Owner“ stehen.
- Schütze dein GitHub-Konto mit **Zwei-Faktor-Anmeldung** (GitHub →
  Settings → Password and authentication). Dann reicht selbst ein
  gestohlenes Passwort nicht für den Admin-Bereich.

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

Bei jedem Text gibt es ein Feld **Deutsch** und eins **English**.
Lässt du English leer, steht auf der englischen Seite vorerst der
deutsche Text, und unten links erscheint **„⚠ Übersetzung fehlt“**
(siehe Abschnitt 4).

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

## 3. Geschichten

Alle 32 Geschichten aus der Google-Tabelle sind umgezogen und übersetzt.
Die Tabelle wird nicht mehr benutzt — neue Geschichten legst du im
Admin-Bereich unter **Geschichten** an.

---

## 4. Englisch

### Neue Texte übersetzen

Es gibt **keine automatische Übersetzung** — du trägst das Englisch
selbst ein (oder lässt es von mir übersetzen, siehe unten). Damit nichts
untergeht, zeigt der Admin-Bereich **unten links** einen Hinweis:

- **⚠ 3 Übersetzungen fehlen** — anklicken: Liste, wo genau Deutsch
  steht, aber das Englisch fehlt (z. B. „gartenleben26 › Bildbeschreibung“),
  mit Link „bearbeiten →“ zum passenden Bereich.
- **✓ Englisch vollständig** — alles da.

Nach dem Speichern dauert es 1–2 Minuten, bis der Hinweis den neuen
Stand zeigt (er prüft jede Minute, „Neu prüfen“ geht sofort).

Solange das Englisch fehlt, steht auf der englischen Seite einfach der
deutsche Text — kaputt geht nichts.

**Bequem:** Schreib mir „übersetze die fehlenden Texte“ — ich trage
alles, was im Hinweis steht, auf Englisch ein und schicke es dir als
Änderung zum Ansehen.

### Allgemein

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
- `admin/uebersetzungen-pruefen.js`: der Hinweis „Übersetzung fehlt“
  unten links im Admin-Bereich (liest nur, ändert nichts).
- `admin/` enthält den Admin-Bereich (Sveltia CMS, kostenlos, Open
  Source); die Formulare stehen in `admin/config.yml`.
- Lokal (Doppelklick auf eine HTML-Datei) laden die Daten nicht — der
  Browser erlaubt das bei `file://` nicht. Zum Testen am Rechner im
  Ordner `python -m http.server` starten und `localhost:8000` öffnen.

---

## 7. Änderungen von Claude: ansehen, übernehmen, rückgängig machen

Größere Umbauten bekommst du als **Pull Request** („Änderungsvorschlag“).
Solange du ihn nicht übernimmst, ändert sich an der echten Seite nichts.

**Ansehen, bevor es live geht:** Zu jedem Pull Request bekommst du von mir
einen **Vorschau-Link** — die komplette neue Seite zum Durchklicken.
Einziger Unterschied zur echten Seite: Formulare dort bitte nicht
abschicken, und Statistik/Karte können in der Vorschau eingeschränkt sein.

**Übernehmen (live schalten):**
1. Den Link zum Pull Request öffnen (github.com/bg-naturfotografie/bg-naturfotografie.github.io/pulls).
2. Unten auf **Merge pull request** → **Confirm merge** klicken.
3. Nach ca. 1–2 Minuten ist alles auf bg-naturfotografie.de live
   (einmal neu laden, ggf. mit Strg+F5).

**Rückgängig machen:**
1. Den (zusammengeführten) Pull Request auf GitHub öffnen — er steht unter
   **Pull requests → Closed**.
2. Unten auf **Revert** klicken. GitHub legt einen neuen Pull Request an,
   der genau diese Änderungen zurücknimmt.
3. Dort **Merge pull request** → **Confirm merge**. Nach 1–2 Minuten ist
   die alte Seite wieder da.

Nichts geht dabei verloren — GitHub hebt jede Version auf, und ein
Rückgängig lässt sich selbst wieder rückgängig machen.
