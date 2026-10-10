#!/usr/bin/env python3
# ============================================================
# VORSCHAUBILDER (kleine Fassungen der Fotos) erzeugen
# ============================================================
# Läuft automatisch auf GitHub, sobald neue Bilder im Ordner
# bilder/ landen (siehe .github/workflows/vorschaubilder.yml) —
# also auch nach jedem Bild-Upload im Admin-Bereich.
# Du musst diese Datei nie selbst starten.
#
# WARUM?
# Im Shop, in den Galerien und auf der Startseite stehen viele
# Fotos nebeneinander, jeweils nur ein paar Zentimeter groß. Dafür
# reicht eine kleine Fassung (max. 800 px, ca. 60–90 KB) statt des
# großen Fotos (1600 px, 200–500 KB). Die Seite lädt dadurch am
# Handy ein Vielfaches schneller. Die großen Fotos werden weiter
# benutzt, sobald jemand ein Bild groß ansieht (Lupe, Geschichte).
#
# WAS ES TUT
#   bilder/teichleben/entchen1.jpg  →  bilder/klein/teichleben/entchen1.jpg
# Gleicher Pfad, gleiches Dateiformat, nur kleiner. Ob ein Bild sich
# geändert hat, merkt sich das Skript über einen Fingerabdruck in
# bilder/klein/.quellen.json — ein ersetztes Foto bekommt also auch
# eine neue kleine Fassung. Gelöschte Fotos verlieren ihre kleine
# Fassung ebenfalls.
#
# Fehlt eine kleine Fassung einmal (z. B. in den 1–2 Minuten direkt
# nach einem Upload), zeigt die Webseite automatisch das große Foto.
# ============================================================
import hashlib, io, json, os, sys
from PIL import Image, ImageOps

WURZEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
QUELLE = os.path.join(WURZEL, 'bilder')
ZIEL = os.path.join(QUELLE, 'klein')
MERKER = os.path.join(ZIEL, '.quellen.json')
ENDUNGEN = ('.jpg', '.jpeg', '.png', '.webp')
MAX_BREITE, MAX_HOEHE = 800, 1000   # passt für Quer-, Hoch- und Lesezeichenformat


def fingerabdruck(pfad):
    return hashlib.sha1(open(pfad, 'rb').read()).hexdigest()


def verkleinern(quelle, ziel):
    bild = Image.open(quelle)
    bild = ImageOps.exif_transpose(bild)          # Drehung aus der Kamera übernehmen
    icc = bild.info.get('icc_profile')
    bild.thumbnail((MAX_BREITE, MAX_HOEHE), Image.LANCZOS)
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    endung = os.path.splitext(ziel)[1].lower()
    if endung in ('.jpg', '.jpeg'):
        if bild.mode != 'RGB':
            bild = bild.convert('RGB')
        bild.save(ziel, 'JPEG', quality=76, optimize=True, progressive=True,
                  **({'icc_profile': icc} if icc and len(icc) < 20000 else {}))
    elif endung == '.webp':
        bild.save(ziel, 'WEBP', quality=76, method=6)
    else:  # PNG (z. B. Logo) bleibt verlustfrei
        bild.save(ziel, 'PNG', optimize=True)


def main():
    try:
        merker = json.load(open(MERKER, encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        merker = {}

    gefunden, neu = set(), 0
    for ordner, _, dateien in os.walk(QUELLE):
        if os.path.abspath(ordner).startswith(os.path.abspath(ZIEL)):
            continue   # die kleinen Fassungen selbst nicht noch einmal verkleinern
        for datei in dateien:
            if not datei.lower().endswith(ENDUNGEN):
                continue
            quelle = os.path.join(ordner, datei)
            relativ = os.path.relpath(quelle, QUELLE).replace(os.sep, '/')
            gefunden.add(relativ)
            ziel = os.path.join(ZIEL, relativ)
            abdruck = fingerabdruck(quelle)
            if merker.get(relativ) == abdruck and os.path.exists(ziel):
                continue
            try:
                verkleinern(quelle, ziel)
            except Exception as fehler:   # ein kaputtes Bild soll den Rest nicht aufhalten
                print('Übersprungen:', relativ, '-', fehler)
                continue
            merker[relativ] = abdruck
            neu += 1

    # Kleine Fassungen von gelöschten Fotos aufräumen
    for relativ in list(merker):
        if relativ not in gefunden:
            try:
                os.remove(os.path.join(ZIEL, relativ))
            except FileNotFoundError:
                pass
            del merker[relativ]

    os.makedirs(ZIEL, exist_ok=True)
    with open(MERKER, 'w', encoding='utf-8') as f:
        json.dump(merker, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write('\n')
    print('%d Vorschaubild(er) erzeugt, %d insgesamt.' % (neu, len(merker)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
