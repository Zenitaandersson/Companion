# Companion

A calm memory-support app for a person living with mild-to-moderate Alzheimer's, set up in minutes by a relative or carer. It is a wellbeing and orientation aid, not a medical device.

Companion is an installable web app (PWA). It runs on iPhone and Android from the home screen, works fully offline, and costs nothing to build or host. The same code can later be wrapped with Capacitor for the App Store and Google Play.

## Two modes

- **Person mode** opens by default. Six screens: Today, People, My day, Questions, My life, Help. Every screen has the same "Back to Today" bar at the bottom. No menus, tabs, swipes, modals or timeouts.
- **Carer mode** is reached from a small, quiet "For carers" link under the Today bar, then a four-digit PIN. The PIN is the protection, so the entry is visible rather than hidden. A wrong PIN clears silently with no lockout, and the PIN screen has the same large "Back to Today" button as every other screen. All configuration and all permission requests live here.

## Architecture

```
src/
  app/            App root, live data hooks, clock
  data/           Types and the Dexie (IndexedDB) database
  design/         Tokens, Person-mode components (Screen, BigButton, CalmFallback)
  features/
    person/       One file per Person-mode screen, plus PersonRoot (navigation + reminders)
    carer/        PIN gate, onboarding, one editor per section, weekly summary, install guide
  i18n/           English and Swedish string catalogues
  services/       Pure logic: schedule, dynamic text, time words, speech, recorder, images, location, PIN
```

- **State**: React with plain enum navigation. No router, so no browser history or gestures in Person mode.
- **Storage**: Dexie over IndexedDB. Photos and voice recordings are stored as Blobs next to their text. Nothing leaves the device.
- **Speech**: the carer's recording when present, otherwise the phone's built-in voice via the Web Speech API. Recordings are never used for answers that contain dynamic placeholders, so they cannot go stale.
- **Reminders**: `services/schedule.ts` decides when a step is due. A reminder shows as a calm banner, repeats at most three times, never after 90 minutes, and never says "missed". In this phase reminders sound only while the app is open.
- **Dynamic answers**: `{time} {day} {date} {next} {name} {home}` are filled by `services/dynamicText.ts`. Unknown placeholders are left as written.
- **Text size**: the root font uses `-apple-system-body`, so the whole layout follows the iPhone's Dynamic Type setting. Android follows the browser text size.
- **Future assistant**: every fact the person can see is a carer-written text field. A later assistant can be grounded on those fields alone, which is why no rich or free-form content exists in the model.

## Setup

```
npm install
npm run dev        # http://localhost:5173, also reachable from a phone on the same Wi-Fi
npm test           # unit tests (schedule, dynamic text, database) and a Today screen UI test
npm run build      # production build in dist/
```

Node 20 or newer. No other tooling.

## Deploying for free

Any static host works. For GitHub Pages under `https://<user>.github.io/<repo>/`:

```
VITE_BASE=/<repo>/ npm run build
```

then publish `dist/`. Open the URL on the phone, use Share → Add to Home Screen (iPhone) or Install app (Android).

Do the setup inside the home-screen app. On iOS, a page open in Safari and the home-screen app keep separate storage, so setup done in a Safari tab does not appear in the installed app.

## Privacy

No accounts, no analytics, no third-party services, no network calls after the first load. Data stays in the browser's storage on the device. Location is captured only when the carer switches it on and only when the Help button is pressed, and is stored locally.

## Roadmap

1. Remote sync between a carer's phone and the person's phone with a pairing code.
2. Background reminders through web push or the native wrap.
3. Store listing and native wrap with Capacitor.
