# Goldbase Merchant Portal

2-page static website: Login + Update Rates. No build step needed (plain HTML/CSS/JS, Firebase via CDN).

## Files
- `index.html` + `login.js` — Merchant login (email/password via Firebase Auth)
- `update.html` + `update.js` — Shows merchant's products, lets them edit buy/sell price, confirms with `priceUpdateKey` via modal, then calls backend
- `firebase-config.js` — Firebase project config + backend URL (shared by both pages)
- `style.css` — Shared styling

## How login → update flow works
1. Merchant logs in with email/password (Firebase Auth).
2. `merchantUsers/{uid}` doc is read to find `merchantId`.
3. `merchantId` stored in `sessionStorage`, redirect to `update.html`.
4. `update.html` reads `merchants/{merchantId}` (shop name) and `merchants/{merchantId}/products` (public read, per your security rules).
5. Merchant edits prices, clicks Save → modal asks for verification code (`priceUpdateKey`).
6. On confirm, sends `{ idToken, priceUpdateKey, products }` to:
   `POST https://data-server-axhf.onrender.com/merchant/update-prices`
7. Backend verifies idToken + priceUpdateKey (against `merchants/{merchantId}/private/verification`) and updates Firestore.

## Deploy to GitHub Pages
1. Push this folder's contents to a GitHub repo (root, or a `/docs` folder).
2. Repo → Settings → Pages → Source: select the branch/folder you pushed to.
3. Your site will be live at `https://<username>.github.io/<repo>/`.
4. Share `https://<username>.github.io/<repo>/index.html` with merchants as the login link.

## Onboarding a new merchant (manual, as planned)
1. Firebase Console → Authentication → Add user (email + password).
2. Firestore → `merchantUsers/{uid}` → create doc with field `merchantId: "<their merchant doc id>"`.
3. Firestore → `merchants/{merchantId}/private/verification` → create doc with field `priceUpdateKey: "<their secret code>"`.

## Later: moving to Firebase Hosting
Once Blaze billing issue is resolved, you can run `firebase init hosting` in this folder and deploy with `firebase deploy --only hosting` — no code changes needed since it's already static files.
