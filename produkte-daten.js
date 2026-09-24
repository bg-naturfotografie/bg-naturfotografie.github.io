/* ============================================================
   PRODUKT-KATALOG & PREISE
   ============================================================

   Poster & Postkarten kommen weiterhin automatisch aus
   galerie-daten.js — jedes Bild, das dort steht, taucht im Shop
   unter der passenden Themen-Kategorie auf.
   LESEZEICHEN kommen ebenfalls aus galerie-daten.js (Felder
   bereitsLesezeichen / bestandLesezeichen, Bild im Ordner
   bilder/lesezeichen/). Hier trägst du nur Sticker ein, plus die
   Preise für alles.

   ------------------------------------------------------------
   BESTELLWEG: Anfrage statt Sofortkauf.
   Der Shop zeigt bei jedem Produkt einen "Zur Anfrage
   hinzufügen"-Button. Ausgewählte Produkte landen gesammelt im
   Anfrageformular unten auf der Seite (Formspree) und werden dir
   als Mail zugeschickt — du meldest dich danach mit einem
   Angebot/einer Rechnung zurück. Kein Shopify, kein Sofort-
   Checkout nötig.

   ------------------------------------------------------------
   MERCH: aktuell bewusst NICHT im Sortiment.
   Der Shop hat keine Merch-Produktliste mehr — stattdessen steht
   dort nur noch ein Hinweis, dass Tassen, Caps & Co. auf Anfrage
   möglich sind (Kleidung ausgenommen, zu viel Retoure). Es gibt
   hier deshalb auch keine MERCH-Liste mehr zu pflegen. Falls du
   Merch später doch wieder fest ins Sortiment nimmst, sag
   Bescheid.
   ============================================================= */

/* ------------------------------------------------------------
   DRUCKPARTNER — wer druckt was.
   Wird im Shop auf jeder Produktkarte angezeigt ("Gedruckt bei
   ... · aus Halstenbek versendet"). Wechselst du mal die
   Druckerei, reicht es, den Namen HIER zu ändern — die Karten
   ziehen automatisch nach.

   ACHTUNG: In diesen Dateien steht der Name zusätzlich als
   fester Text und muss dann von Hand mitgeändert werden:
     - produkte-bestellen.html  (Kasten "Wer druckt was?" oben)
     - index.html               (Zeile unter den Mitnehmen-Kacheln)
     - agb.html                 (Punkt 3)
     - datenschutz.html         (Abschnitt Bestellanfragen)
     - portfolio-veranstalter.html
   ------------------------------------------------------------- */
const DRUCKPARTNER = {
  postkarte:   'WIRmachenDRUCK',
  poster:      'Saal Digital',
  lesezeichen: 'Peterprint'
};

/* ------------------------------------------------------------
   SAAL-DIGITAL-SHOP — dein Shop für Formate GRÖSSER als A4
   (und für A4 auf anderen Materialien: Alu-Dibond, Acryl,
   Leinwand, Fine Art ...).

   Einfach den kompletten Link zu deinem Shop bzw. deiner
   Profilseite zwischen die Anführungszeichen setzen, z. B.
     const SAAL_SHOP_URL = 'https://www.saal-digital.net/profiles/.../';

   Solange hier '' (leer) steht:
     - zeigt der Bereich "Größer als A4" im Shop statt des Buttons
       den Hinweis, Größen über das Anfrageformular anzufragen,
     - erscheint auf den Motivkarten KEIN Saal-Link.
   Sobald der Link drinsteht, taucht alles automatisch auf.
   ------------------------------------------------------------- */
const SAAL_SHOP_URL = 'https://photo-portal.shop/share/ktL7QZy/';

/* ------------------------------------------------------------
   POSTER-FORMAT: es gibt nur noch EIN Standardformat (A4).
   A5/A6/A3 sind raus. Sonderformate laufen ausschließlich über
   das Anfrageformular (dann individueller Preis von dir).
   ------------------------------------------------------------- */
const POSTER_FORMAT = 'A4';

/* ------------------------------------------------------------
   PREISE — Einzelpreise, gelten für alle Motive gleich.
   postkarte/poster stehen hier nur noch zur Orientierung — der
   Shop rechnet ausschließlich mit STAFFEL (unten). Wirklich
   benutzt wird aus diesem Block nur PREISE.download.
   ------------------------------------------------------------- */
