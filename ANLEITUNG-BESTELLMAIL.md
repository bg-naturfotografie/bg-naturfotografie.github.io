# Automatische Bestellmail an Kunden einrichten

Stand: 19.11.2026. Dauer: etwa 1 Stunde. Kosten: 0 €.

## Was danach passiert

Jemand klickt „Zahlungspflichtig bestellen“. Dann:

1. **Der Kunde** bekommt sofort eine Mail mit Bestellnummer, Artikeln, Betrag und deinen Zahlungsdaten (IBAN bzw. PayPal-Knopf). Deine AGB mit Widerrufsbelehrung hängen als PDF an.
2. **Du** bekommst eine unsichtbare Kopie dieser Mail (BCC).
3. **Deine Formspree-Bestellmail** kommt wie bisher und hat eine neue Zeile **„Kundenmail: verschickt …“** oder **„Kundenmail: FEHLGESCHLAGEN … bitte selbst schreiben“**.
4. **Zustellung prüfen:** In Brevo unter *Transactional → Logs* siehst du bei jeder Mail „Delivered“ (angekommen) oder „Hard bounce“ (Adresse falsch).

Solange die Einrichtung nicht fertig ist, läuft der Shop genau wie jetzt. Es geht nichts kaputt, wenn du mittendrin aufhörst.

## Du brauchst

- dein Cloudflare-Konto (das gleiche wie für das Admin-Login)
- den Zugang zu deinem Domain-Anbieter (dort, wo du `bg-naturfotografie.de` gekauft hast)
- deine IBAN und deinen PayPal.me-Namen

---

## Teil A: Brevo (verschickt die Mails)

1. Auf **brevo.com** ein kostenloses Konto anlegen („Free“-Tarif, 300 Mails am Tag). Firmenname: BG Naturfotografie. Als Adresse kannst du die Postflex-Adresse angeben.
2. **Domain bestätigen**, damit die Mails nicht im Spam landen: oben rechts auf deinen Namen → **Senders, Domains & Dedicated IPs** → **Domains** → **Add a domain** → `bg-naturfotografie.de`.
   - Brevo zeigt dir 3–4 Einträge (meist `brevo-code`, DKIM und DMARC). Lass das Fenster offen.
3. In einem zweiten Tab bei deinem **Domain-Anbieter** die **DNS-Einstellungen** von `bg-naturfotografie.de` öffnen und jeden Eintrag genau so anlegen, wie Brevo ihn zeigt (Typ, Name, Wert). **Bestehende Einträge nicht löschen**, vor allem nicht die für GitHub Pages.
   - Zurück bei Brevo **Verify** klicken. Das kann bis zu ein paar Stunden dauern, dann einfach später noch mal klicken.
4. **Absender anlegen:** **Senders** → **Add a sender** → Name `BG Naturfotografie`, E-Mail `shop@bg-naturfotografie.de`. Ein Postfach brauchst du dafür nicht: Antworten der Kunden gehen an deine normale Adresse (Teil C).
5. **API-Schlüssel holen:** oben rechts → **SMTP & API** → Reiter **API Keys** → **Generate a new API key** → Name `bestellmail`.
   - Zugriff: **Eingeschränkt**. Berechtigungen: **Transaktions-E-Mails: Alle**, **Konto: Lesen**, alles andere **Keine**.
   - Ablauf (Feld *Expiry*): **„No expiration“ / „Kein Ablauf“** wählen. Dann hält ihn der wöchentliche Wachhalter aus Schritt 12b dauerhaft aktiv. Hast du stattdessen „1 Jahr“ gewählt: Ablaufdatum in den Kalender, eine Woche vorher neuen Schlüssel erzeugen und in Schritt 12 bei `BREVO_API_KEY` austauschen. Brevo mailt dir 3 Tage vorher.
   - Kopieren und kurz in einer Notiz-App zwischenspeichern. Er wird nur einmal angezeigt. Nicht per Chat oder Mail weitergeben.
6. **Auftragsverarbeitung (DSGVO):** Brevo stellt den AV-Vertrag in den Kontoeinstellungen bereit (meist unter *Settings → Security / Legal* oder als Häkchen bei der Anmeldung). Einmal annehmen bzw. als PDF speichern und zu deinen Unterlagen legen.

