#!/usr/bin/env bash
# Loop Studio Webseite -> onlinemedianer.de   (All-Inkl KAS, FTPS ueber lftp)
#
# Zugang: eine env-Datei mit FTP_HOST / FTP_USER / FTP_PASS, Standard ~/.config/loopstudio-deploy.env
# (chmod 600, von Christian befuellt, wird nie ausgegeben). Andere Datei: DEPLOY_CRED=/pfad/datei.env
#
#   werkzeuge/deploy.sh --zeigen                 # nur nachsehen: welche Ordner sieht dieser FTP-User?
#   werkzeuge/deploy.sh                          # sichern, hochladen, danach im Browser-Sinn pruefen
#   DEPLOY_ZIEL=/onlinemedianer.de werkzeuge/deploy.sh    # anderer Zielordner (Standard: / = Wurzel des FTP-Users)
#   DEPLOY_ERZWINGEN=1 werkzeuge/deploy.sh       # Sicherheitsfrage uebergehen (Ziel sieht nicht nach Landingpage aus)
#
# Falle vom 04.09.2026: der Outreel-Zugang (~/.config/outreel-deploy.env, User f…) ist ein KAS-Zusatz-User.
# Seine Wurzel ist nur der Outreel-Bereich; /www darin ist NICHT das Docroot von onlinemedianer.de.
# Die Domain braucht einen eigenen FTP-Zugang, dessen Pfad auf ihren Ordner zeigt (KAS -> FTP -> Neuer Zugang).
set -euo pipefail

HIER="$(cd "$(dirname "$0")/.." && pwd)"
CRED="${DEPLOY_CRED:-${HOME}/.config/loopstudio-deploy.env}"
ZIEL="${DEPLOY_ZIEL:-/}"
URL="https://onlinemedianer.de"
STAMP="$(date +%Y%m%d-%H%M)"
SICHERUNG="${HOME}/Projekte/03_Loop Studio/Landingpage/_sicherung-onlinemedianer-${STAMP}"
LF="set ftp:ssl-allow true; set ssl:verify-certificate no; set net:timeout 30; set net:max-retries 2;"

if [ ! -f "$CRED" ]; then
  cat <<ENDE
Fehlt: $CRED

So anlegen (KAS: kas.all-inkl.com -> FTP -> Neuer FTP-Zugang, Pfad = Ordner von onlinemedianer.de;
den Ordner zeigt KAS unter Domain -> onlinemedianer.de -> Pfad):

cat > "$CRED" <<'EOF'
FTP_HOST=w01a5044.kasserver.com
FTP_USER=f0000000
FTP_PASS=…
EOF
chmod 600 "$CRED"

Danach:  werkzeuge/deploy.sh --zeigen   (nachsehen)   bzw.   werkzeuge/deploy.sh   (hochladen)
ENDE
  exit 1
fi
# shellcheck source=/dev/null
source "$CRED"
# Rueckwaerts kompatibel: eine Datei mit OUTREEL_FTP_* geht auch, wenn sie ausdruecklich per DEPLOY_CRED kommt.
FTP_HOST="${FTP_HOST:-${OUTREEL_FTP_HOST:-}}"; FTP_USER="${FTP_USER:-${OUTREEL_FTP_USER:-}}"; FTP_PASS="${FTP_PASS:-${OUTREEL_FTP_PASS:-}}"
: "${FTP_HOST:?fehlt in $CRED}"; : "${FTP_USER:?fehlt in $CRED}"; : "${FTP_PASS:?fehlt in $CRED}"

ftp() { lftp -u "${FTP_USER},${FTP_PASS}" "${FTP_HOST}" -e "${LF} $1; bye"; }

