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

Then navigate to `http://localhost:8000/src/html/home.html` in your browser.

The pages include [Bootstrap](https://getbootstrap.com/) from a CDN for modern styling.

## Project structure

```
assets/        # images and icons
src/
  html/        # HTML pages
  js/          # JavaScript modules
styles.css     # shared stylesheet
```

## Firebase configuration

1. Create a Firebase project with Authentication and Firestore enabled.
2. Obtain your project configuration (apiKey, authDomain, projectId, etc.).
3. Edit `firebase-config.js` and replace the placeholder configuration with your
   own credentials.

```javascript
export const firebaseConfig = {
  apiKey: "<YOUR-API-KEY>",
  authDomain: "<YOUR-PROJECT>.firebaseapp.com",
  projectId: "<YOUR-PROJECT>",
  storageBucket: "<YOUR-PROJECT>.appspot.com",
  messagingSenderId: "<SENDER-ID>",
  appId: "<APP-ID>"
};
```

## Running the app

After starting a local server as described above, open `src/html/home.html` to log in with
Google. Once authenticated you can navigate to the other pages using the
navigation links.

## Main pages

- **src/html/home.html** – landing page that handles Google authentication and provides
  navigation to the rest of the app.
- **src/html/index.html** – start a new round. Choose between manual score entry or
  "live" mode that calculates the hole score from the recorded shots and putts.
- **src/html/stats.html** – view personal statistics or those of a friend using
  `?uid=<id>`; shows handicap history and club statistics loaded from Firestore.
- **src/html/clubs.html** – record individual club shots and see average distances for
  each club.
- **src/html/search.html** – search for other players by name or email and look up golf
  courses saved in Firestore.
- **src/html/profile1.html** – manage your profile, clubs and your list of friends stored
  in Firestore.
- **src/html/round.html** – display the details of a saved round.
- **src/html/admin.html** – create or edit course definitions stored in Firestore.

Course definitions are now stored in a Firestore collection and can be
managed through **src/html/admin.html**.

## Navigation Bar

The top navigation links are injected by `navbar.js`. Add the script tag below to any new page before your other JavaScript imports:

```html
<script src="../js/navbar.js"></script>
```

This automatically inserts a Bootstrap styled navigation bar so you don't have to repeat the markup in each file.