## Teil B: Turnstile (unsichtbarer Spam-Schutz)

7. Bei **Cloudflare** links **Turnstile** → **Add widget**.
   - Name: `Shop-Kasse`
   - Hostname: `bg-naturfotografie.de`
   - Widget Mode: **Managed**
   - → **Create**
8. Du bekommst zwei Schlüssel:
   - **Site Key** (öffentlich): den trägst du in Teil D auf der Website ein.
   - **Secret Key** (geheim): den trägst du in Teil C beim Worker ein.

## Teil C: Den Bestellmail-Dienst (Worker) anlegen

So wie beim Admin-Login, nur mit anderem Code:

9. Cloudflare → **Workers & Pages** → **Create** → **Start with Hello World!** → Name: `bestellmail` → **Deploy**.
   *Nicht* „Import a repository“ wählen.
10. **Edit code**: den Beispielcode komplett löschen, den Inhalt von `werkzeuge/cloudflare-bestellmail.js` hineinkopieren → **Deploy**.
11. Oben steht die Adresse, z. B. `https://bestellmail.DEIN-NAME.workers.dev`. **Notieren.**
12. **Settings** → **Variables and Secrets** → für jede Zeile **Add**:

| Name | Typ | Wert |
|---|---|---|
| `BREVO_API_KEY` | **Secret** | der Schlüssel aus Schritt 5 |
| `TURNSTILE_SECRET` | **Secret** | der Secret Key aus Schritt 8 |
| `IBAN` | **Secret** | deine IBAN |
| `KONTOINHABER` | Text | Name genau wie auf dem Konto |
| `BIC` | Text | optional, sonst weglassen |
| `PAYPAL_ME` | Text | nur der Name, z. B. `bgnaturfotografie` (ohne Link) |
| `ABSENDER` | Text | `shop@bg-naturfotografie.de` |
| `ANTWORT_AN` | Text | deine normale Mailadresse |
| `KOPIE_AN` | Text | wohin deine Kopie gehen soll (meist dieselbe) |
| `AGB_PDF` | Text | `https://bg-naturfotografie.de/dokumente/agb-und-widerruf.pdf` |
| `ERLAUBTE_SEITE` | Text | `https://bg-naturfotografie.de` |

→ **Deploy** bzw. speichern. Die IBAN steht damit nur noch bei Cloudflare und nicht in der Mail-Logik der Website.

12b. **Wachhalten einschalten:** Brevo-Schlüssel verfallen nach 90 Tagen ohne Nutzung. Damit das bei wenigen Bestellungen nicht passiert: im Worker **Settings** → **Trigger Events** (bzw. **Triggers** → **Cron Triggers**) → **Add** → **Cron expression** `0 6 * * 1` (jeden Montag früh) → speichern. Der Worker fragt dann einmal pro Woche kurz bei Brevo nach, mehr nicht.

## Teil D: Den Shop einschalten

13. Auf GitHub die Datei `produkte-bestellen.html` öffnen → Stift-Symbol → mit **Strg+F** nach `BESTELLMAIL — HIER EINTRAGEN` suchen. Darunter stehen zwei leere Zeilen:

```
  var BESTELLMAIL_URL = '';
  var TURNSTILE_SITEKEY = '';
```

   Zwischen die Hochkommas einsetzen:
   - bei `BESTELLMAIL_URL` die Adresse aus Schritt 11
   - bei `TURNSTILE_SITEKEY` den **Site Key** aus Schritt 8 (den öffentlichen!)

   → **Commit changes**. Nach 1–2 Minuten ist es live.

## Teil E: Testen

14. Auf `bg-naturfotografie.de` eine echte Testbestellung machen, mit einer deiner eigenen Mailadressen als Kunde (z. B. 1 Lesezeichen, Überweisung).
15. Prüfen:
    - Kam die Kundenmail an? Mit PDF im Anhang? Nicht im Spam?
    - Kam deine BCC-Kopie?
    - Steht in der Formspree-Mail „Kundenmail: verschickt …“?
    - Zeigt Brevo unter *Transactional → Logs* „Delivered“?
16. Testbestellung einfach ignorieren (oder dir selbst „stornieren“).

## Wenn etwas nicht klappt

