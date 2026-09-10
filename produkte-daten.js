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
     - fuer-veranstalter.html, portfolio-veranstalter.html
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
const SAAL_SHOP_URL = '';

/* ------------------------------------------------------------
   POSTER-FORMAT: es gibt nur noch EIN Standardformat (A4).
   A5/A6/A3 sind raus. Sonderformate laufen ausschließlich über
   das Anfrageformular (dann individueller Preis von dir).
   ------------------------------------------------------------- */
const POSTER_FORMAT = 'A4';

/* ------------------------------------------------------------
   PREISE — Einzelpreise, gelten für alle Motive gleich.
   ------------------------------------------------------------- */
const PREISE = {
  postkarte: 2.50,   // Einzelpreis, siehe Staffel unten
  poster: 12.00,     // Einzelpreis A4, siehe Staffel unten
  download: 4.00
};

/* ------------------------------------------------------------
   STAFFELPREISE — Mengenrabatt als STÜCKPREIS.

   Postkarten:  ab 1 Stück 2,50 EUR | ab 3 Stück 2,00 EUR | ab 5 Stück 1,80 EUR
   Poster (A4): ab 1 Stück 12,00 EUR | ab 2 Stück 10,00 EUR
   Lesezeichen: 2,00 EUR pro Stück, KEINE Staffel (3 für 5 € gibt es nur am Marktstand)

   WICHTIG — so wird gezählt: Es zählt die GESAMTZAHL über alle
   Motive hinweg, nicht pro Motiv. Wer 2 Entchen-Postkarten und
   1 Reiher-Postkarte nimmt, hat 3 Karten und zahlt damit 2,00 EUR
   pro Karte = 6,00 EUR. Postkarten, Poster und Lesezeichen werden
   dabei jeweils getrennt gezählt.

   So änderst du es: Zahlen anpassen oder eine Stufe ergänzen,
   z. B. { abMenge: 10, proStueck: 1.60 }. Stufen bitte aufsteigend
   nach abMenge sortiert lassen — der Shop nimmt automatisch die
   höchste Stufe, die erreicht ist.
   ------------------------------------------------------------- */
const STAFFEL = {
  postkarte: [
    { abMenge: 1, proStueck: 2.50 },
    { abMenge: 3, proStueck: 2.00 },
    { abMenge: 5, proStueck: 1.80 }
  ],
  poster: [
    { abMenge: 1, proStueck: 12.00 },
    { abMenge: 2, proStueck: 10.00 }
  ],
  /* Lesezeichen — online bewusst OHNE Mengenrabatt: 2,00 EUR pro
     Stück, egal wie viele. Der Marktpreis "3 für 5 €" geht als
     Stückpreis nicht glatt auf (1,666… EUR) und gilt deshalb nur am
     Stand. Nur eine Stufe = kein "Staffelpreis"-Hinweis und kein
     "Noch X mehr"-Hinweis im Warenkorb, das regelt der Shop
     automatisch.
     Falls du später doch eine Staffel willst, einfach eine zweite
     Zeile ergänzen, z. B. { abMenge: 5, proStueck: 1.80 }. */
  lesezeichen: [
    { abMenge: 1, proStueck: 2.00 }
  ]
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