const PREISE = {
  postkarte: 2.00,   // Einzelpreis, siehe Staffel unten
  poster: 9.00,      // Einzelpreis A4, siehe Staffel unten
  download: 4.00
};

/* ------------------------------------------------------------
   STAFFELPREISE — Mengenrabatt als PAKETPREIS je Stufe.

   Postkarten:  1 für 2,00 EUR | 3 für 5,00 EUR | 5 für 7,50 EUR
   Lesezeichen: 1 für 2,00 EUR | 3 für 5,00 EUR | 5 für 7,50 EUR
   Poster (A4): 1 für 9,00 EUR | 2 für 15,00 EUR

   So ist eine Stufe zu lesen:
     { abMenge: 3, fuer: 5.00 }  =  "3 Stück kosten zusammen 5,00 EUR"
   Daraus ergibt sich der Stückpreis dieser Stufe (fuer / abMenge),
   und der gilt für JEDES Stück, sobald die Stufe erreicht ist —
   auch über die Paketgröße hinaus:
     4 Postkarten  -> 4 × 1,666… = 6,67 EUR   (3er-Stufe)
     5 Postkarten  -> 5 × 1,50   = 7,50 EUR   (5er-Stufe)
     7 Postkarten  -> 7 × 1,50   = 10,50 EUR
     3 Poster      -> 3 × 7,50   = 22,50 EUR  (2er-Stufe)

   Warum Paketpreis statt Stückpreis? "3 für 5 €" geht als
   Stückpreis nicht glatt auf (1,666… EUR). Früher stand hier
   proStueck, und genau deshalb gab es die Lesezeichen-Staffel nur
   am Marktstand. Jetzt rechnet der Shop mit dem exakten Bruch und
   rundet erst die SUMME je Produktart auf den Cent. 3 Karten
   kosten damit wirklich 5,00 EUR und nicht 3 × 1,67 = 5,01 EUR.
   Die Zeilen im Warenkorb werden so verteilt, dass sie zusammen
   exakt diese Summe ergeben (siehe zeilenSumme im Shop).

   WICHTIG — so wird gezählt: Es zählt die GESAMTZAHL über alle
   Motive hinweg, nicht pro Motiv. Wer 2 Entchen-Postkarten und
   1 Reiher-Postkarte nimmt, hat 3 Karten und zahlt 5,00 EUR.
   Postkarten und Lesezeichen sind außerdem MISCHBAR (siehe
   STAFFEL_GRUPPEN unten): 2 Postkarten + 1 Lesezeichen = 3 Stück
   = 5,00 EUR. Poster werden immer getrennt gezählt.

   So änderst du es: Zahlen anpassen oder eine Stufe ergänzen,
   z. B. { abMenge: 10, fuer: 13.00 }. Stufen bitte aufsteigend
   nach abMenge sortiert lassen — der Shop nimmt automatisch die
   höchste Stufe, die erreicht ist. Die erste Stufe muss
   abMenge: 1 haben (das ist der Einzelpreis).
   ------------------------------------------------------------- */
const STAFFEL = {
  postkarte: [
    { abMenge: 1, fuer: 2.00 },   // 1 Karte    = 2,00 EUR
    { abMenge: 3, fuer: 5.00 },   // 3 Karten   = 5,00 EUR (je 1,666…)
    { abMenge: 5, fuer: 7.50 }    // 5 Karten   = 7,50 EUR (je 1,50)
  ],
  poster: [
    { abMenge: 1, fuer: 9.00 },   // 1 Poster   = 9,00 EUR
    { abMenge: 2, fuer: 15.00 }   // 2 Poster   = 15,00 EUR (je 7,50)
  ],
  /* Lesezeichen — gleiche Staffel wie Postkarten, gilt jetzt auch
     online (vorher nur am Marktstand, weil "3 für 5 €" als
     Stückpreis nicht aufging — das löst der Paketpreis). */
  lesezeichen: [
    { abMenge: 1, fuer: 2.00 },
    { abMenge: 3, fuer: 5.00 },
    { abMenge: 5, fuer: 7.50 }
  ]
};

