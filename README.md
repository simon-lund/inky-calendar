# Inky calendar

A black-and-white month calendar you draw on. Made for a touchscreen on the wall or a tablet on a stand: scribble on the days, tap the eraser, flip months. Optionally shows the events from a Google Calendar (or any iCal feed) underneath.

- **Draw** with finger, pen or mouse. Pen, eraser, undo, clear-month.
- **Drawings are saved per month** on the machine that hosts it, so every screen that opens it shows the same calendar.
- **Events** (optional): repeating events, all-day and multi-day events are shown. Refreshes every 15 minutes.
- **Wall mode**: stays awake, fullscreen button, jumps back to the current month after 5 minutes without a touch, rolls over at midnight.

No accounts, no login. Anyone who can reach the page can draw on it, so host it on your home network.

## Run it

Needs Node 22.13 or newer. Nothing native to compile (it uses Node's built-in SQLite).

```bash
pnpm install
pnpm build
pnpm start
```

Open `http://<this-machine>:3000` on the touchscreen. Use `PORT=8080 pnpm start` for another port.

Drawings live in `calendar.db` next to the app. Back that file up and you have backed up everything.

## Show your events

Tap the gear in the top right and paste an iCal link. In Google Calendar: Settings → your calendar → Integrate calendar → **Secret address in iCal format**. The link is remembered by that screen's browser. Leave it empty for a plain drawing calendar.

To set one feed for every screen instead, start the server with it:

```bash
INKY_ICAL_URL="https://calendar.google.com/…/basic.ics" pnpm start
```

(See `.env.example`.) Treat that link like a password.

## Put it on a touchscreen

- **Chromium / Chrome kiosk** (Raspberry Pi, old laptop): `chromium --kiosk http://<host>:3000`
- **Tablet**: open the page, then "Add to Home Screen" and launch it from there for a full-screen app.
- **Start on boot**: run `pnpm start` as a systemd service, or with any process manager.

## Static demo

`INKY_DEMO=1 pnpm build` makes a server-less copy in `out/` (example events, drawings kept in the visitor's browser). Set `BASE_PATH=/some/path` if it is hosted in a sub-folder. Serve `out/` with any static file server.
