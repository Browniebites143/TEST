
# Brownie Bite — Orders (Firebase Realtime DB)

This repo contains a simple customer order page and an admin dashboard.

## Files
- `index.html` — customer page (auto total, UPI/COD, order-id popup, tracking)
- `style.css` — styles
- `firebaseConfig.js` — your Firebase keys (already filled)
- `script.js` — client logic for saving orders + UPI deep links
- `thankyou.html` — shows Order ID after ordering
- `login.html` — admin login (username + PIN)
- `admin.html` — admin dashboard (view/update/delete orders)
- `admin.js` — admin logic

## Credentials
- Username: **BROWNIE BITES**
- PIN: **BROWNIEbites@463235_6432**

## Firebase
Realtime Database rules (open so customers can write orders & track status):
```json
{
  "rules": {
    "orders": { ".read": true, ".write": true },
    "admin":  { ".read": "auth != null", ".write": "auth != null" }
  }
}
```
> Later, you can restrict writes to orders via Cloud Functions or CAPTCHA.

Database paths:
- Orders are saved under `/orders/{orderId}`.

## UPI Deep Links
We generate `upi://pay?pa=9380248566@fam&pn=Brownie%20Bite&am={total}&cu=INR&tn={OrderId}`
Buttons for: GPay, PhonePe, Paytm, BHIM, FamPay, Other UPI.
Mobile browsers should open the app if installed; desktop will usually do nothing.

## Deploy
Upload everything to your GitHub Pages repo (root). Ensure `firebaseConfig.js` is included.
Open `index.html` to test. Place an order; check it appears in `admin.html` after login.
