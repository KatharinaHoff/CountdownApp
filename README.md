# Countdown til Misery ends

<p align="center"><img src="assets/app.png" width="200" alt="App screenshot" /></p>

---

## What this does

Every day you open the page, you see how many calendar and working days are left until a target date you set. That's the core.

On top of that, three things happen in the background:

**1. Holiday-aware working day count**
The page fetches public holidays for Mecklenburg-Vorpommern from a live API and subtracts them from the working day count, so the number reflects actual days you have to show up.

**2. AI-generated daily trait**
Each page load calls a local server, which sends a prompt to a large language model (Gemma 3, 27B) asking it to invent a fresh, darkly funny description of an unreliable person. The sentence *"After this, you will no longer have trouble with ___"* is completed differently every single day. While the LLM thinks, a pulsing placeholder is shown. If the server is not running, it falls back silently to a list of 365 pre-written traits.

**3. On-demand image generation**
Two buttons let you generate an image on the spot - one positive (freedom, relief, escape), one negative (workplace chaos, explosions, collapsing towers). A random prompt is picked from a curated list and sent to a FLUX image model. The image appears on the page without reloading.

All AI calls go through a local Node.js server (`server.ts`) that keeps your API token hidden from the browser.

---

## Configuring content

| What | Where |
|---|---|
| Target date | `config.js` - change the date on the first line |
| LLM trait prompt | `server.ts` - the `system` message inside `/api/trait` |
| Image prompts | `data/prompts.js` - edit `positivePrompts` and `negativePrompts` |
| Fallback traits (365) | `data/traits.js` |

---

## Setup instructions (for complete beginners)

### What you need

- A computer with internet access
- A terminal:
  - **Windows:** press `Win + R`, type `cmd`, hit Enter
  - **Mac:** press `Cmd + Space`, type `Terminal`, hit Enter
  - **Linux:** you know what you're doing

---

### Step 1 - Install nvm and Node.js

**nvm** is a tool that installs and manages Node.js (the engine that runs the server).

Open your terminal and run these two commands, one after the other:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

**Then close your terminal and open a new one** (this is required for nvm to be available), and run:

```bash
nvm install node
```

> **Windows users:** the commands above don't work on Windows. Use [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) instead - download and run the installer, then open a new terminal and run `nvm install latest`.

To confirm it worked:

```bash
node --version
```

You should see a version number like `v25.x.x`.

---

### Step 2 - Get your API token

The image generation feature needs an API token from the University of Greifswald AI hub.

1. **Log in first.** Go to **[apphub.wolke.uni-greifswald.de](https://apphub.wolke.uni-greifswald.de)** and click **Login** in the top right corner. Sign in with your university account via Shibboleth (the usual university login page).

2. **Get your token.** After logging in, go to **[apphub.wolke.uni-greifswald.de/ai/access](https://apphub.wolke.uni-greifswald.de/ai/access)**. Your token is shown there - it looks like a long string of random characters. Copy it.

> If no token exists yet, the page will generate one for you automatically.

---

### Step 3 - Download this project

Either clone it with git:

```bash
git clone https://github.com/YOUR_USERNAME/CountdownTilMiseryEnds.git
cd CountdownTilMiseryEnds
```

Or download it as a ZIP from GitHub (green **Code** button → **Download ZIP**), unzip it, and open the folder in your terminal:

```bash
cd path/to/CountdownTilMiseryEnds
```

---

### Step 4 - Paste your token

Open the file called `.env` in the project folder with any text editor (Notepad, TextEdit, VS Code - anything).

It looks like this:

```
API_TOKEN=paste_your_token_here
```

Replace `paste_your_token_here` with the token you copied in Step 2. Save the file.

> **Important:** never share this file or commit it to git. It is already listed in `.gitignore` so git will ignore it automatically.

---

### Step 5 - Install dependencies

In your terminal, inside the project folder, run:

```bash
npm install
```

This downloads everything the project needs. It may take a minute. You only need to do this once.

---

### Step 6 - Start the server

```bash
npm start
```

You should see:

```
Running on http://localhost:3000
```

---

### Step 7 - Open the page

Open your browser and go to:

```
http://localhost:3000
```

That's it. The countdown is running and the image buttons are ready.

---

### Adjusting the target date

Open `config.js` in the project folder and change the date on this line:

```js
const targetDate = new Date("2026-06-30");
```

Use the format `YYYY-MM-DD`. Save the file and reload the browser.

---

### Stopping the server

Go back to the terminal and press `Ctrl + C`.

---

### Restarting the server

**If the terminal is still open** (server running in foreground):

Press `Ctrl + C` to stop it, then run:

```bash
npm start
```

**If the server is running in the background** (no terminal open):

```bash
pkill -f "server.ts" && npm start >> server.log 2>&1 &
```

After any restart, reload the browser tab.

---

### Auto-start on boot (optional)

If you want the server to start automatically every time your computer boots, first make sure you're inside the project folder in your terminal, then run these commands once:

```bash
PROJECT_DIR=$(pwd)
chmod +x "$PROJECT_DIR/start.sh"
(crontab -l 2>/dev/null; echo "@reboot $PROJECT_DIR/start.sh") | crontab -
```

To verify it was registered:

```bash
crontab -l
```

You should see a line starting with `@reboot`.

The server will now start on its own after every reboot. Logs are written to `server.log` in the project folder - check them if something seems off:

```bash
cat "$PROJECT_DIR/server.log"
```

To remove the auto-start later:

```bash
crontab -e
```

Delete the `@reboot` line, save, and close.

---

## Deploying to the web with Railway (free)

[Railway](https://railway.app) can host this app publicly for free, with no server to manage.

### Prerequisites

- The project must be pushed to a GitHub repository.
- Your `.env` file must **not** be committed (it is already excluded by `.gitignore`). You will add the token directly in Railway instead.

### Steps

1. **Create a Railway account** at [railway.app](https://railway.app) and sign in with GitHub.

2. **Create a new project:** click **New Project → Deploy from GitHub repo**, then select this repository.

3. **Add your API token:** in the Railway project dashboard, go to your service → **Variables** tab → **New Variable**, and add:

   ```
   API_TOKEN=your_token_here
   ```

   Railway injects this as an environment variable at runtime, exactly like your local `.env` file.

4. **Done.** Railway detects Node.js automatically, runs `npm install` and `npm start`, and gives you a public URL like `https://your-app.up.railway.app`.

### Notes

- Railway sets the `PORT` environment variable automatically. The server already reads `process.env.PORT`, so no changes are needed.
- Any push to your GitHub `main` branch will automatically trigger a redeploy.
- Logs are visible in the Railway dashboard under the **Deployments** tab.
- The free tier includes 500 hours/month of runtime, which is enough for continuous use on a single hobby project.

---

Created entirely in my free time as a self-directed learning project. My employer is the University of Greifswald, which operates the AI hub used here - this project was my way of figuring out how to work with their API. It was not part of my job, not assigned, and not done on work time. If you find it useful or entertaining, feel free to use it.

Katharina Hoff