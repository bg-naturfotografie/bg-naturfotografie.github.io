#!/usr/bin/env python3
# ============================================================
# AUTOMATISCHE ÜBERSETZUNG Deutsch → Englisch (DeepL)
# ============================================================
# Läuft automatisch auf GitHub, sobald im Admin-Bereich etwas
# gespeichert wurde (siehe .github/workflows/uebersetzen.yml).
# Du musst diese Datei nie selbst starten.
#
# WAS SIE TUT
# ------------------------------------------------------------
# Sie geht alle Dateien in daten/ durch und sucht jedes Feld mit
# einer deutschen und einer englischen Fassung ({"de": …, "en": …}).
#
#   • English leer             → wird übersetzt.
#   • English stammt von DeepL,
#     und das Deutsch wurde
#     danach geändert          → wird neu übersetzt.
#   • English hast du selbst
#     geschrieben oder
#     korrigiert               → bleibt UNANGETASTET.
#
# Woher weiß das Skript, was von DeepL stammt? Es merkt sich jede
# eigene Übersetzung in daten/.uebersetzungen.json (deutscher Text
# → englische Maschinen-Übersetzung). Steht im Feld genau dieser
# Maschinentext, darf er ersetzt werden; steht dort etwas anderes,
# hast du es angepasst.
#
# Formatierung bleibt erhalten: **fett**, *kursiv* und
# [Links](adresse) werden vor der Übersetzung geschützt.
#
# AUFRUF (nur zum Testen):
#   DEEPL_API_KEY=… python3 werkzeuge/uebersetzen.py
#   python3 werkzeuge/uebersetzen.py --probe     (ohne DeepL, schreibt "[EN] …")
# ============================================================
import json, os, re, sys, glob, urllib.request, urllib.parse, html

ORDNER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'daten')
SPEICHER = os.path.join(ORDNER, '.uebersetzungen.json')
PROBE = '--probe' in sys.argv


# ---------- Formatierung schützen ----------
# DeepL versteht HTML-Tags und lässt sie stehen. Deshalb wird aus
# **fett** → <b>fett</b> usw., und nach der Übersetzung zurück.
def md_zu_html(text):
    t = html.escape(text, quote=False)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: '<a href="%s">%s</a>' % (html.escape(m.group(2)), m.group(1)), t)
    # Zeilenumbrüche als Tag, damit Absätze sicher erhalten bleiben
    return t.replace('\n', '<br/>')


def html_zu_md(t):
    t = re.sub(r'\s*<br\s*/?>\s*', '\n', t)
    t = re.sub(r'<b>(.*?)</b>', r'**\1**', t, flags=re.S)
    t = re.sub(r'<i>(.*?)</i>', r'*\1*', t, flags=re.S)
    t = re.sub(r'<a href="([^"]*)">(.*?)</a>', lambda m: '[%s](%s)' % (m.group(2), html.unescape(m.group(1))), t, flags=re.S)
    return html.unescape(t)


# ---------- DeepL ----------
def deepl(texte):
    """Übersetzt eine Liste deutscher Texte, max. 50 pro Anfrage."""
    if PROBE:
        return ['[EN] ' + t for t in texte]
    schluessel = os.environ.get('DEEPL_API_KEY', '').strip()
    # Kostenlose DeepL-Schlüssel enden auf ":fx" und haben eine eigene Adresse
    adresse = 'https://api-free.deepl.com/v2/translate' if schluessel.endswith(':fx') else 'https://api.deepl.com/v2/translate'
    ergebnis = []
    for i in range(0, len(texte), 50):
        teil = texte[i:i + 50]
        daten = [('source_lang', 'DE'), ('target_lang', 'EN-GB'), ('tag_handling', 'html'),
                 ('preserve_formatting', '1')] + [('text', md_zu_html(t)) for t in teil]
        anfrage = urllib.request.Request(adresse, data=urllib.parse.urlencode(daten).encode(),
                                         headers={'Authorization': 'DeepL-Auth-Key ' + schluessel})
        with urllib.request.urlopen(anfrage, timeout=60) as antwort:
            antworten = json.load(antwort)['translations']
        ergebnis += [html_zu_md(a['text']) for a in antworten]
    return ergebnis


# ---------- Felder finden ----------
def paare(knoten):
    """Liefert alle {de, en}-Objekte (beliebig tief verschachtelt)."""
    if isinstance(knoten, dict):
        if set(knoten.keys()) >= {'de'} and set(knoten.keys()) <= {'de', 'en'} and isinstance(knoten.get('de'), str):
            yield knoten
            return
        for wert in knoten.values():
            yield from paare(wert)
    elif isinstance(knoten, list):
        for wert in knoten:
            yield from paare(wert)


def main():
    if not PROBE and not os.environ.get('DEEPL_API_KEY', '').strip():
        print('Kein DEEPL_API_KEY hinterlegt — nichts zu tun. (Siehe ANLEITUNG-ADMIN.md, Abschnitt Übersetzung.)')
        return 0
    try:
        gedaechtnis = json.load(open(SPEICHER, encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        gedaechtnis = {}
    # Umkehrung: Maschinentext → deutscher Ausgangstext
    maschine = {en: de for de, en in gedaechtnis.items()}

    dateien = {p: json.load(open(p, encoding='utf-8')) for p in sorted(glob.glob(os.path.join(ORDNER, '*.json')))
               if not os.path.basename(p).startswith('.')}

    offen = []   # (feld, deutscher Text)
    for daten in dateien.values():
        for feld in paare(daten):
            de = (feld.get('de') or '').strip()
            en = (feld.get('en') or '').strip()
            if not de:
                continue
            if not en:
                offen.append(feld)
            elif en in maschine and maschine[en] != de:
                # English stammt von DeepL, das Deutsch wurde inzwischen geändert
                offen.append(feld)

    if not offen:
        print('Alles übersetzt.')
        return 0

    # Gleiche Texte nur einmal übersetzen (spart DeepL-Zeichen)
    neu = sorted({f['de'].strip() for f in offen if f['de'].strip() not in gedaechtnis})
    if neu:
        for de, en in zip(neu, deepl(neu)):
            gedaechtnis[de] = en
    for feld in offen:
        feld['en'] = gedaechtnis[feld['de'].strip()]

    for pfad, daten in dateien.items():
        with open(pfad, 'w', encoding='utf-8') as f:
            json.dump(daten, f, ensure_ascii=False, indent=2)
            f.write('\n')
    with open(SPEICHER, 'w', encoding='utf-8') as f:
        json.dump(gedaechtnis, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write('\n')
    print('%d Feld(er) übersetzt, %d neue DeepL-Anfrage(n).' % (len(offen), len(neu)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
