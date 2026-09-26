# Shadow of the Demon Lord - Companion Module

🇫🇷 [Version française](README.fr.md)

Foundry VTT companion module for **Shadow of the Demon Lord**: combat HUD, shared Fortune pool, rules reference, GM party dashboard, round reminders, dice clock and synced YouTube player.

**Compatibility:** Foundry VTT v11+ (tested on v14 stable 7) | `demonlord` system v6.1.0+

**Languages:** English and French, following the language set in Foundry (*Settings → Configure Settings → Core Settings → Language*).

## Features

### Combat HUD
- **Replaces the macros and player list** — The HUD takes the bottom of the screen for the controlled token (or the player's character). A button, or a keybinding you set in the controls, switches between the HUD and the default interface.
- **Left side** — Portrait (click to crop it), Health (-1/+1), Insanity and Corruption (-1/+1, click Corruption for its roll), Defense, Speed, Power, healing rate (click to Recover), fast/slow turn and active afflictions.
- **Health state colors** — Unhurt (green), Hurt (yellow), Injured from half Health (orange), Incapacitated (red, greyed portrait).
- **Tabs** — Attacks, Equipment (weapons, protection, ammunition), Spells (by tradition), Talents, Items, Attributes and Professions, Actions, Fortune, Afflictions, Effects.
- **Roll panel** — An attack, a challenge or an attack spell opens a small panel above the HUD: boons/banes and modifier, then Roll or Cancel. The roll goes through the `demonlord` system (afflictions, ammunition, uses).
- **Strict equipment** — Two hands and one armor: equipping a two-handed weapon, a shield or another armor stows whatever conflicts. Unmet requirements are flagged.
- **Spells and talents** — Remaining castings and uses are shown; hover -/+ to restore or remove one.
- **Fortune** — The uses of Fortune: a click announces the spending and its rule in chat. The GM also sees the group pool and adjusts it; players do not see the total.
- **Actions and afflictions** — Clicking an action, or an affliction's (i), sends its rule to chat.
- **Effects** — Temporary effects (blessings, active spells...): toggle, delete, create.
- **Tools** — Character sheet, dice roller (d2 to d100, 1 to 8 dice), 8 h / 24 h rest.
- **Personal setting** — Each player and the GM enable it for themselves, without reloading. Height, mode and open tab are remembered.

### Party dashboard (GM)
- Every player character at a glance: colored Health (-1/+1), Defense, Speed, Insanity, Corruption, fast/slow turn, afflictions and the Fortune pool.
- Click the name for the character sheet; the crosshair selects and centers the token.

### Round reminders (GM)
- On every new round, the GM gets a whisper: fate rolls to make, active afflictions and expiring effects. Can be turned off in the settings.

### SODL Companion
- **Shared Fortune pool** — One pool for the whole group. Only the GM sees and edits the total.
- **Rules reference** — Afflictions, actions, melee/ranged options, situational rules, out of combat, madness, corruption, incantations (with the castings table by Power/Rank), extended uses of Fortune.
- **Instant search** — Filters all the content by keyword.

### Dice Clock
- **Dice-based countdown** driven by the GM: every full hour rings a chime and posts a chat message.
- **Configurable** — Number of dice, faces, minutes per point, starting hour, sound and final message.

### YouTube Player
- **Synced broadcast** — The GM starts a video and everyone watches it together (pause, resume and seeking included).
- **Search and library** — YouTube search or pasted links, folder library with drag and drop.
- **Floating widget** — Movable, resizable, collapsible into a pill. Disabled by default.

## Installation

In Foundry: *Add-on Modules → Install Module*, then paste the manifest URL:

```
https://raw.githubusercontent.com/Stphn-Wrn/sodl-custom/main/module.json
```

Then enable the module in your world. It only shows up in the list if the world uses the `demonlord` system. See `INSTALLATION.md` for a manual install.

## Usage

- **Combat HUD** — Select a token: the HUD shows at the bottom of the screen. The grid button hides it in favor of the macros; the sword button brings it back.
- **Companion** — **Book** icon in the left toolbar.
- **Dice Clock** — **Die** icon in the left toolbar.
- **Party dashboard** — **Group** icon in the left toolbar (GM only).
- **YouTube Player** — Enable it in the module settings, then refresh. The widget's **folder** icon shows the search and library; clicking a video starts it for everyone.

YouTube search works out of the box through public [Invidious](https://invidious.io) instances, which are sometimes down. For reliable search, set a **YouTube Data API v3** key in the settings. This key is visible to connected players: restrict it to the YouTube Data API in the Google console.

## Customization

- **Texts and rules** — Every text, including the rules reference, lives in `lang/en.json` and `lang/fr.json` (`SODL.Rules` section for the rules). `src/features/companion/config.js` only holds the structure and the keys.
- **Default maximum Fortune** — `resources.chancePoints.maximum` in `config.js`; the GM then adjusts it from the companion.
- **Styles** — Each tool has its stylesheet in its own folder.

See `CUSTOMIZATION.md` for more details.

## Structure

```
sodl-companion/
├── module.json
├── lang/                     # English and French texts
├── src/
│   ├── main.js               # Entry point: init / ready / buttons of each tool
│   ├── shared/               # Constants, Foundry compatibility, translation
│   └── features/
│       ├── combat-hud/       # Combat HUD
│       ├── party-dashboard/  # Party dashboard (GM)
│       ├── round-reminders/  # Round reminders (GM)
│       ├── companion/        # Rules reference, search and Fortune pool
│       ├── dice-clock/       # Dice Clock
│       └── youtube-player/   # Synced YouTube player
├── tests/                    # Pure logic tests (npm test)
└── sounds/                   # Clock chime
```

## Accessing the data

The main classes are exposed on `window` for macros and the console.

```javascript
// Fortune pool (shared world setting; changes are GM only)
SODLDataManager.getChancePoints();
await SODLDataManager.modifyChancePoints(+1);

// Dice Clock
SODLDiceClockManager.getState();            // { remaining, hour }
await SODLDiceClockManager.removePoints(1);

// YouTube Player
await SODLYoutubeBroadcast.start(SODLYoutubeManager.getLibrary().videos[0]);
await SODLYoutubeSearch.query("tavern music");

// Combat HUD and party dashboard
SODLCombatHud.toggleMode();
new SODLPartyDashboard().render(true);
```

## Development

The logic that does not depend on Foundry is covered by Node tests (v22+), with nothing to install:

```bash
npm test
```

Tests run on GitHub on every push, and a release is not published if they fail. `tests/` and `package.json` are excluded from the release archive.

## Troubleshooting

**The module does not show up in the world's module list**
- Check that the world uses the `demonlord` system, at least at the minimum version declared in `module.json`.

**An icon is missing from the left toolbar**
- Refresh (F5) and check that the module, or the tool, is enabled.
- Open the console (F12): an error while loading prevents the buttons from being added.

**The combat HUD does not show**
- Select a character token (or, as a player, have a character assigned).
- Check that it is enabled in your module settings and not switched to the macros.

**The YouTube widget does not show**
- It is disabled by default. For players, it only shows during a broadcast.

**The video does not start for a player**
- If the browser blocks autoplay, a **"Join the broadcast"** button appears.
- Some videos cannot be embedded outside YouTube: pick another one.

**YouTube search returns nothing**
- Set a YouTube Data API v3 key, or change the Invidious instances in the settings. Pasting a link always works.

## License

Code under the MIT license. *Shadow of the Demon Lord* is a trademark of Schwalb Entertainment; this module is an unofficial fan project. The summarized rules remain the property of their authors.
