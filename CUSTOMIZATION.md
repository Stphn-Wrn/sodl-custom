# Customization

🇫🇷 [Version française](CUSTOMIZATION.fr.md)

## Texts and rules

Every text of the module lives in `lang/en.json` and `lang/fr.json`, under the `SODL` key:

| Section | Content |
|---|---|
| `SODL.Rules` | Rules reference: afflictions, actions, melee/ranged options, other attacks, situational rules, out of combat, madness, corruption, incantations, Fortune |
| `SODL.Companion` | Companion interface |
| `SODL.Hud` | Combat HUD |
| `SODL.Dashboard`, `SODL.Reminders` | Party dashboard and round reminders |
| `SODL.DiceClock`, `SODL.Youtube` | Dice clock and YouTube player |
| `SODL.Settings` | Setting names and hints |

To fix a rule, edit its text **in both files**: the companion, the HUD and the chat messages all pick it up. Both files must always have exactly the same keys.

`src/features/companion/config.js` only holds the structure of the rules reference (lists, tables, maximum Fortune), with translation keys instead of texts. `localizedConfig(t)` returns the translated version.

### Adding an affliction

Afflictions must exist in the `demonlord` system: their `id` is the system status id (`prone`, `blinded`, `impaired`...).

1. In `config.js`, add `{ id: "myid", name: "SODL.Rules.Afflictions.List.Myid.Name", description: "SODL.Rules.Afflictions.List.Myid.Description" }` to `afflictions.list`.
2. Add both texts to `lang/en.json` and `lang/fr.json`.

It then shows up in the companion, the search, the HUD Afflictions tab, the round reminders and the party dashboard.

### Adding a search category

In `buildSearchIndex()` (`src/features/companion/companion-app.js`):
```javascript
addAll("MyCategory", config.myNewList.list);
```
with a `SODL.Companion.Categories.MyCategory` key in the language files. Each entry has a `name` and a `description`.

## Fortune pool

It is a **shared world setting**, not a per-character value:
- `sodl-companion.chancePoints`: current pool;
- `sodl-companion.maxChancePoints`: maximum, editable by the GM in the companion.

`resources.chancePoints.maximum` in `config.js` is only the starting value of the maximum. The pool is visible and editable by the GM only (companion and party dashboard); players announce their spending from the HUD Fortune tab.

## Combat HUD

The code lives in `src/features/combat-hud/`:

| File | Role |
|---|---|
| `actor-adapter.js` | Only file aware of the `demonlord` actor structure; builds a normalized view (`toSnapshot`) |
| `sections.js` | The tabs: each has an `id`, a `label` (translation key), an `icon` and a `build(snapshot, view, t)` method returning its tiles |
| `action-executor.js` | One function per action type (`ACTION_STRATEGIES`), delegating to the system rolls |
| `equipment-rules.js` | Strict equipment rules (hands, armor, shield) |
| `customization.js` | Edit mode: order, hiding, favorites |
| `combat-hud.js`, `combat-hud.html`, `combat-hud.css` | Rendering and interactions |

### Adding a tab

1. In `sections.js`, create an object `{ id, label: "SODL.Hud.Tabs.MyTab", icon, build(snapshot, view, t) }` returning tiles (`entry({ id, name, badge, action })`).
2. Add it to `SECTIONS_BY_ACTOR_TYPE` (characters and/or creatures).
3. If its tiles trigger a new action, add it to `ACTION_STRATEGIES` in `action-executor.js`.
4. Add the label key to the language files, and a test in `tests/combat-hud/sections.test.js`.

A new tab automatically appears at the end of the list for players who already customized their HUD.

### Stored data

- `combatHudEnabled` and `combatHudLayout`: stored per user (v12+); `combatHudLayout` holds the open tab, the mode, the height, the layout (`custom`) and the favorites per character (`favorites`).
- `flags.sodl-companion.portraitFrame` on the actor: portrait crop, shared by everyone.

### Colors

