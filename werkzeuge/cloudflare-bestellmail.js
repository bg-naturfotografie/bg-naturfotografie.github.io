/* ============================================================
   BESTELLMAIL-DIENST für den Shop (Cloudflare Worker)
   ============================================================
   Was er macht:
     Nach „Zahlungspflichtig bestellen“ schickt der Shop die
     Bestellung hierher. Der Dienst
       1. prüft den unsichtbaren Spam-Schutz (Cloudflare Turnstile),
       2. schickt dem Kunden über Brevo eine Mail mit Bestellnummer,
          Positionen, Betrag und Zahlungsdaten, die AGB mit
          Widerrufsbelehrung hängen als PDF an,
       3. schickt dir eine unsichtbare Kopie (BCC),
       4. meldet dem Shop „verschickt“ oder „fehlgeschlagen“. Das
          steht dann in deiner Formspree-Bestellmail.
   Außerdem (seit Nov. 2026): Widerrufe von der Seite widerruf.html
   bekommen sofort eine Eingangsbestätigung (Pflicht nach § 356a BGB).
   Die Bestellung selbst geht wie bisher über Formspree an dich.
   Fällt dieser Dienst aus, geht also keine Bestellung verloren,
   nur die Kundenmail fehlt (und deine Bestellmail sagt dir das).

   EINSTELLUNGEN bei Cloudflare (Worker → Settings → Variables and Secrets):
     BREVO_API_KEY      API-Schlüssel von Brevo                 (Secret!)
     TURNSTILE_SECRET   Geheimer Schlüssel von Turnstile        (Secret!)
     IBAN               deine IBAN                              (Secret)
     KONTOINHABER       Name wie auf dem Konto                  (Text)
     BIC                optional                                (Text)
     PAYPAL_ME          dein PayPal.me-Name, ohne Link          (Text)
     ABSENDER           z. B. shop@bg-naturfotografie.de        (Text)
                        (Domain muss bei Brevo bestätigt sein)
     ANTWORT_AN         deine echte Mailadresse für Antworten   (Text)
     KOPIE_AN           wohin die BCC-Kopie geht                (Text)
     AGB_PDF            https://bg-naturfotografie.de/dokumente/agb-und-widerruf.pdf
     ERLAUBTE_SEITE     https://bg-naturfotografie.de           (Text)

   Was der Dienst bewusst NICHT tut:
     - Er speichert nichts. Keine Datenbank, kein Protokoll mit
       Kundendaten (Brevo hat ein eigenes Versandprotokoll).
     - Er nimmt keine freien Texte des Kunden in die Mail (keine
       Anmerkung), damit niemand ihn als Spam-Schleuder nutzt.
   ============================================================ */

const MAX_GESAMT = 500;          // Bestellungen darüber: keine Automatik
const MAX_POSITIONEN = 40;

