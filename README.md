# Portfolio — macOS Desktop

Portfolio personale in stile **macOS Sonoma**, con desktop interattivo, finestre trascinabili, dock animato e sfondo astronomico NASA APOD (Astronomy Picture of the Day).

**Demo online:** [xaviershayne35-tech.github.io/MacOS-Portfolio](https://xaviershayne35-tech.github.io/MacOS-Portfolio/)

![Status](https://img.shields.io/badge/status-active-success)
![Vite](https://img.shields.io/badge/vite-6.4-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Funzionalità

-  **Desktop interattivo** in stile macOS con icone di progetto posizionate dinamicamente
-  **Finestre trascinabili** (drag) con pulsanti di controllo (chiudi, minimizza, ingrandisci) e z-index automatico per il focus
-  **App Note** in stile macOS Notes con sidebar e articoli (la mia storia, esperienze e titoli)
-  **Dock animato** con link ai profili social (Instagram, X, Discord) e pulsante Note
-  **Sfondo NASA APOD** che cambia ogni giorno (fallback grafico se l'API non è raggiungibile)
-  **Orologio in tempo reale** nella menu bar
-  **Accessibilità**: `aria-label`, `role`, `tab navigation`, contrasto elevato
-  **Touch-friendly**: supporto per `touchstart`/`touchmove`/`touchend`
-  **Zero framework runtime**: vanilla JS + CSS, build con Vite


## Quick start

### Prerequisiti

- **Node.js** ≥ 18 (consigliato 22 LTS)
- **npm** ≥ 9

### Installazione

```bash
# Clona il repository
git clone https://github.com/XavierShayne35-tech/MacOs-Portfolio.git
cd MacOs-Portfolio

# Installa le dipendenze
npm install

# Crea il file .env per la chiave NASA
cp .env.example .env
# → modifica .env e inserisci la tua chiave (vedi sezione NASA API)
```

### Comandi

```bash
npm run dev       # Avvia il dev server (http://localhost:5173)
npm run build     # Build di produzione in ./dist
npm run preview   # Anteprima del build di produzione
```

---

## NASA Astronomy Picture of the Day

Il progetto usa l'API pubblica di NASA per impostare come sfondo l'immagine astronomica del giorno.

### Ottenere una chiave API

1. Vai su [api.nasa.gov](https://api.nasa.gov/#signUp)
2. Compila il form (nome, email) — è gratis
3. Ricevi la chiave via email
4. Inseriscila nel file `.env`:
   ```
   VITE_NASA_API_KEY=la_tua_chiave_qui
   ```

> In alternativa puoi usare la chiave demo `DEMO_KEY` (rate-limit: 30 richieste/ora, 50/IP/giorno). Inseriscila in `.env` come `VITE_NASA_API_KEY=DEMO_KEY`.

### Fallback

Se la chiave manca, è invalida o l'API è irraggiungibile, viene mostrato un gradiente radiale blu scuro (vedi `applyFallbackWallpaper` in `src/main.js`).

---

## Struttura del progetto

```
MacOs-Portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions: build + deploy su Pages
├── public/                   # Asset statici serviti così come sono
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── projects/
│   │       └── p1/
│   │           └── 1.png     # Screenshot progetto Au Jardin
│   ├── main.js               # Entry point JS (~330 righe)
│   └── style.css             # Stili (~260 righe)
├── index.html                # Entry point HTML
├── vite.config.js            # Configurazione Vite (base path per GH Pages)
├── package.json
├── .gitignore
└── README.md
```

---

## 🛠️ Stack tecnico

| Layer | Tecnologia | Note |
|-------|-----------|------|
| **Build tool** | [Vite 6](https://vitejs.dev/) | HMR, ESM nativo, build ultra-veloce |
| **Linguaggio** | Vanilla JavaScript (ES2022+) | Zero framework, zero dipendenze runtime |
| **CSS** | CSS3 puro | Variabili, flex, grid, backdrop-filter |
| **Hosting** | GitHub Pages | Deploy automatico via GitHub Actions |
| **API esterna** | [NASA APOD](https://github.com/nasa/apod-api) | Sfondo astronomico del giorno |

Nessun framework (React, Vue, Svelte): tutto vanilla per minimizzare il bundle e dimostrare padronanza delle Web Platform API.

---

## Bundle

Output di `npm run build` (Vite 6.4.3):

```
dist/index.html                 8.10 kB │ gzip:  2.72 kB
dist/assets/index-*.css         8.64 kB │ gzip:  2.78 kB
dist/assets/index-*.js          6.55 kB │ gzip:  2.72 kB
```

**Totale gzippato: ~8 KB** 🚀

---

## Aggiungere un nuovo progetto

Per aggiungere una nuova icona sul desktop, modifica l'array `PROJECTS` in `src/main.js` (inizio del file):

```js
const PROJECTS = [
  {
    id: "mio-progetto",                           // ID univoco
    title: "Mio Progetto",                        // Titolo mostrato
    desc: "Descrizione del progetto.",            // Descrizione nella finestra
    images: [
      "src/assets/projects/mio-progetto/1.png",   // Path immagine 1
      "src/assets/projects/mio-progetto/2.png",   // Path immagine 2
      "src/assets/projects/mio-progetto/3.png",   // Path immagine 3
    ],
  },
  // ...altri progetti
];
```

Poi crea la cartella corrispondente:
```bash
mkdir -p src/assets/projects/mio-progetto
# Inserisci le immagini 1.png, 2.png, 3.png
```

---

## Deploy

Il deploy è **automatico** ad ogni `git push` su `main`, grazie al workflow GitHub Actions in `.github/workflows/deploy.yml`.

### Flusso di deploy

1. **Push** su `main`
2. GitHub Actions esegue:
   - `npm install` (installa Vite)
   - `npm run build` con `VITE_NASA_API_KEY` dai Secrets
   - Upload dell'artifact `dist/`
   - Deploy via `actions/deploy-pages@v4`
3. Il sito è live su `xaviershayne35-tech.github.io/MacOS-Portfolio/`

### Configurazione richiesta (una tantum)

1. **Settings → Pages** del repo:
   - Source: **GitHub Actions**
2. **Settings → Secrets and variables → Actions**:
   - Aggiungi `VITE_NASA_API_KEY` con la tua chiave NASA
3. **Settings → Environments → `github-pages`**:
   - Deployment branches: aggiungi `main` (o "All branches")

---

## Troubleshooting

### Il sito restituisce 404

- Verifica che **Settings → Pages → Source** sia impostato su **"GitHub Actions"**
- Controlla che il workflow su Actions sia terminato con successo (tab Actions)
- Svuota la cache del browser (`Ctrl+Shift+R` per hard refresh)
- Attendi fino a 5 minuti: la propagazione CDN di GH Pages non è istantanea

### Lo sfondo NASA non appare

- Verifica che il file `.env` esista e contenga `VITE_NASA_API_KEY`
- Controlla la console del browser per errori
- L'API ha rate-limit: se usi `DEMO_KEY`, massimo 30 req/ora

### Vite dà errore "Cannot find package"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build locale non funziona dopo un `git pull`

Stesso fix di sopra: `rm -rf node_modules package-lock.json && npm install`.

---

## 📝 Licenza

MIT © 2026 Emanuele Pio D'Amato

Vedi [LICENSE](LICENSE) per i dettagli.

---

## Crediti

- **Sfondi astronomici**: NASA [APOD API](https://apod.nasa.gov/apod/astropix.html) (pubblico dominio)
- **Ispirazione UI**: macOS Sonoma ([Apple](https://www.apple.com/macos/sonoma/))
- **Font di sistema**: SF Pro (Apple), fallback Segoe UI / Roboto

---

## Contatti

-  Email: emanuelepiodamato35@gmail.com
-  Instagram: [@emanu_damato35](https://www.instagram.com/emanu_damato35/)
-  X: [@PioAmato93520](https://x.com/PioAmato93520)
-  Discord: [discord.com](https://discord.com/)

---

<p align="center">
  <sub>Costruito con ❤︎ e caffè da Emanuele Pio D'Amato</sub>
</p>