/* ------------------------------------------------------------
   STAFFEL-GRUPPEN — welche Produktarten gemeinsam zählen.

   Alle Typen in einer Gruppe werden für die Staffel ZUSAMMEN-
   gezählt: 2 Postkarten + 1 Lesezeichen erreichen also die
   3er-Stufe, 3 Postkarten + 2 Lesezeichen die 5er-Stufe.

   Maßgeblich ist die Staffel des ERSTEN Typs der Gruppe (hier
   STAFFEL.postkarte). STAFFEL.lesezeichen bitte trotzdem gleich
   halten — sie wird benutzt, sobald du die Gruppe auflöst.

   Mischung wieder abschalten: die Zeile "karten: […]" löschen
   (oder das Objekt leer lassen: const STAFFEL_GRUPPEN = {};).
   Dann zählt jede Produktart wieder für sich.

   Neue Gruppe, z. B. später Sticker dazu: einfach 'sticker' in
   die Liste aufnehmen UND eine gleiche STAFFEL.sticker anlegen.
   ------------------------------------------------------------- */
const STAFFEL_GRUPPEN = {
  karten: ['postkarte', 'lesezeichen']
};

/* Höchstmenge, die pro Position im Anfrageformular wählbar ist. */
const MAX_MENGE = 50;

/* ------------------------------------------------------------
   VERSANDKOSTEN — Pauschalen, keine Echtzeit-Berechnung.

   Warum Pauschalen? Du musst dem Kunden VOR dem Absenden einer
   verbindlichen Bestellung den Gesamtpreis inkl. Versand nennen
   (§ 312j BGB). Du musst aber NICHT centgenau das echte Porto
   abrechnen — eine realistische Pauschale ist völlig üblich und
   zulässig. Mal zahlst du drauf, mal bleibt was übrig.

   Welche Stufe genommen wird, entscheidet der Warenkorb:
     - enthält mindestens ein Poster  -> 'gross'   (steife Verpackung)
     - mehr als kleinMaxStueck Teile  -> 'mittel'
     - sonst                          -> 'klein'
   Reine Download-Bestellungen bekommen gar keinen Versand.

   Ändern willst du das hier: einfach die Zahlen anpassen. Wenn du
   z. B. den versandkostenfreien Einkauf abschaffen willst, setze
   kostenlosAb auf null.
   ------------------------------------------------------------- */
const VERSAND = {
  /* Ab diesem Warenwert (ohne Versand) entfällt der Versand. */
  kostenlosAb: 30.00,

  /* Bis zu dieser Stückzahl gilt die kleine Stufe (nur Kleinteile). */
  kleinMaxStueck: 5,

  stufen: {
    klein:  { preis: 1.80, label: 'Warensendung / Großbrief' },
    mittel: { preis: 2.90, label: 'Maxibrief' },
    gross:  { preis: 4.50, label: 'Maxibrief / Päckchen (mit A4-Poster)' }
  }
};

/* ------------------------------------------------------------
   ABHOLUNG — Text, der bei "Abholung in Halstenbek" erscheint.
   Bewusst ohne genaue Adresse: den Treffpunkt machst du per Mail
   aus, sobald die Bestellung da ist.
   ------------------------------------------------------------- */
const ABHOLUNG_HINWEIS = 'Kein Versand, kein Versandkostenanteil. Den Übergabe­termin machen wir per Mail aus.';

/* ------------------------------------------------------------
   STICKER
   (Lesezeichen stehen NICHT mehr hier — die kommen jetzt direkt
   aus galerie-daten.js, siehe oben.)

   SOLANGE DIESE LISTE LEER IST, ist der ganze Sticker-Bereich im
   Shop unsichtbar — inklusive des Sprunglinks "Sticker" oben auf
   der Shopseite. Sobald hier der erste Eintrag steht, taucht
   alles automatisch wieder auf. Nichts im HTML umschalten nötig.

   Schema pro Eintrag:
   {
     id: "eindeutige-id",
     motiv: "Anzeigename",
     kategorie: "Teichleben" | "Gartenleben" | "Waldleben" | "Reduktion" | null,
     preis: 3.00,
     mockups: ["bilder/mockups/....jpg"]
   }
   ------------------------------------------------------------- */
const STICKER = [

  // BEISPIEL ZUM KOPIEREN (auskommentiert):
  // {
  //   id: 'sticker-eichhoernchen',
  //   motiv: 'Eichhörnchen - im Sprung',
  //   kategorie: 'Waldleben',
  //   preis: 3.00,
  //   mockups: ['bilder/mockups/eichhoernchen-sticker-1.jpg']
  // }

];