export default {
  /* WACHHALTEN: Brevo-Schlüssel verfallen nach 90 Tagen ohne Nutzung.
     Ein wöchentlicher Zeitplan (Cron Trigger, siehe Anleitung) ruft
     hier kurz die Kontoinfo ab, dann bleibt der Schlüssel aktiv.
     Braucht beim Schlüssel die Berechtigung „Konto: Lesen“. */
  async scheduled(event, env) {
    await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': env.BREVO_API_KEY || '', 'Accept': 'application/json' },
    }).catch(() => null);
  },

  async fetch(request, env) {
    const erlaubt = (env.ERLAUBTE_SEITE || 'https://bg-naturfotografie.de').replace(/\/$/, '');
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': erlaubt,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const antwort = (status, daten) => new Response(JSON.stringify(daten), {
      status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return antwort(405, { ok: false, grund: 'nur POST' });
    if (origin !== erlaubt && origin !== erlaubt.replace('https://', 'https://www.')) {
      return antwort(403, { ok: false, grund: 'falsche Seite' });
    }

    let d;
    try { d = await request.json(); } catch (e) { return antwort(400, { ok: false, grund: 'kein JSON' }); }

    /* ---------- 1. Spam-Schutz ---------- */
    const pruefung = new FormData();
    pruefung.append('secret', env.TURNSTILE_SECRET || '');
    pruefung.append('response', String(d.turnstile || ''));
    pruefung.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: pruefung })
      .then(r => r.json()).catch(() => ({ success: false }));
    if (!ts.success) return antwort(403, { ok: false, grund: 'Spam-Schutz' });

    /* ---------- WIDERRUF (Seite widerruf.html, § 356a BGB) ----------
       Schickt dem Kunden sofort eine Eingangsbestätigung mit Inhalt,
       Datum und Uhrzeit, und dir eine Kopie (BCC). */
    if (d.typ === 'widerruf') return widerrufBestaetigen(d, env, antwort);

    /* ---------- 2. Eingaben prüfen und säubern ---------- */
    const sauber = (s, max) => String(s == null ? '' : s)
      .replace(/https?:\/\/\S+|www\.\S+/gi, '')   // keine Links
      .replace(/[<>]/g, '')                        // kein HTML
      .replace(/\s+/g, ' ').trim().slice(0, max);
    const email = String(d.email || '').trim().slice(0, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return antwort(400, { ok: false, grund: 'E-Mail' });
    const name = sauber(d.name, 80) || 'Kundin/Kunde';
    const nr = String(d.nr || '');
    if (!/^BG-\d{4,6}$/.test(nr)) return antwort(400, { ok: false, grund: 'Bestellnummer' });
    const zahlweg = ['ueberweisung', 'paypal', 'bar'].includes(d.zahlweg) ? d.zahlweg : 'ueberweisung';
    const liefer = sauber(d.lieferart, 80) || 'Versand';
    const en = d.sprache === 'en';

    const positionen = (Array.isArray(d.positionen) ? d.positionen : []).slice(0, MAX_POSITIONEN).map(p => ({
      menge: Math.max(1, Math.min(99, parseInt(p.menge, 10) || 1)),
      text: sauber(p.text, 90),
      summe: Math.max(0, Math.min(MAX_GESAMT, Number(p.summe) || 0)),
    })).filter(p => p.text);
    if (!positionen.length) return antwort(400, { ok: false, grund: 'keine Positionen' });

    const versand = Math.max(0, Math.min(20, Number(d.versand) || 0));
    const ware = positionen.reduce((s, p) => s + p.summe, 0);
    const gesamt = Math.round((ware + versand) * 100) / 100;
    if (gesamt <= 0 || gesamt > MAX_GESAMT) return antwort(400, { ok: false, grund: 'Betrag' });

    /* ---------- 3. Mail zusammenbauen ---------- */
    const T = (de, eng) => (en ? eng : de);
    const euro = n => n.toFixed(2).replace('.', ',') + ' €';
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const iban = String(env.IBAN || '').replace(/\s+/g, '').toUpperCase();
    const ibanSchoen = iban.replace(/(.{4})/g, '$1 ').trim();
    const paypalLink = env.PAYPAL_ME
      ? 'https://paypal.me/' + encodeURIComponent(env.PAYPAL_ME) + '/' + gesamt.toFixed(2) : '';   // ohne „EUR“: sonst zeigt die PayPal-App oft 0,00 €

    let zahlungText, zahlungHtml;
    if (zahlweg === 'bar') {
      zahlungText = T('Du zahlst bar bei der Übergabe. Ich melde mich in den nächsten Tagen persönlich mit einem Vorschlag für Ort und Zeit.',
        'You pay cash at the hand-over. I will get back to you personally in the next few days with a suggestion for place and time.');
      zahlungHtml = '<p>' + esc(zahlungText) + '</p>';
    } else if (zahlweg === 'paypal' && paypalLink) {
      zahlungText = T('Bitte bezahle innerhalb von 7 Tagen per PayPal:', 'Please pay within 7 days via PayPal:') + '\n' + paypalLink +
        '\n' + T('Steht bei PayPal 0,00 €, trag bitte ' + euro(gesamt) + ' ein. Wichtig: Schreib die Bestellnummer ' + nr + ' in das Feld „Mitteilung“.', 'If PayPal shows 0.00, please enter ' + euro(gesamt) + '. Important: put the order number ' + nr + ' in the message field.');
      zahlungHtml = '<p>' + T('Bitte bezahle innerhalb von 7 Tagen per PayPal:', 'Please pay within 7 days via PayPal:') + '</p>' +
        '<p><a href="' + esc(paypalLink) + '" style="display:inline-block;background:#ffc439;color:#111;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">' +
        T('Mit PayPal bezahlen', 'Pay with PayPal') + ' · ' + euro(gesamt) + '</a></p>' +
        '<p>' + esc(T('Steht bei PayPal 0,00 €, trag bitte ' + euro(gesamt) + ' ein. Wichtig: Schreib die Bestellnummer ' + nr + ' in das Feld „Mitteilung“.', 'If PayPal shows 0.00, please enter ' + euro(gesamt) + '. Important: put the order number ' + nr + ' in the message field.')) + '</p>';
    } else {
      const zeilen = [
        [T('Empfänger', 'Recipient'), env.KONTOINHABER || ''],
        ['IBAN', ibanSchoen],
      ];
      if (env.BIC) zeilen.push(['BIC', env.BIC]);
      zeilen.push([T('Betrag', 'Amount'), euro(gesamt)], [T('Verwendungszweck', 'Reference'), nr]);
      zahlungText = T('Bitte überweise innerhalb von 7 Tagen:', 'Please transfer within 7 days:') + '\n' +
        zeilen.map(z => z[0] + ': ' + z[1]).join('\n');
      zahlungHtml = '<p>' + T('Bitte überweise innerhalb von 7 Tagen:', 'Please transfer within 7 days:') + '</p>' +
        '<table cellpadding="4" style="border-collapse:collapse">' +
        zeilen.map(z => '<tr><td style="color:#555">' + esc(z[0]) + '</td><td><strong>' + esc(z[1]) + '</strong></td></tr>').join('') +
        '</table>';
    }

    const posText = positionen.map(p => p.menge + ' × ' + p.text + ' — ' + euro(p.summe)).join('\n');
    const posHtml = positionen.map(p => '<tr><td>' + p.menge + ' ×</td><td>' + esc(p.text) +
      '</td><td style="text-align:right">' + euro(p.summe) + '</td></tr>').join('');

    const betreff = T('Deine Bestellung ' + nr + ' bei BG Naturfotografie', 'Your order ' + nr + ' from BG Naturfotografie');
    const schluss = zahlweg === 'bar'
      ? T('Die Rechnung bekommst du bei der Übergabe.', 'You get the invoice at the hand-over.')
      : T('Sobald das Geld da ist, bekommst du die Rechnung per E-Mail und deine Bestellung geht auf den Weg.',
          'As soon as the money arrives, you get the invoice by e-mail and your order is on its way.');

    const text =
      T('Hallo ', 'Hello ') + name + ',\n\n' +
      T('vielen Dank für deine Bestellung! Hier noch einmal alles zum Nachlesen.', 'thank you for your order! Here is everything again for your records.') + '\n\n' +
      T('Bestellnummer: ', 'Order number: ') + nr + '\n' +
      T('Lieferung: ', 'Delivery: ') + liefer + '\n\n' +
      posText + '\n' +
      (versand ? T('Versand: ', 'Shipping: ') + euro(versand) + '\n' : '') +
      T('Gesamt: ', 'Total: ') + euro(gesamt) + '\n' +
      T('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 'No VAT is charged under § 19 UStG (small business).') + '\n\n' +
      zahlungText + '\n\n' + schluss + '\n\n' +
      T('Im Anhang findest du meine AGB mit Widerrufsbelehrung und Muster-Widerrufsformular.',
        'Attached are my terms with the cancellation policy and model withdrawal form.') + '\n' +
      T('Fragen oder Stornierung: einfach auf diese Mail antworten.', 'Questions or cancellation: just reply to this e-mail.') + '\n\n' +
      T('Herzliche Grüße aus Halstenbek', 'Warm regards from Halstenbek') + '\nBenedict Gertz · BG Naturfotografie\nhttps://bg-naturfotografie.de';

    const html =
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:560px">' +
      '<p>' + T('Hallo ', 'Hello ') + esc(name) + ',</p>' +
      '<p>' + T('vielen Dank für deine Bestellung! Hier noch einmal alles zum Nachlesen.', 'thank you for your order! Here is everything again for your records.') + '</p>' +
      '<p><strong>' + T('Bestellnummer', 'Order number') + ': ' + nr + '</strong><br>' + T('Lieferung', 'Delivery') + ': ' + esc(liefer) + '</p>' +
      '<table cellpadding="4" style="border-collapse:collapse;width:100%">' + posHtml +
      (versand ? '<tr><td></td><td>' + T('Versand', 'Shipping') + '</td><td style="text-align:right">' + euro(versand) + '</td></tr>' : '') +
      '<tr><td></td><td><strong>' + T('Gesamt', 'Total') + '</strong></td><td style="text-align:right"><strong>' + euro(gesamt) + '</strong></td></tr></table>' +
      '<p style="font-size:13px;color:#555">' + T('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 'No VAT is charged under § 19 UStG (small business).') + '</p>' +
      zahlungHtml + '<p>' + esc(schluss) + '</p>' +
      '<p style="font-size:13px;color:#555">' + T('Im Anhang findest du meine AGB mit Widerrufsbelehrung und Muster-Widerrufsformular. Fragen oder Stornierung: einfach auf diese Mail antworten.',
        'Attached are my terms with the cancellation policy and model withdrawal form. Questions or cancellation: just reply to this e-mail.') + '</p>' +
      '<p>' + T('Herzliche Grüße aus Halstenbek', 'Warm regards from Halstenbek') + '<br>Benedict Gertz · BG Naturfotografie<br>' +
      '<a href="https://bg-naturfotografie.de">bg-naturfotografie.de</a></p></div>';

    const mail = {
      sender: { name: 'BG Naturfotografie', email: env.ABSENDER },
      to: [{ email, name }],
      replyTo: { email: env.ANTWORT_AN || env.ABSENDER, name: 'Benedict Gertz' },
      subject: betreff,
      textContent: text,
      htmlContent: html,
      tags: ['bestellung'],
    };
    if (env.KOPIE_AN) mail.bcc = [{ email: env.KOPIE_AN }];
    if (env.AGB_PDF) mail.attachment = [{ url: env.AGB_PDF, name: 'AGB-und-Widerruf-BG-Naturfotografie.pdf' }];

    /* ---------- 4. Verschicken über Brevo ---------- */
    const brevo = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY || '', 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(mail),
    }).catch(() => null);

    if (!brevo || !brevo.ok) {
      const fehler = brevo ? (await brevo.text()).slice(0, 200) : 'keine Verbindung';
      return antwort(502, { ok: false, grund: 'Brevo: ' + fehler });
    }
    const info = await brevo.json().catch(() => ({}));
    return antwort(200, { ok: true, id: info.messageId || '' });
  },
};

