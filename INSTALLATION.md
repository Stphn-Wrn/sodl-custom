# Installation

🇫🇷 [Version française](INSTALLATION.fr.md)

## Before you start

You need:
- Foundry VTT (v11 minimum, tested on v14 stable 7);
- the `demonlord` game system ("Shadow of the Demon Lord") installed;
- GM access to enable the module.

## Install

### Option A — Manifest URL (recommended)

1. On the Foundry setup screen, **Add-on Modules** tab, click **Install Module**.
2. Paste this URL in the **Manifest URL** field at the bottom of the window:
   ```
   https://raw.githubusercontent.com/Stphn-Wrn/sodl-custom/main/module.json
   ```
3. Click **Install**.

With this method, Foundry offers updates automatically.

### Option B — Manual install

Find your `Data` folder:
- **Windows**: `C:\Users\[YourName]\AppData\Local\FoundryVTT\Data`
- **macOS**: `~/Library/Application Support/FoundryVTT/Data`
- **Linux**: `~/.foundryvtt/Data`

Create a `sodl-companion` folder in `Data/modules/` and copy all the module files into it (`module.json` must be at the root of that folder).

## Enable in the world

1. Launch a world that uses the `demonlord` system.
2. **Game Settings → Manage Modules**.
3. Check **"L'Ombre du Seigneur Démon - Companion"**, then save.

> The module only shows up in this list if the world uses a compatible version of the `demonlord` system (see `module.json` → `relationships.systems`).

Once the world reloads:
- the **combat HUD** shows at the bottom of the screen as soon as a token is selected;
- the left toolbar holds the **book** icon (Companion), the **die** icon (Dice Clock) and, for the GM, the **group** icon (party dashboard).

## Settings

In **Game Settings → Configure Settings → L'Ombre du Seigneur Démon - Companion**:

| Setting | Default | Who |
|---|---|---|
| Combat HUD: enable | on | each player |
| Dice Clock: enable, dice, faces, minutes per point, starting hour, sound, final message | on | GM |
| YouTube Player: enable, API key, Invidious instances | off | GM |
| Round reminders: enable | on | GM |
| Hide the system's GM tools (Player Tracker) | on | GM |

The keybinding that switches between the HUD and the macros is set in **Configure Controls**.

The module's language follows Foundry's (**Core Settings → Language**): English or French.

## Update

**Installed from the manifest URL** — **Add-on Modules** tab, **Update** button next to the module.

**Installed manually** — Delete `Data/modules/sodl-companion/`, copy the new version, then reload the world (Ctrl+Shift+R to clear the script cache).

Data is kept across updates:
- **in the world**: Fortune pool, clock state, YouTube library, GM settings;
- **on each account**: HUD layout and favorites;
- **on characters**: portrait crop.

## Uninstall

1. **Manage Modules**: uncheck the module and save.
2. Delete the `sodl-companion` folder.

## Troubleshooting

**The module does not show up in "Manage Modules"**
- Is the folder in `Data/modules/`, with `module.json` at its root?
- Does the world use the `demonlord` system (the ID matters, not the displayed name), at a recent enough version?

**An icon is missing from the left toolbar**
- Refresh (F5, or Ctrl+Shift+R).
- Check that the module, or the tool, is enabled.
- Open the console (F12) to spot a loading error.

**The combat HUD does not show**
- Select a character token (as a player, having a character assigned is enough).
- Check that it is enabled in your settings and not switched to the macros (sword button to bring it back).

**The YouTube widget does not show**
- Enable it in the settings then refresh. For players, it only shows during a broadcast.
- The player loads its API from `youtube.com`: it does not work offline or if YouTube is blocked.

**The GM cannot change the Fortune pool**
- The account needs the **Gamemaster** role (not just elevated permissions).