CSS variables at the top of `combat-hud.css`, on `.sodl-hud` (`--hud-bg`, `--hud-title`, `--hud-accent`...). Health state colors are on `.sodl-hud-state-full`, `-hurt`, `-injured` and `-incapacitated`, and are reused by the party dashboard.

## Party dashboard and round reminders

- `src/features/party-dashboard/`: `party-row.js` prepares one row per player character (tested), `party-dashboard-app.js` handles the window. Hiding the system GM tools is done in its `register.js`.
- `src/features/round-reminders/`: `reminders.js` builds the reminders (tested), `register.js` whispers them to the GM on every new round.

## Dice Clock

Everyday settings are in the module settings. The rest lives in `src/features/dice-clock/`:
- **GM buttons**: `dice-clock.html` for display, `activateListeners()` in `dice-clock-app.js` for the action;
- **chat messages**: `_removeOnePoint()` and `resetClock()` in `dice-clock-manager.js`, texts in `SODL.DiceClock.Chat`;
- **default sound**: `sounds/vecna-clock.mp3`;
- **look**: `dice-clock.css`.

## YouTube Player

The code lives in `src/features/youtube-player/`.

- **Colors**: CSS variables at the top of `youtube-player.css`, on `.yt-widget`.
- **Default position and size**: `_loadLayout()` in `widget.js`.
- **Sync**: `SYNC_TOLERANCE` (`broadcast.js`, 2 s) is the drift beyond which a player is resynced; `SYNC_INTERVAL_MS` (`widget.js`, 1 s) the check frequency.
- **Search**: `search.js` defines one provider per service (YouTube Data API when a key is set, Invidious otherwise). To add a service, write a provider exposing `search(text)` and plug it into `createSearchProvider`. `SEARCH_RESULTS_LIMIT` sets the number of results.
- **Link formats**: add a function to `PARSING_STRATEGIES` in `url-parser.js`.
- **Data**: `youtubeLibrary` and `youtubeBroadcast` (world), `youtubeVolume` and `youtubeWidgetLayout` (each user).

## Adding a tool

Each tool is a folder in `src/features/` whose `register.js` exports the steps it needs:

```javascript
import { MODULE_ID } from "../../shared/constants.js";
import { t } from "../../shared/foundry-adapter.js";

export const myToolFeature = {
  init() {
    game.settings.register(MODULE_ID, "myToolEnabled", {
      name: "SODL.Settings.MyToolEnabled.Name",
      hint: "SODL.Settings.MyToolEnabled.Hint",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  },
  ready() {},
  getSceneControlButtons(controls) {}
};
```

Then add it to `FEATURES` in `src/main.js`, and its stylesheet to `styles` in `module.json`.

Conventions:
- templates referenced with `modulePath(...)` (`src/shared/constants.js`);
- Foundry APIs that change between versions: go through `src/shared/foundry-adapter.js`;
- pure logic (no `game` or `ui`) in separate files, tested with `npm test`;
- no hard-coded text: everything goes through the language files.

## Translation

- In a template: `{{localize "SODL.My.Key"}}`, or with variables `{{localize "SODL.My.Key" name=value}}`.
- In Foundry code: `t("SODL.My.Key", { name: value })` from `src/shared/foundry-adapter.js`.
- In pure code: take `t` as a parameter, and throw a `LocalizedError(key, data)` (`src/shared/i18n.js`) instead of a text.
- Setting names and hints: put the key directly, Foundry translates it when displaying.

Tests use `lang/fr.json` (`tests/helpers/i18n.js`): their expectations are in French.

## Testing

```bash
npm test
```

Pure logic tests live in `tests/`, organized by tool like `src/features/`. They also run on GitHub on every push, and before each release.

In Foundry, test with a GM account and a player account (for example in two browsers): Fortune pool hidden for players, read-only clock, YouTube broadcast mirrored, HUD and favorites specific to each player. After changing JavaScript, reload with Ctrl+Shift+R: modules are cached by the browser.
