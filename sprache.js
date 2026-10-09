/* ============================================================
   SPRACHE — Deutsch / Englisch umschalten
   ============================================================

   Diese Datei steht im <head> jeder Seite (ohne defer, damit die
   Sprache feststeht, bevor irgendetwas angezeigt wird).

   WIE DIE SPRACHE BESTIMMT WIRD (in dieser Reihenfolge):
   1. ?lang=en oder ?lang=de in der Adresse  → gilt und wird gemerkt
      (praktisch für Links, z. B. in der Instagram-Bio:
       https://bg-naturfotografie.de/?lang=en)
   2. die zuletzt gewählte Sprache dieses Browsers
   3. sonst Deutsch

   Bewusst KEINE automatische Umstellung nach Browsersprache: Der
   Google-Suchroboter meldet sich mit englischem Browser — er würde
   sonst die englische Fassung in die (deutsche) Suche aufnehmen.

   WO DIE ÜBERSETZUNGEN STEHEN
   ------------------------------------------------------------
   a) Feste Texte direkt im HTML: Der deutsche Text steht wie
      gewohnt im Element, die englische Fassung im Attribut
      data-en daneben:

        <a href="#galerie" data-en="Gallery">Galerie</a>

      Für Attribute gibt es data-en-placeholder, data-en-alt,
      data-en-title, data-en-aria-label und data-en-content
      (letzteres für <meta>-Beschreibungen).

   b) Texte, die du im Admin-Bereich bearbeitest, stehen in
      daten/texte.json (beide Sprachen) — die setzt daten.js ein.

   c) Texte, die ein Skript erzeugt (Shop, Karte, …), stehen im
      Skript als BG.t('Deutsch', 'English').
   ============================================================ */
(function (global) {
  'use strict';
  var BG = global.BG = global.BG || {};
  var SPRACHEN = ['de', 'en'];
  var SPEICHER_SCHLUESSEL = 'bg-sprache';

  /* localStorage kann in privaten Fenstern fehlen oder Fehler
     werfen — deshalb jeder Zugriff in try/catch. */
  function gemerkt() {
    try { return global.localStorage.getItem(SPEICHER_SCHLUESSEL); } catch (e) { return null; }
  }
  function merken(lang) {
    try { global.localStorage.setItem(SPEICHER_SCHLUESSEL, lang); } catch (e) { /* egal */ }
  }

  var ausAdresse = new URLSearchParams(global.location.search).get('lang');
  var lang = 'de';
  if (SPRACHEN.indexOf(ausAdresse) !== -1) {
    lang = ausAdresse;
    merken(lang);
  } else if (SPRACHEN.indexOf(gemerkt()) !== -1) {
    lang = gemerkt();
  }
  BG.sprache = lang;

  /* Warteschlange für Skripte, die direkt im HTML stehen und schon
     laufen, bevor daten.js (mit defer) geladen ist. daten.js
     übernimmt die Liste und startet alles, sobald die Daten da sind. */
  if (!BG.bereit) {
    BG._warteschlange = BG._warteschlange || [];
    BG.bereit = function (fn) { BG._warteschlange.push(fn); };
  }

  var html = document.documentElement;
  html.lang = lang;
  html.classList.add('sprache-' + lang);
  /* "texte-laden": Elemente mit Texten aus texte.json bleiben kurz
     unsichtbar, bis der aktuelle Text da ist (sonst flackert der
     alte Stand auf). daten.js nimmt die Klasse wieder weg — und
     falls etwas schiefgeht, spätestens nach 2,5 Sekunden diese
     Sicherung hier. */
  html.classList.add('texte-laden');
  setTimeout(function () { html.classList.remove('texte-laden'); }, 2500);
  if (lang === 'en') {
    html.classList.add('vor-uebersetzung');
    setTimeout(function () { html.classList.remove('vor-uebersetzung'); }, 1500);
  }

  /* Adresse dieser Seite in der anderen Sprache (Parameter wie
     ?id=… bleiben erhalten, die Sprungmarke #… auch). */
  function adresseIn(zielLang) {
    var url = new URL(global.location.href);
    url.searchParams.set('lang', zielLang);
    return url.pathname + url.search + url.hash;
  }

  /* ---- Englisch einsetzen (nur wenn Englisch gewählt) ---- */
  function uebersetzen() {
    if (lang !== 'en') return;
    // Ganze Inhalte
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-en');
    });
    // Einzelne Attribute
    ['placeholder', 'alt', 'title', 'aria-label', 'content', 'value'].forEach(function (attr) {
      document.querySelectorAll('[data-en-' + attr + ']').forEach(function (el) {
        el.setAttribute(attr, el.getAttribute('data-en-' + attr));
      });
    });
    var titel = document.querySelector('title[data-en]');
    if (titel) document.title = titel.getAttribute('data-en');

    /* Interne Links bekommen ?lang=en angehängt. So bleibt die
       Sprache auch erhalten, wenn der Browser sich nichts merken
       darf, und wer eine Adresse kopiert, teilt die englische Fassung. */
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || /^(#|mailto:|tel:|https?:|\/\/|javascript:)/i.test(href)) return;
      if (/[?&]lang=/.test(href)) return;
      var teile = href.split('#');
      teile[0] += (teile[0].indexOf('?') === -1 ? '?' : '&') + 'lang=en';
      a.setAttribute('href', teile.join('#'));
    });
  }

  /* ---- Umschalter DE | EN oben im Menü ----
     Wird automatisch in jede Navigation (.nav .wrap) eingesetzt —
     du musst ihn in keiner HTML-Datei selbst einbauen. Er sitzt
     außerhalb des Klappmenüs, ist also auch am Handy immer zu sehen. */
  function umschalterEinbauen() {
    var nav = document.querySelector('.nav .wrap');
    if (!nav || nav.querySelector('.sprach-schalter')) return;
    var box = document.createElement('div');
    box.className = 'sprach-schalter';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', lang === 'en' ? 'Language' : 'Sprache');
    SPRACHEN.forEach(function (l) {
      var a = document.createElement('a');
      a.href = adresseIn(l);
      a.textContent = l.toUpperCase();
      a.lang = l;
      a.setAttribute('hreflang', l);
      a.setAttribute('aria-label', l === 'de' ? 'Deutsch' : 'English');
      if (l === lang) a.setAttribute('aria-current', 'true');
      a.addEventListener('click', function () { merken(l); });
      box.appendChild(a);
    });
    // Vor den Burger-Knopf setzen, damit er am Handy neben dem Menü steht
    var burger = nav.querySelector('.nav-toggle');
    nav.insertBefore(box, burger || null);
  }

  function los() {
    uebersetzen();
    umschalterEinbauen();
    html.classList.remove('vor-uebersetzung');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los);
  else los();
})(window);
