# Pro Putt

Pro Putt is a small web application for tracking golf rounds and club statistics.
It uses Firebase for authentication and data storage and is written as
client‑side ES modules.

## Prerequisites

Because the application imports ES modules in the browser, the files must be
served from a local web server and **not** opened directly from the file system.
You can use any static server. A simple option with Python is:

```bash
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000/home.html` in your browser.

The pages include [Bootstrap](https://getbootstrap.com/) from a CDN for modern styling.

## Firebase configuration

1. Create a Firebase project with Authentication and Firestore enabled.
2. Obtain your project configuration (apiKey, authDomain, projectId, etc.).
3. Create a `.env` file in the project root containing the credentials:

```ini
FIREBASE_API_KEY=<YOUR-API-KEY>
FIREBASE_AUTH_DOMAIN=<YOUR-PROJECT>.firebaseapp.com
FIREBASE_PROJECT_ID=<YOUR-PROJECT>
FIREBASE_STORAGE_BUCKET=<YOUR-PROJECT>.appspot.com
FIREBASE_MESSAGING_SENDER_ID=<SENDER-ID>
FIREBASE_APP_ID=<APP-ID>
FIREBASE_MEASUREMENT_ID=<MEASUREMENT-ID>
```

The `.env` file is ignored by Git. `firebase-config.js` loads these values at
runtime using a small helper so you don't have to commit your secrets.

## Running the app

After starting a local server as described above, open `home.html` to log in with
Google. Once authenticated you can navigate to the other pages using the
navigation links.

## Main pages

- **home.html** – landing page that handles Google authentication and provides
  navigation to the rest of the app.
- **index.html** – start a new round. Choose between manual score entry or
  "live" mode that calculates the hole score from the recorded shots and putts.
- **stats.html** – view personal statistics or those of a friend using
  `?uid=<id>`; shows handicap history and club statistics loaded from Firestore.
- **clubs.html** – record individual club shots and see average distances for
  each club.
- **search.html** – search for other players by name or email and look up golf
  courses saved in Firestore.
- **profile1.html** – manage your profile, clubs and your list of friends stored
  in Firestore.
- **round.html** – display the details of a saved round.
- **admin.html** – create or edit course definitions stored in Firestore.

Course definitions are now stored in a Firestore collection and can be
managed through **admin.html**.

## Navigation Bar

The top navigation links are injected by `navbar.js`. Add the script tag below to any new page before your other JavaScript imports:

```html
<script src="navbar.js"></script>
```

This automatically inserts a Bootstrap styled navigation bar so you don't have to repeat the markup in each file.

## Admin Users

Authorized administrators are stored in a Firestore collection called
`adminUsers`. Each document's ID should be the email address of an admin user.
If the collection does not exist yet, create it in the Firestore console and
add a document with the email of any current admin (for example
`l.m.devirgilio@gmail.com`). The application falls back to this email list if
the collection cannot be read.

## Development

Install dependencies with `npm install`. Lint the codebase using:

```bash
npm run lint
```

Run the Jest test suite with:

```bash
npm test
```