/* ============================================================
   WIDERRUF: Eingangsbestätigung
   Der Text sagt bewusst nur „eingegangen“, nicht „wirksam“.
   ============================================================ */
async function widerrufBestaetigen(d, env, antwort) {
  const sauber = (s, max) => String(s == null ? '' : s)
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, max);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const email = String(d.email || '').trim().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return antwort(400, { ok: false, grund: 'E-Mail' });
  const name = sauber(d.name, 80);
  const bestellung = sauber(d.bestellung, 80);
  const teil = sauber(d.teil, 300);
  if (!name || !bestellung) return antwort(400, { ok: false, grund: 'Angaben fehlen' });
  const en = d.sprache === 'en';
  const T = (de, eng) => (en ? eng : de);

  const zeit = new Date().toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' Uhr';

  const zeilen = [
    [T('Eingang', 'Received'), zeit],
    ['Name', name],
    [T('Bestellung', 'Order'), bestellung],
    [T('Umfang', 'Scope'), teil ? T('nur: ', 'only: ') + teil : T('ganze Bestellung', 'whole order')],
    [T('Erklärung', 'Statement'), T('Hiermit widerrufe ich den oben genannten Vertrag.', 'I hereby withdraw from the contract named above.')],
  ];
  const weiter = T(
    'Zurückschicken musst du nichts, die Ware darfst du behalten. Ist der Widerruf wirksam, bekommst du dein Geld innerhalb von 14 Tagen auf demselben Weg zurück, auf dem du bezahlt hast. Ich melde mich dazu noch persönlich.',
    'You do not need to send anything back, you may keep the goods. If the withdrawal is valid, you will get your money back within 14 days via the same payment method. I will also get in touch personally.');

  const text = T('Hallo ', 'Hello ') + name + ',\n\n' +
    T('hiermit bestätige ich den Eingang deines Widerrufs:', 'this confirms receipt of your withdrawal:') + '\n\n' +
    zeilen.map(z => z[0] + ': ' + z[1]).join('\n') + '\n\n' + weiter + '\n\n' +
    T('Herzliche Grüße', 'Kind regards') + '\nBenedict Gertz · BG Naturfotografie\nhttps://bg-naturfotografie.de';
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:560px">' +
    '<p>' + T('Hallo ', 'Hello ') + esc(name) + ',</p>' +
    '<p>' + T('hiermit bestätige ich den Eingang deines Widerrufs:', 'this confirms receipt of your withdrawal:') + '</p>' +
    '<table cellpadding="4" style="border-collapse:collapse">' +
    zeilen.map(z => '<tr><td style="color:#555;vertical-align:top">' + esc(z[0]) + '</td><td><strong>' + esc(z[1]) + '</strong></td></tr>').join('') +
    '</table><p>' + esc(weiter) + '</p>' +
    '<p>' + T('Herzliche Grüße', 'Kind regards') + '<br>Benedict Gertz · BG Naturfotografie<br><a href="https://bg-naturfotografie.de">bg-naturfotografie.de</a></p></div>';

  const mail = {
    sender: { name: 'BG Naturfotografie', email: env.ABSENDER },
    to: [{ email, name }],
    replyTo: { email: env.ANTWORT_AN || env.ABSENDER, name: 'Benedict Gertz' },
    subject: T('Eingangsbestätigung deines Widerrufs (' + bestellung + ')', 'Confirmation of receipt of your withdrawal (' + bestellung + ')'),
    textContent: text,
    htmlContent: html,
    tags: ['widerruf'],
  };
  if (env.KOPIE_AN) mail.bcc = [{ email: env.KOPIE_AN }];

  const brevo = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY || '', 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(mail),
  }).catch(() => null);
  if (!brevo || !brevo.ok) {
    const fehler = brevo ? (await brevo.text()).slice(0, 200) : 'keine Verbindung';
    return antwort(502, { ok: false, grund: 'Brevo: ' + fehler });
  }
  return antwort(200, { ok: true, zeit });
}