# ---------- nur nachsehen ----------
if [ "${1:-}" = "--zeigen" ]; then
  echo "FTP-User ${FTP_USER} auf ${FTP_HOST} sieht in seiner Wurzel:"
  ftp "cls -l /" 2>&1 | grep -v -i "pass" || true
  echo
  echo "Eine Ebene tiefer (nur die ersten 12 Eintraege je Ordner):"
  for d in $(ftp "cls -1F /" 2>/dev/null | grep '/$' | grep -v -i "pass" | sed 's#/$##'); do
    echo "  ${d}/"
    ftp "cls -1 ${d}/" 2>/dev/null | head -12 | sed 's/^/      /'
  done
  echo
  echo "Der richtige Ordner enthaelt die alte Landingpage: index.html, css/, js/, assets/"
  echo "Liegt sie direkt in der Wurzel, reicht  werkzeuge/deploy.sh  — sonst  DEPLOY_ZIEL=/<ordner> werkzeuge/deploy.sh"
  exit 0
fi

# ---------- 1/3 sichern ----------
echo "1/3  Sicherung von ${ZIEL} (User ${FTP_USER}) nach ${SICHERUNG}"
mkdir -p "${SICHERUNG}"
ftp "mirror --verbose=0 --parallel=4 --exclude-glob _sicherung* '${ZIEL}' '${SICHERUNG}'"
ANZAHL="$(find "${SICHERUNG}" -type f | wc -l | tr -d ' ')"
echo "     gesichert: ${ANZAHL} Dateien"

# Sicherheitsfrage: sieht das Ziel nach der Landingpage (alt oder neu) oder nach einem leeren Ordner aus?
if [ "${DEPLOY_ERZWINGEN:-0}" != "1" ]; then
  if [ "${ANZAHL}" != "0" ] && [ ! -f "${SICHERUNG}/css/style.css" ] && [ ! -f "${SICHERUNG}/web/stil.css" ]; then
    echo
    echo "STOPP: ${ZIEL} sieht nicht nach der Loop-Studio-Landingpage aus (weder css/style.css noch web/stil.css)."
    echo "       Inhalt (erste 15):"; find "${SICHERUNG}" -mindepth 1 -maxdepth 2 | sed "s#${SICHERUNG}#  #" | head -15
    echo "       Erst  werkzeuge/deploy.sh --zeigen  und den richtigen Ordner per DEPLOY_ZIEL waehlen."
    echo "       Wirklich hierhin? DEPLOY_ERZWINGEN=1 werkzeuge/deploy.sh"
    exit 2
  fi
fi

# ---------- 2/3 hochladen ----------
echo "2/3  Upload nach ${ZIEL}"
ftp "mirror -R --delete --verbose=1 --parallel=4 \
  --exclude-glob .git/ --exclude-glob .git* --exclude-glob werkzeuge/ --exclude-glob README.md --exclude-glob BILDHERKUNFT.md --exclude-glob .DS_Store --exclude-glob .claude/ \
  '${HIER}' '${ZIEL}'"

# ---------- 3/3 pruefen, was die Domain wirklich ausliefert ----------
echo "3/3  Gegenprobe: liefert ${URL} die neuen Dateien?"
CODE="$(curl -s -o /dev/null -m 20 -w '%{http_code}' "${URL}/web/stil.css?x=${STAMP}" || echo 000)"
TITEL="$(curl -sL -m 20 -H 'Accept: text/html' "${URL}/?x=${STAMP}" | grep -oE '<title>[^<]*' | head -1 | sed 's/<title>//')"
echo "     web/stil.css -> HTTP ${CODE}"
echo "     Titel live   -> ${TITEL:-?}"
if [ "${CODE}" = "200" ]; then
  echo "fertig: ${URL}/ ist die neue Seite."
else
  echo
  echo "NICHT LIVE: der Upload ist auf dem Server, aber ${URL} liefert ihn nicht aus."
  echo "  -> ${ZIEL} ist nicht das Docroot der Domain (falscher FTP-User oder falscher Ordner)."
  echo "  -> werkzeuge/deploy.sh --zeigen  und in KAS unter Domain -> onlinemedianer.de -> Pfad nachsehen."
  exit 3
fi