| Was du siehst | Was es heißt |
|---|---|
| Formspree-Mail: „FEHLGESCHLAGEN (Spam-Schutz)“ | Site Key oder Secret Key vertauscht oder falsch kopiert (Schritt 8, 12, 13) |
| „FEHLGESCHLAGEN (Brevo: …unauthorized…)“ | `BREVO_API_KEY` falsch |
| „FEHLGESCHLAGEN (Brevo: …sender…)“ | Domain oder Absender bei Brevo noch nicht bestätigt (Schritt 3–4) |
| „FEHLGESCHLAGEN (keine Verbindung)“ | `BESTELLMAIL_URL` falsch geschrieben oder Worker nicht deployt |
| Kundenmail landet im Spam | DNS-Einträge aus Schritt 3 fehlen oder sind noch nicht bestätigt |

In jedem Fall gilt: **Die Bestellung kommt trotzdem bei dir an.** Dann schreibst du dem Kunden wie früher selbst.

## Was läuft ab, was muss ich mir merken?

Nur **eine** Sache kann ablaufen: der **Brevo-API-Schlüssel** (`BREVO_API_KEY`).

- Mit „No expiration“ + Wachhalter (Schritt 12b): läuft nicht ab. Brevo deaktiviert sonst nur Schlüssel, die 90 Tage lang nicht benutzt wurden, und der Wachhalter benutzt ihn jede Woche.
- Mit festem Datum (z. B. 1 Jahr): an diesem Tag ist Schluss. Dann vorher neuen Schlüssel erzeugen (Schritt 5) und bei Cloudflare austauschen (Schritt 12).
- Ob er noch lebt: Brevo → **SMTP & API** → **API Keys**. Dort stehen „Expires on“ und „Last used on“. „Last used“ sollte höchstens eine Woche alt sein.
- Wenn er doch abläuft: Es geht **keine Bestellung verloren**. Die Formspree-Mail sagt dann „Kundenmail: FEHLGESCHLAGEN (Brevo: …unauthorized…)“, und du schreibst dem Kunden selbst.

Nicht ablaufen: der Worker, Turnstile (Site Key und Secret Key), die DNS-Einträge, der Brevo-Free-Tarif.

## Widerrufsfunktion (seit Nov. 2026)

Seit 19.06.2026 muss jeder Onlineshop einen Knopf **„Vertrag widerrufen“** haben (§ 356a BGB). Er steht unten auf jeder Seite und führt zu `widerruf.html`. Dort trägt der Kunde Name, Bestellung und E-Mail ein und klickt **„Widerruf bestätigen“**.

- Der Worker schickt ihm sofort eine **Eingangsbestätigung** mit Datum und Uhrzeit, du bekommst eine Kopie (BCC). Dafür muss der Worker-Code aktuell sein: Cloudflare → Worker `bestellmail` → **Edit code** → alles ersetzen durch den Inhalt von `werkzeuge/cloudflare-bestellmail.js` → **Deploy**. Variablen bleiben, wie sie sind.
- Klappt das nicht, kommt der Widerruf über Formspree bei dir an, Betreff **„[WIDERRUF …] Eingangsbestätigung bitte VON HAND senden“**. Dann bitte am selben Tag selbst kurz antworten: „Ich bestätige den Eingang deines Widerrufs vom [Datum, Uhrzeit] zu Bestellung [Nr.].“
- Danach: Geld innerhalb von 14 Tagen auf demselben Weg zurück. Zurückschicken muss der Kunde nichts.
- Ändern sich Worker-Adresse oder Site Key, müssen sie auch in `widerruf.html` angepasst werden (gleiche zwei Zeilen wie in Schritt 13).

## Später ändern

- **AGB geändert?** Dann muss auch das PDF neu: `agb.html` im Browser öffnen → Drucken → „Als PDF speichern“ → auf GitHub in den Ordner `dokumente/` hochladen und `agb-und-widerruf.pdf` ersetzen. (Oder sag Claude Bescheid.)
- **IBAN oder PayPal ändern:** nur bei Cloudflare (Schritt 12). Zusätzlich wie gehabt den verschlüsselten Block in `danke.html` mit `zahlungsdaten-verschluesseln.html` erneuern.
- **Ausschalten:** in `produkte-bestellen.html` die beiden Werte wieder leeren (`''`).
