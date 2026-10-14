# Suoni di Tokyo – skill Alexa per riprodurre mp3 hostati

Skill personale che riproduce file mp3 ospitati online (es. il jingle della metro Yamanote o il campanello del konbini).

- `Alexa, apri suoni di tokyo` → riproduce il suono predefinito (`famima`)
- `Alexa, chiedi a suoni di tokyo di riprodurre yamanote` → riproduce il suono scelto

## 1. Prepara l'mp3

Alexa accetta nei tag `<audio>` solo mp3 con parametri precisi: **HTTPS**, **MPEG versione 2**, **48 kbps**, **16000 Hz** e **al massimo 240 secondi** in totale per risposta. Converti il file con ffmpeg:

```bash
ffmpeg -i input.mp3 -ac 2 -codec:a libmp3lame -b:a 48k -ar 16000 -write_xing 0 famima.mp3
```

## 2. Ospita i file

L'URL deve essere HTTPS, pubblico e con certificato valido. La soluzione più semplice e gratuita è **GitHub Pages**:

1. metti gli mp3 nella cartella `docs/audio/` del repository (`docs/audio/famima.mp3`, `docs/audio/yamanote.mp3`);
2. su GitHub: *Settings → Pages → Deploy from a branch → `main` / `/docs`*;
3. gli URL saranno `https://TUO-UTENTE.github.io/NOME-REPO/audio/famima.mp3`.

Attenzione: con GitHub Pages i file sono pubblici. Se i suoni sono registrazioni protette da copyright, tieni il repository per uso personale o usa un altro hosting (es. un bucket S3/R2 con accesso in lettura).

## 3. Configura i suoni

Modifica `lambda/sounds.json` con i tuoi URL. Per aggiungere un suono:

1. aggiungi una voce in `lambda/sounds.json`;
2. aggiungi lo stesso `id` (con eventuali sinonimi) nel tipo `SOUND_TYPE` di `skill-package/interactionModels/custom/it-IT.json`.

Il suono predefinito (quello dell'apertura senza comandi) si cambia con la costante `DEFAULT_SOUND` in `lambda/index.js`.

## 4. Crea la skill

1. Vai su <https://developer.amazon.com/alexa/console/ask> con lo stesso account Amazon dell'Echo.
2. *Create Skill* → nome a piacere, lingua **Italiano**, tipo **Custom**, hosting **Alexa-hosted (Node.js)**.
3. Scegli *Import skill* e incolla l'URL Git di questo repository (deve essere accessibile dalla console).
4. Premi *Build* e poi *Deploy*.
5. Nella scheda *Test* imposta *Skill testing is enabled in: Development*.

La skill in sviluppo funziona subito sui tuoi dispositivi Echo collegati allo stesso account, senza pubblicazione.

In alternativa, con l'ASK CLI: `ask deploy` dalla cartella del progetto.

## 5. Comando unico con una Routine

Per dire solo "Alexa, famima": app Alexa → *Altro → Routine → +* → comando vocale `famima` → azione *Skill* o *Personalizzato* con il testo `apri suoni di tokyo`.

## Struttura

```
lambda/
  index.js        logica della skill
  sounds.json     elenco suoni e URL
  package.json
skill-package/
  skill.json                          manifest
  interactionModels/custom/it-IT.json modello vocale
```

## Risoluzione problemi

- **Alexa non emette nulla o dice di non riuscire a riprodurre**: controlla il formato dell'mp3 (48 kbps, 16000 Hz), che l'URL sia HTTPS e raggiungibile dal browser, e i log in *CloudWatch* dalla scheda *Code*.
- **Non riconosce il nome del suono**: aggiungi sinonimi in `SOUND_TYPE`, poi *Build* di nuovo.
